🛡️ AI CyberShield

AI-Powered Cybersecurity Assistant

AI CyberShield is a Python-based cybersecurity application built using Streamlit. It helps users identify potential security risks in websites, Python source code, GitHub repositories, and Android APK files.

🚀 Features

1. AI Chatbot – Answers cybersecurity-related questions using Gemini AI.
2. Website Scanner – Detects potentially suspicious URLs.
3. Website Vulnerability Scanner – Checks basic website security headers.
4. Source Code Scanner – Identifies potential security issues in Python code and ZIP files.
5. GitHub Repository Scanner – Scans public GitHub repositories for potential security issues.
6. Android APK Scanner – Analyzes APK permissions and selected security settings.

🛠️ Technologies Used

- Python
- Streamlit
- Google Gemini API
- Bandit
- Androguard
- BeautifulSoup
- ReportLab
- Requests

⚙️ Installation

1. Clone the repository:
   
   git clone YOUR_GITHUB_REPOSITORY_URL

2. Open the project folder:
   
   cd AI_CyberShield

3. Create a virtual environment:
   
   python -m venv .venv

4. Activate it on Windows:
   
   .venv\Scripts\activate

5. Install dependencies:
   
   pip install -r requirements.txt

6. Create a ".env" file and add your Gemini API key:
   
   GEMINI_API_KEY=your_api_key_here

7. Run the application:
   
   python -m streamlit run app.py

🧪 Testing

Run the automated tests:

python -m pytest -v

🔒 Security Notice

- Uploaded source code and APK files are analyzed statically, not executed or installed.
- Security findings are indicative and require manual verification.
- This project is intended for educational and security-awareness purposes. It does not guarantee complete protection against cyber threats.

👨‍💻 Project Status

Developed as a student cybersecurity project.