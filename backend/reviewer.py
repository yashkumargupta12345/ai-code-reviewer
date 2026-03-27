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

    prompt = f"""
    You are a senior software engineer reviewing a pull request.
    
    Analyze the following {language} code diff and provide structured feedback.
    
    Code Diff:
    {trimmed_diff}
    
    Respond ONLY in this exact JSON format, nothing else:
    {{
        "summary": "One line summary of what this code does",
        "bugs": [
            {{
                "line": "approximate line or code snippet",
                "issue": "what is wrong",
                "fix": "how to fix it"
            }}
        ],
        "security_issues": [
            {{
                "line": "approximate line or code snippet",
                "issue": "what is the security risk",
                "fix": "how to fix it"
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
    sample_diff = """
        + const getUser = (userId) => {
        +     const query = "SELECT * FROM users WHERE id = " + userId
        +     const password = result.password
        +     console.log("Password: " + password)
        +     return result
        + }
    """

    print("🔍 Reviewing code...\n")
    review = review_code(sample_diff)

    print("📋 REVIEW RESULT:")
    print(json.dumps(review, indent=2))