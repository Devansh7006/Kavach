# 🛡️ KAVACH (The Protector)
### AI Cyber Sentinel & Multi-Modal Multimedia Forensic Defense System
*Inspired by bilawalsidhu/gods-eye-view, GuidoBartoli/sherloq, Amped FIVE, and Amped Authenticator*

---

## 🌟 Executive Overview
**KAVACH (The Protector)** is a unified, defense-grade cyber intelligence and forensic suite developed by Team **SecYureD**. Moving far beyond static detection forms, KAVACH integrates:
1. **God's Eye View (3D Geospatial Cyber Command HUD)**: Real-time 3D orbital surveillance tracking defense satellites (KAVACH-LEO, SSO, GEO), tracing global cyber attack arcs, and locking onto threat coordinates in real-time.
2. **RFC 5322 Email Security & Hop Traceroute**: Deep `.eml` and raw header parsing, SPF/DKIM/DMARC cryptographic validation, reverse DNS hop extraction, GreyNoise threat actor classification, and an NLP Scikit-Learn Random Forest ensemble.
3. **Interactive 100-Sample Learning Lab**: Pre-trained on 100 ground-truth emails (50 phishing / 50 legitimate). When a user submits an email for testing, KAVACH classifies it live, clusters nearest-neighbor exemplars, and allows 1-click dynamic retraining with instant accuracy delta metrics.
4. **Amped FIVE & Sherloq Image Forensics**: Dual-layer Error Level Analysis (ELA) and Laplacian camera sensor noise variance filtering to detect spliced objects, generative diffusion smoothing, and EXIF software prompt signatures with GPS camera auto-lock.
5. **Amped Authenticator Video Forensics**: Keyframe decomposition, optical flow anomaly detection, and frame-by-frame ELA scrubber to expose deepfake face-swap warping.
6. **Librosa Acoustic Forensics**: 13-band Mel-Frequency Cepstral Coefficients (MFCC) and Mel-Spectrogram density heatmap analysis to detect synthetic AI voice clones and neural vocoder phase jitter.
7. **Executive Incident Dossier**: Cryptographically sealed forensic audit reports with SHA-256 hash verification for legal chain of custody.

---

## 👥 Investigation & Engineering Team
* **Sameeraj** — *B.Tech EC with minor in CSE* (Lead Architect & Systems Engineering)
* **Dipanshu Maheshwari** — *B.Tech CS AI/ML* (Computer Vision & Deepfake Neural Networks)
* **Yashashvi Gupta** — *B.Tech CS AI/ML* (NLP Phishing Models & Interactive Training Lab)
* **Shubh Verma** — *B.Tech EC with minor in CSE* (Geospatial Routing & Forensic Telemetry)

---

## 🏗️ Architectural Topology

```
+-------------------------------------------------------------------------+
|                  KAVACH WEB COMMAND HUD (React 19 + Three.js)           |
|   - 3D Tactical Cyber Globe (Satellite Orbits, Attack Arcs, FLIR Mode)  |
|   - Multi-Spectral Image Inspector (ELA Heatmap vs Sherloq Noise Filter)|
|   - Video Frame Timeline Scrubber & Librosa 13-MFCC Acoustic Canvas     |
|   - Interactive Dynamic Model Training Lab & Dataset Evaluation         |
+------------------------------------+------------------------------------+
                                     |
                                REST API
                                     |
+------------------------------------+------------------------------------+
|                  KAVACH CENTRAL INTELLIGENCE BACKEND                     |
|                           (Python FastAPI)                              |
+-------------------------------------------------------------------------+
       |                         |                          |
+------+------+           +------+------+            +------+------+
| EMAIL LAYER |           | MEDIA LAYER |            | GOD'S EYE   |
+-------------+           +-------------+            +-------------+
| • RFC Parser            | • ELA Engine             | • Orbitals  |
| • SPF/DKIM/DMARC        | • Sherloq Noise Filter   | • Telemetry |
| • GreyNoise Intel       | • Amped Video Flow       | • Attack Arc|
| • 100-Sample ML         | • Librosa 13-MFCC        | • GeoIP Map |
| • Dynamic Retrainer     | • EXIF/GPS Metadata      | • MGRS Grid |
+-------------+           +-------------+            +-------------+
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python**: 3.10+ (with `fastapi`, `uvicorn`, `opencv-python`, `librosa`, `scikit-learn`, `pillow`, `torch`)
* **Node.js**: 18+ (with `npm`)

### 1-Click Launch (Windows)
Double-click `start_kavach.bat` in the root directory.

### Manual Launch

#### 1. Start FastAPI Backend:
```bash
cd backend
python main.py
# Backend runs at http://127.0.0.1:8000
```

#### 2. Start Vite Frontend HUD:
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🔬 Forensic Methodology Reference

### 1. Error Level Analysis (ELA)
* Inspired by **Sherloq** & **Amped FIVE**. Resaves the ingested media at a calibrated JPEG quality matrix (90-92%), calculates pixel-by-pixel Euclidean distance against the original uncompressed stream, and applies dynamic brightness enhancement (`scale = 255 / max_diff`). High error variance isolates manipulated or spliced regions.

### 2. High-Frequency PRNU Sensor Noise Analysis
* Authentic camera sensors produce distinct Photo-Response Non-Uniformity (PRNU) noise across the entire image plane. In contrast, generative AI systems (Midjourney, Stable Diffusion, DALL-E) produce unnaturally smooth high-frequency spectra. KAVACH extracts the high-pass spatial Laplacian kernel and computes local noise variance.

### 3. Librosa 13-Band MFCC Voice Forensics
* Synthetic text-to-speech (TTS) and voice clones exhibit characteristic vocoder phase discontinuities, abnormal zero-crossing rates, and unnatural spectral flatlines above 4.5 kHz. KAVACH analyzes the first 13 Mel-Frequency Cepstral Coefficients to differentiate biological speech formants from neural vocoders.
