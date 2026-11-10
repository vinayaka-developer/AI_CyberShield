from fastapi import FastAPI,HTTPException
from modules.website_scanner import analyze_url
from modules.website_vulnerability_scanner import scan_website
from modules.source_code_scanner import scan_python_code, scan_zip_file
from fastapi.responses import Response
from utils.report_generator import create_security_report
from utils.risk_analyzer import calculate_risk
from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal
from pydantic import BaseModel, Field
from gemini_client import ask_gemini
import os
import requests
#from fastapi import HTTPException

app = FastAPI(
    title="AI_CyberShield API",
    description="AI-powered Cybersecurity Platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://ai-cybershield-2sy5.onrender.com',
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://katrina-prayer-explanation-identified.trycloudflare.com",
    "https://opinions-finally-golden-tips.trycloudflare.com"
],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to AI_CyberShield API",
        "status": "Running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "Healthy",
        "project": "AI_CyberShield"
    }


class URLScanRequest(BaseModel):
    url: str
class PythonCodeRequest(BaseModel):
    source_code: str
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


@app.post("/api/scan/url")
def scan_url_api(request: URLScanRequest):

    if not request.url.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a website URL."
        )

    result = analyze_url(request.url)

    return result
@app.post("/api/scan/website-vulnerabilities")
def scan_website_vulnerabilities_api(request: URLScanRequest):

    if not request.url.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a website URL."
        )

    result = scan_website(request.url)

    return result
@app.post("/api/scan/source-code")
def scan_source_code_api(request: PythonCodeRequest):

    if not request.source_code.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter Python source code."
        )

    result = scan_python_code(request.source_code)

    if result.get("status") == "Success":

        risk_findings = [
            {
                "severity": finding.get("severity", "Low"),
                "description": finding.get("issue", "")
            }
            for finding in result.get("findings", [])
        ]

        risk_result = calculate_risk(risk_findings)
        print("RISK RESULT:", risk_result)

        result.update(risk_result)

    return result
@app.post("/api/scan/source-code-zip")
async def scan_source_code_zip(file: UploadFile = File(...)):

    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a ZIP file."
        )

    MAX_UPLOAD_SIZE = 10 * 1024 * 1024

    zip_bytes = await file.read(MAX_UPLOAD_SIZE + 1)

    if len(zip_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="ZIP file exceeds the 10 MB upload limit."
        )

    result = scan_zip_file(zip_bytes)

    if result.get("status") == "Success":

        risk_findings = [
            {
                "severity": finding.get("severity", "Low"),
                "description": finding.get("issue", "")
            }
            for finding in result.get("findings", [])
        ]

        risk_result = calculate_risk(risk_findings)

        result.update(risk_result)

    return result
class PDFReportRequest(BaseModel):
    target: str
    scan_result: dict


@app.post("/api/reports/pdf")
def generate_pdf_report(request: PDFReportRequest):

    if not request.target.strip():
        raise HTTPException(
            status_code=400,
            detail="Report target cannot be empty."
        )

    try:
        pdf_bytes = create_security_report(
            request.target,
            request.scan_result
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                'attachment; filename="AI_CyberShield_Report.pdf"'
            }
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate PDF report."
        )
@app.post("/api/chat")
def chatbot_api(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a message."
        )

    conversation = ""

    for item in request.history[-20:]:
        conversation += f"{item.role}: {item.content}\n"

    conversation += f"user: {request.message}\n"
    conversation += "assistant:"

    try:
        answer = ask_gemini(conversation)

        return {
            "status": "Success",
            "reply": answer
        }

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Gemini AI service is currently unavailable."
        )
@app.post("/api/speech-to-text")
def speech_to_text(audio_file: UploadFile = File(...)):
    api_key = os.getenv("GNANI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gnani API key is not configured."
        )

    if not audio_file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please upload an audio file."
        )

    try:
        response = requests.post(
            "https://api.vachana.ai/stt/v3",
            headers={
                "X-API-Key-ID": api_key
            },
            files={
                "audio_file": (
                    audio_file.filename,
                    audio_file.file,
                    audio_file.content_type
                )
            },
            data={
                "model": "prisma-v3.0",
                "language_code": "indic-auto"
            },
            timeout=60
        )

        if not response.ok:
            print("GNANI STATUS:", response.status_code)
            print("GNANI ERROR:", response.text)

            raise HTTPException(
                status_code=502,
                detail="Gnani speech-to-text service failed."
            )

        return response.json()
    except requests.RequestException as e:
        print("GNANI CONNECTION ERROR:", repr(e))
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to Gnani AI."
        )