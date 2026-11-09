import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"

load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GNANI_API_KEY")

if api_key:
    print("API key loaded successfully!")
else:
    print("API key not found!")