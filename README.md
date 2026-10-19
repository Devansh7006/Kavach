# 🛡️ KAVACH (The Protector)
### Institutional AI Cyber Sentinel & Multi-Modal Multimedia Forensic Defense Suite
*Inspired by bilawalsidhu/gods-eye-view, GuidoBartoli/sherloq, Amped FIVE, and Amped Authenticator*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black.svg?logo=three.js&logoColor=white)](https://threejs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🌟 Executive Overview
**KAVACH (The Protector)** is a unified, defense-grade cyber intelligence and multimedia forensic suite developed by Team **SecYureD**. Engineered to replace legacy form inputs with an institutional war-room experience, KAVACH features:

1. **God's Eye 3D NASA Photorealistic Earth**: High-resolution NASA Blue Marble 2048px day surface, normal relief map for mountain/coastal topography, specular ocean glare, and an independent rotating transparent cloud layer.
2. **Global Reactive Threat Ambiance (Green / Red Dynamic Theming)**:
   * **Legitimate / Clean Verdict**: Ambiance morphs into authoritative **Cyber Emerald Green (`#00ff88` / `#10b981`)** with an all-clear status banner.
   * **Hostile / Deepfake Compromise**: Ambiance flashes into **High-Alert Crimson Red (`#ff3366` / `#ef4444`)** with DEFCON 1 emergency protocol indicators.
3. **Institutional Glassmorphism UI**: Built with obsidian dark surfaces (`#0a0e16`), ambient radial glow lighting, frosted glass cards (`backdrop-blur-2xl`), and institutional typography (**Space Grotesk**, **JetBrains Mono**, **Inter**).
4. **Authentic Real-Time Telemetry**: Real client round-trip latency measured via `performance.now()`, live UTC uptime counter, and real NORAD Keplerian satellite tracking (ISS NORAD 25544, Sentinel-6 NORAD 48274).
5. **RFC 5322 Email Security & Hop Traceroute**: Deep `.eml` header parsing, SPF/DKIM/DMARC cryptographic validation, reverse DNS hop extraction, GreyNoise threat actor classification, and Scikit-Learn Random Forest ensemble.
6. **Dynamic 100-Sample Incremental Learning Lab**: Pre-trained on 100 ground-truth emails (50 phishing / 50 legitimate). When a user submits an email, KAVACH performs live inference, computes cosine similarity against nearest baseline clusters, and enables 1-click dynamic retraining with instant accuracy delta metrics.
7. **Amped FIVE & Sherloq Image Forensics**: Dual-layer Error Level Analysis (ELA) heatmap and Laplacian camera PRNU sensor noise variance filter to expose digital splicing and generative diffusion smoothing, with camera GPS auto-flight lock into God's Eye.
8. **Amped Authenticator Video Forensics**: Frame-by-frame temporal optical flow and facial landmark warping detection with an interactive timeline scrubber.
9. **Librosa Acoustic Forensics**: 13-band Mel-Frequency Cepstral Coefficients (MFCC) and Mel-Spectrogram density heatmap analysis to detect synthetic AI voice clones and neural vocoder phase jitter.
10. **Executive Incident Dossier**: Cryptographically sealed forensic audit reports with SHA-256 hash verification for legal chain of custody.

---

## 👥 Investigation & Engineering Team
* **Sameeraj** — *B.Tech EC with minor in CSE* (Lead Architect & Systems Engineering)
* **Dipanshu Maheshwari** — *B.Tech CS AI/ML* (Computer Vision & Deepfake Neural Networks)
* **Yashashvi Gupta** — *B.Tech CS AI/ML* (NLP Phishing Models & Interactive Training Lab)
* **Shubh Verma** — *B.Tech EC with minor in CSE* (Geospatial Routing & Forensic Telemetry)

---

## 🏗️ Architectural Topology

```
+---------------------------------------------------------------------------------------------------------+
|                                  KAVACH INSTITUTIONAL COMMAND HUD (React 19 + Three.js)                 |
|   • Photorealistic NASA 3D Earth (Day Map, Normal Relief, Ocean Specular, Dynamic Cloud Layer)         |
|   • Reactive Threat Ambiance Engine (All-Green Clean System vs All-Red High-Alert Compromise)          |
|   • Multi-Spectral Image Inspector (Error Level Analysis ELA Heatmap vs Sherloq Sensor Noise Variance)  |
|   • Video Frame Timeline Scrubber & Librosa 13-Band MFCC Acoustic Density Canvas                        |
|   • Dynamic 100-Sample Learning Lab (Real-Time Retraining with Live Accuracy Delta & Nearest Neighbors)  |
+----------------------------------------------------+----------------------------------------------------+
                                                     |
                                         REST API / Geo-Telemetry
                                                     |
+----------------------------------------------------+----------------------------------------------------+
|                                      KAVACH CENTRAL INTELLIGENCE BACKEND                                |
|                                             (FastAPI + Python 3.11)                                     |
+---------------------------------------------------------------------------------------------------------+
       |                                     |                                     |
+------+------+                       +------+------+                       +------+------+
| EMAIL & .EML|                       | MEDIA FORENSICS                     | GOD'S EYE   |
+-------------+                       +-------------+                       +-------------+
| • RFC 5322 Parser                   | • ELA Heatmap Engine                | • NASA Blue Marble
| • SPF / DKIM / DMARC                | • Sherloq Laplacian Filter          | • Normal Relief & Clouds
| • Received Hop Traceroute           | • Amped Video Flow Scrubber         | • NORAD Satellite Orbits
| • GreyNoise Actor Intel             | • Librosa 13-Band MFCC              | • Attack Arc Trajectories
| • 100-Email Baseline                | • EXIF & AI Generator Prompt Tags   | • GeoIP Lat/Lon Coordinate Lock
| • Live Dynamic Retrainer            | • Camera GPS Auto-Fly Lock          | • MGRS Military Grid System
+-------------+                       +-------------+                       +-------------+
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
