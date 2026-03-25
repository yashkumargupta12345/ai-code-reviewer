from groq import Groq
from dotenv import load_dotenv
import os

# .env file se API key load karo
load_dotenv()

# Groq client banao
client = None

def get_client():
    global client
    if client is None:
        print("⚡ Initializing Groq client...")
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    return client

client = get_client()

# Simple test message bhejo
chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say 'Groq is working!' in one line.",
        }
    ],
    model="llama-3.3-70b-versatile",  # Free aur powerful model
)

# Response print karo
print(chat_completion.choices[0].message.content)