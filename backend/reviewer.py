from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Diff bahut bada ho toh trim karo
MAX_DIFF_CHARS = 3000

def detect_language(diff: str) -> str:
    """
    Code diff dekh ke language automatically detect karo
    """
    # Python signs
    if "def " in diff or "import " in diff or ".py" in diff:
        return "python"
    
    # JavaScript signs
    elif "const " in diff or "function " in diff or ".js" in diff:
        return "javascript"
    
    # TypeScript signs
    elif "interface " in diff or ".ts" in diff:
        return "typescript"
    
    # Java signs
    elif "public class" in diff or "void " in diff or ".java" in diff:
        return "java"
    
    # Kuch samajh nahi aaya
    else:
        return "general"


def analyze_pr_size(diff: str) -> dict:
    """
    PR kitna bada hai — check karo
    """
    # Changed lines count karo
    added_lines = sum(1 for line in diff.split('\n') if line.startswith('+'))
    removed_lines = sum(1 for line in diff.split('\n') if line.startswith('-'))
    total_lines = added_lines + removed_lines

    if total_lines > 500:
        size = "too_large"
        emoji = "🔴"
        warning = f"PR is too large ({total_lines} lines) — consider splitting into smaller PRs!"
    elif total_lines > 200:
        size = "large"
        emoji = "🟠"
        warning = f"Large PR ({total_lines} lines) — review carefully!"
    elif total_lines > 50:
        size = "medium"
        emoji = "🟡"
        warning = None
    else:
        size = "small"
        emoji = "🟢"
        warning = None

    return {
        "total_lines": total_lines,
        "added_lines": added_lines,
        "removed_lines": removed_lines,
        "size": size,
        "emoji": emoji,
        "warning": warning
    }


def trim_diff(diff: str) -> str:
    """
    Agar diff bahut bada hai toh sirf pehle 3000 chars lo
    AI ka context window limited hai!
    """
    if len(diff) > MAX_DIFF_CHARS:
        print(f"⚠️ Diff too large ({len(diff)} chars), trimming to {MAX_DIFF_CHARS}...")
        return diff[:MAX_DIFF_CHARS] + "\n... [diff truncated]"
    return diff


def review_code(code_diff: str, language: str = None) -> dict:
    """
    Code diff lega aur AI se review karwayega.
    Returns: structured feedback as dictionary
    """
    
    if language is None:
        language = detect_language(code_diff)
        print(f"🔍 Detected language: {language}")

    # Empty diff check
    if not code_diff or len(code_diff.strip()) == 0:
        return {
            "summary": "No code changes found",
            "bugs": [],
            "security_issues": [],
            "improvements": [],
            "rating": "good",
            "overall_feedback": "No code changes detected in this PR."
        }

    # Diff trim karo agar bahut bada hai
    trimmed_diff = trim_diff(code_diff)
    
        # PR size analyze karo
    pr_size = analyze_pr_size(code_diff)
    print(f"📏 PR Size: {pr_size['emoji']} {pr_size['size']} ({pr_size['total_lines']} lines)")

    prompt = f"""
    You are a senior software engineer reviewing a pull request.
    
    Analyze the following {language} code diff and provide structured feedback.
    
    Code Diff:
    {trimmed_diff}
    
    Respond ONLY in this exact JSON format, nothing else:
    {{
        "summary": "One line summary of what this code does",
        "severity_score": 5,
        "merge_recommendation": "approve/request_changes/block",
        "bugs": [
            {{
                "line": "approximate line or code snippet",
                "issue": "what is wrong",
                "fix": "how to fix it",
                "severity": "low/medium/high/critical"
            }}
        ],
        "security_issues": [
            {{
                "line": "approximate line or code snippet",
                "issue": "what is the security risk",
                "fix": "how to fix it",
                "severity": "low/medium/high/critical"
            }}
        ],
        "improvements": [
            {{
                "suggestion": "improvement suggestion"
            }}
        ],
        "rating": "good/needs_work/critical",
        "overall_feedback": "2-3 line overall feedback"
    }}
    
    Severity score guide:
    1-3: Clean code, minor issues
    4-6: Some issues, needs attention
    7-8: Serious issues, needs fixes before merge
    9-10: Critical issues, do not merge!
    
    Merge recommendation guide:
    approve: Code is good to merge
    request_changes: Issues found but not blocking
    block: Critical issues, must fix before merge
    """

    # Retry logic — agar Groq fail kare toh 3 baar try karo
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a strict but helpful code reviewer. Always respond in valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
            )

            raw_response = response.choices[0].message.content

            # JSON backticks clean karo agar AI ne daale
            clean_response = raw_response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:]

            review = json.loads(clean_response)
            # Size info review mein add karo
            review["pr_size"] = pr_size
            return review

        except json.JSONDecodeError:
            print(f"⚠️ Attempt {attempt + 1}: JSON parse failed, retrying...")
            if attempt == max_retries - 1:
                return {
                    "summary": "Review completed but formatting failed",
                    "bugs": [],
                    "security_issues": [],
                    "improvements": [],
                    "rating": "needs_work",
                    "overall_feedback": raw_response  # Raw response hi de do
                }

        except Exception as e:
            print(f"💥 Attempt {attempt + 1}: Groq API error — {e}")
            if attempt == max_retries - 1:
                return {
                    "summary": "Review failed",
                    "bugs": [],
                    "security_issues": [],
                    "improvements": [],
                    "rating": "needs_work",
                    "overall_feedback": f"Could not complete review: {str(e)}"
                }
                
# -------- TEST --------
if __name__ == "__main__":

    # Ek sample buggy Python code
    sample_diff = """\
+const getUser = (userId) => {
+    const query = "SELECT * FROM users WHERE id = " + userId
+    const password = result.password
+    console.log("Password: " + password)
+    return result
+}
    """

    print("🔍 Reviewing code...\n")
    review = review_code(sample_diff)

    print("📋 REVIEW RESULT:")
    print(json.dumps(review, indent=2))