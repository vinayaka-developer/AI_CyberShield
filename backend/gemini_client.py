import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

# Create Gemini client
client = genai.Client(api_key=api_key)


def ask_gemini(prompt):
    response = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt
    )

    return response.output_text