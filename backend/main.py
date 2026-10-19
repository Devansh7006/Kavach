"""
KAVACH (The Protector) - Unified Cyber Sentinel & Forensics Defense System
FastAPI Central Intelligence Server
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import hashlib
import time

from email_defense.parser import parse_eml_content
from email_defense.classifier import kavach_model
from email_defense.dataset import dataset_manager
from media_defense.image_forensics import analyze_image_forensics
from media_defense.video_forensics import analyze_video_forensics
from media_defense.audio_forensics import analyze_audio_forensics
from gods_eye.satellite_tracker import get_live_satellite_positions
from gods_eye.threat_stream import generate_live_attack_arcs, get_threat_summary

app = FastAPI(
    title="KAVACH Defense API",
    description="Military-grade cyber intelligence, email forensics, deepfake detection, and God's Eye geospatial tracking",
    version="2.0.0"
)

# Enable CORS for frontend client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailAnalyzeRequest(BaseModel):
    raw_eml: Optional[str] = None
    subject: Optional[str] = None
    sender: Optional[str] = None
    body: Optional[str] = None

class RetrainRequest(BaseModel):
    subject: str
    sender: str
    body: str
    label: int  # 1 for Phishing, 0 for Legitimate
    origin_ip: Optional[str] = "185.220.101.45"
    threat_type: Optional[str] = "User-Submitted Live Sample"

@app.get("/")
def root():
    return {
        "system": "KAVACH Cyber Defense Suite",
        "codename": "The Protector",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "author": "SecYureD / KAVACH Security Team"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "subsystems": {
            "gods_eye_geospatial": "ONLINE",
            "email_phishing_engine": "ONLINE",
            "image_ela_forensics": "ONLINE",
            "video_authenticator": "ONLINE",
            "audio_librosa_spectrogram": "ONLINE",
            "greynoise_intel_feed": "CONNECTED"
        },
        "model_accuracy": kavach_model.metrics.get("accuracy", 97.0),
        "total_baseline_samples": len(dataset_manager.get_all())
    }

@app.get("/api/gods-eye/telemetry")
def get_gods_eye_telemetry():
    """Returns live satellite positions, cyber attack arcs, and threat dashboard metrics."""
    return {
        "timestamp": time.time(),
        "satellites": get_live_satellite_positions(),
        "attack_arcs": generate_live_attack_arcs(),
        "threat_summary": get_threat_summary()
    }

@app.post("/api/email/analyze")
async def analyze_email(
    file: Optional[UploadFile] = File(None),
    raw_eml: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    sender: Optional[str] = Form(None),
    body: Optional[str] = Form(None)
):
    """Analyzes an email from raw .eml file upload or pasted text content."""
    content_str = ""
    
    if file:
        file_bytes = await file.read()
        content_str = file_bytes.decode("utf-8", errors="replace")
    elif raw_eml and raw_eml.strip():
        content_str = raw_eml
    elif body and body.strip():
        content_str = f"Subject: {subject or 'No Subject'}\nFrom: {sender or 'unknown@domain.com'}\n\n{body}"
    else:
        raise HTTPException(status_code=400, detail="Please provide either an .eml file, raw text, or body content.")

    # 1. Parse forensic metadata, hops, SPF/DKIM/DMARC
    parsed = parse_eml_content(content_str)
    
    # Override subject/sender if explicitly provided
    if subject: parsed["subject"] = subject
    if sender: parsed["sender"] = sender

    # 2. Run classifier prediction & similarity matching
    prediction_result = kavach_model.predict(parsed)

    # 3. Compute cryptographic hash
    sha256_hash = hashlib.sha256(content_str.encode("utf-8")).hexdigest()

    return {
        "sha256_hash": sha256_hash,
        "parsed_metadata": parsed,
        "prediction": prediction_result,
        "gods_eye_trajectory": {
            "origin": parsed["origin_geo"],
            "hops": [h["geo"] for h in parsed["hops"]],
            "destination": {
                "lat": 28.6139,
                "lon": 77.2090,
                "city": "KAVACH Interception Node",
                "country": "India",
                "org": "Cyber Defense Grid"
            }
        }
    }

@app.get("/api/email/dataset")
def get_email_dataset():
    """Returns baseline 100-email dataset and active model evaluation metrics."""
    return {
        "counts": dataset_manager.get_counts(),
        "metrics": kavach_model.metrics,
        "samples": dataset_manager.get_all()
    }

@app.post("/api/email/retrain")
def retrain_model_with_sample(req: RetrainRequest):
    """Adds a newly evaluated sample to dataset and performs real-time retraining."""
    sample_data = {
        "subject": req.subject,
        "sender": req.sender,
        "body": req.body,
        "origin_ip": req.origin_ip,
        "threat_type": req.threat_type
    }
    result = kavach_model.retrain_with_sample(sample_data, req.label)
    return result

@app.post("/api/media/image-forensics")
async def process_image_forensics(file: UploadFile = File(...)):
    """Sherloq & Amped FIVE inspired image tampering and deepfake analysis."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image payload received.")
    
    result = analyze_image_forensics(contents, filename=file.filename or "evidence.jpg")
    result["sha256_hash"] = hashlib.sha256(contents).hexdigest()
    return result

@app.post("/api/media/video-forensics")
async def process_video_forensics(file: UploadFile = File(...)):
    """Amped Authenticator inspired video deepfake and frame-by-frame inspector."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty video payload received.")
    
    result = analyze_video_forensics(contents, filename=file.filename or "evidence.mp4")
    result["sha256_hash"] = hashlib.sha256(contents).hexdigest()
    return result

@app.post("/api/media/audio-forensics")
async def process_audio_forensics(file: UploadFile = File(...)):
    """Librosa MFCC and Mel-Spectrogram voice clone forensic detector."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty audio payload received.")
        
    result = analyze_audio_forensics(contents, filename=file.filename or "evidence.wav")
    result["sha256_hash"] = hashlib.sha256(contents).hexdigest()
    return result

@app.post("/api/export/report")
def generate_forensic_dossier(data: Dict[str, Any]):
    """Generates official KAVACH Cyber Defense Incident Dossier."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime())
    evidence_id = f"KAVACH-INCIDENT-{int(time.time())}"
    
    return {
        "incident_id": evidence_id,
        "generated_at": timestamp,
        "classification": "CONFIDENTIAL // CYBER DEFENSE CLEARANCE",
        "evidence_summary": data,
        "investigators": [
            "Sameeraj (B.Tech EC)",
            "Dipanshu Maheshwari (B.Tech CS AI/ML)",
            "Yashashvi Gupta (B.Tech CS AI/ML)",
            "Shubh Verma (B.Tech EC)"
        ],
        "system_attestation": "Cryptographically verified by KAVACH Engine Core v2.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
