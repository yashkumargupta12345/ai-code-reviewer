from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from reviewer import review_code
import httpx
import hmac
import hashlib
import os
import requests
import json
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, save_review, get_all_reviews, is_already_reviewed

load_dotenv()

app = FastAPI()

# Server start hone pe database tables banao
@app.on_event("startup")
async def startup():
    init_db()
    print("🚀 Server started — Database ready!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET")

# Already reviewed PRs track karo — duplicate comments rokne ke liye
reviewed_prs = set()


# ─── Helper: GitHub PR ka code diff fetch karo ────────────────────────────────
async def get_pr_diff(repo_full_name: str, pr_number: int) -> str:
    url = f"https://api.github.com/repos/{repo_full_name}/pulls/{pr_number}"

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3.diff"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, headers=headers)

    if response.status_code == 401:
        raise Exception("❌ GitHub Token invalid hai — .env check karo!")

    if response.status_code == 404:
        raise Exception("❌ Repo ya PR nahi mila — permissions check karo!")

    if response.status_code != 200:
        raise Exception(f"❌ GitHub API error: {response.status_code}")

    return response.text


# # ─── Helper: GitHub PR pe comment post karo ───────────────────────────────────
def post_github_comment(repo_full_name: str, pr_number: int, review: dict):
    url = f"https://api.github.com/repos/{repo_full_name}/issues/{pr_number}/comments"

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    bugs_text = ""
    for bug in review.get("bugs", []):
        bugs_text += f"- **`{bug['line']}`**\n  - ❌ Issue: {bug['issue']}\n  - ✅ Fix: {bug['fix']}\n\n"

    security_text = ""
    for sec in review.get("security_issues", []):
        security_text += f"- **`{sec['line']}`**\n  - ⚠️ Risk: {sec['issue']}\n  - ✅ Fix: {sec['fix']}\n\n"

    improvements_text = ""
    for imp in review.get("improvements", []):
        improvements_text += f"- 💡 {imp['suggestion']}\n"

    rating_emoji = {
        "good": "✅",
        "needs_work": "⚠️",
        "critical": "🚨"
    }.get(review.get("rating", "needs_work"), "⚠️")
    
    # Severity score emoji
    score = review.get("severity_score", 5)
    if score <= 3:
        score_emoji = "🟢"
    elif score <= 6:
        score_emoji = "🟡"
    elif score <= 8:
        score_emoji = "🟠"
    else:
        score_emoji = "🔴"

        # Severity score emoji
    score = review.get("severity_score", 5)
    if score <= 3:
        score_emoji = "🟢"
    elif score <= 6:
        score_emoji = "🟡"
    elif score <= 8:
        score_emoji = "🟠"
    else:
        score_emoji = "🔴"

    # Merge recommendation emoji
    merge = review.get("merge_recommendation", "request_changes")
    merge_emoji = {
        "approve": "✅ Approve",
        "request_changes": "⚠️ Request Changes",
        "block": "🚫 Block — Do Not Merge!"
    }.get(merge, "⚠️ Request Changes")
    
    # PR Size section
    size_info = review.get("pr_size", {})
    size_section = ""
    if size_info:
        size_section = f"**PR Size:** {size_info.get('emoji', '🟡')} `{size_info.get('size', 'unknown').upper()}` ({size_info.get('total_lines', 0)} lines changed)\n"
        if size_info.get('warning'):
            size_section += f"\n> ⚠️ **Warning:** {size_info.get('warning')}\n"

    comment_body = f"""## 🤖 AI Code Review

**Summary:** {review.get('summary', 'N/A')}

**Rating:** {rating_emoji} `{review.get('rating', 'N/A').upper()}`
{size_section}

**Severity Score:** {score_emoji} `{score}/10`
**Merge Status:** {merge_emoji}

# ---

# ### 🐛 Bugs Found
{bugs_text if bugs_text else "No bugs found! ✅\n"}
# ### 🔐 Security Issues
{security_text if security_text else "No security issues found! ✅\n"}
# ### 💡 Improvements
{improvements_text if improvements_text else "Looks clean!\n"}

# ---

# ### 📝 Overall Feedback
{review.get('overall_feedback', 'N/A')}

# ---
# *Reviewed by AI Code Reviewer 🤖 | Powered by Groq + Llama 3*
# """

    response = requests.post(url, headers=headers, json={"body": comment_body})

    if response.status_code == 201:
        print("✅ Comment posted successfully!")
    else:
        print(f"⚠️ Comment post failed: {response.status_code} — {response.text}")

    return response.status_code


# # ─── Helper: Webhook signature verify karo ────────────────────────────────────
def verify_signature(payload: bytes, signature: str) -> bool:
    if not WEBHOOK_SECRET:
        return True

    expected = "sha256=" + hmac.new(
        key=WEBHOOK_SECRET.encode(),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


# # ─── Background Task: Heavy kaam yahan hoga ───────────────────────────────────
async def process_pr(repo_full_name: str, pr_number: int):
    try:
        print(f"\n📬 Processing PR #{pr_number} from {repo_full_name}")

        # Diff fetch karo
        diff = await get_pr_diff(repo_full_name, pr_number)

        # Empty diff check
        if not diff.strip():
            print("⚠️ Empty diff — skipping review")
            return

        # AI review
        print("🧠 AI reviewing code...")
        review = review_code(diff)  

        # Comment post karo
        print("💬 Posting comment...")
        post_github_comment(repo_full_name, pr_number, review)
        # Database mein save karo
        save_review(repo_full_name, pr_number, review)

    except Exception as e:
        print(f"💥 Error processing PR #{pr_number}: {e}")


# # ─── Main Webhook Route ────────────────────────────────────────────────────────
@app.post("/webhook")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.body()

    event_type = request.headers.get("X-Github-Event", "")

    # Ping — webhook setup test
    if event_type == "ping":
        print("🔔 Ping received — webhook connected!")
        return {"message": "Webhook connected successfully! 🎉"}

    # Sirf pull_request events handle karo
    if event_type != "pull_request":
        return {"message": f"Ignored event: {event_type}"}

    data = json.loads(payload)

    action = data.get("action")

    # Sirf open ya update pe review karo
    if action not in ["opened", "synchronize"]:
        return {"message": f"Ignored action: {action}"}

    pr = data.get("pull_request", {})
    pr_number = pr.get("number")
    repo_full_name = data["repository"]["full_name"]
    pr_title = pr.get("title", "Unknown")

    # Duplicate check — same PR dobara review mat karo
    # Database se check karo
    if is_already_reviewed(repo_full_name, pr_number):
        print(f"⏭️ Already reviewed — skipping")
        return {"message": "Already reviewed"}
    print(f"🆕 New PR: #{pr_number} — {pr_title}")

    # Background mein process karo
    background_tasks.add_task(process_pr, repo_full_name, pr_number)

    return {"message": "Review started!", "pr": pr_number}


# # ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "AI Code Reviewer is running! 🤖",
        "status": "healthy",
        # "reviewed_prs_count": len(reviewed_prs)
    }
    
    
# # ─── Stats Route — Frontend ke liye ──────────────────────────────────────────
@app.get("/stats")
async def get_stats():
    reviews = get_all_reviews()
    return {
        "total_reviewed": len(reviews),
        "reviewed_prs": [f"{r['repo_name']}#{r['pr_number']}" for r in reviews],
        "reviews": reviews,
        "status": "healthy"
    }