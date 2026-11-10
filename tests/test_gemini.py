# import os
# from pathlib import Path
# from dotenv import load_dotenv
# from google import genai

# env_path = Path(__file__).resolve().parent / ".env"

# load_dotenv(dotenv_path=env_path, override=True)

# api_key = os.getenv("GEMINI_API_KEY")

# if not api_key:
#     print("Gemini API key not found!")
# else:
#     client = genai.Client(api_key=api_key)

#     response = client.models.generate_content(
#         model="gemini-2.5-flash",
#         contents="Hello Gemini! Introduce yourself."
#     )

#     print(response.text)
import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Get Gemini API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Gemini API key not found!")

else:
    client = genai.Client(api_key=api_key)

    response = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input="Hello Gemini! Introduce yourself."
    )

    print(response.output_text)