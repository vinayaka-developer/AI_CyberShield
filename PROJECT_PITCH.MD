AI_CyberShield – AI-Powered Cybersecurity Platform

1. Problem Statement

Many students, developers, website owners, and small teams lack accessible tools to identify common cybersecurity risks. Checking suspicious URLs, website security configurations, and source-code vulnerabilities often requires technical knowledge and multiple separate tools.

2. Proposed Solution

AI_CyberShield is an AI-powered cybersecurity platform that brings multiple security scanning tools into one application. It helps users identify potential security risks, understand findings, and generate reports with recommendations through a simple interface.

3. Key Features

- Website URL Scanner: Checks URLs for suspicious indicators and potential risks.
- Website Vulnerability Scanner: Audits website security headers and identifies missing security protections.
- Source Code Scanner: Detects potential Python security issues using Bandit.
- ZIP Scanner: Scans uploaded source-code ZIP files for potential security issues.
- GitHub Scanner: Helps analyse source-code repositories.
- AI Chatbot: Uses Google Gemini to assist users with cybersecurity-related questions.
- PDF Reports: Generates downloadable security reports with findings and recommendations.
- Speech-to-Text: Uses Gnani AI Prisma v3.0 to convert uploaded audio into text, including automatic language detection.

4. Technology Stack

- Frontend: React, JavaScript, CSS
- Backend: Python, FastAPI
- Security Analysis: Bandit and custom scanning logic
- AI Assistant: Google Gemini API
- Speech Recognition: Gnani AI Prisma v3.0 Speech-to-Text API
- Reporting: ReportLab
- Testing: Pytest

5. Gnani AI Integration

We integrated the Gnani AI Prisma v3.0 Speech-to-Text API into AI_CyberShield. Users can upload an audio file, and the application sends it to the Gnani AI API for transcription. The returned transcript and detected language are displayed in the frontend.

This integration demonstrates how Gnani AI speech technology can make cybersecurity applications more accessible and convenient.

6. Target Users

- Students learning cybersecurity
- Software developers
- Website owners
- Small development teams

7. Team Contributions

Team Member 1 – Primary Registrant: Backend development, cybersecurity scanners, risk analysis, PDF report generation, and Gnani AI API integration and testing.

Team Member 2 – Teammate: React frontend development, user interface design, frontend-backend integration, and Speech-to-Text interface.

8. Project Goal

Our goal is to make basic cybersecurity analysis more accessible through an integrated platform that combines security scanning, AI assistance, speech recognition, and understandable security reports.

GitHub Repository: https://github.com/vinayaka-developer/AI_CyberShield
