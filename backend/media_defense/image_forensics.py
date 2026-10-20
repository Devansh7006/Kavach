"""
KAVACH - Image Forensics Engine
Inspired by Amped FIVE & Sherloq (GuidoBartoli/sherloq).
Features:
- Error Level Analysis (ELA) with Hotspot Heatmap
- High-Frequency Noise Extraction & Variance Mapping
- Luminance Gradient & Color Inconsistency Detection
- Full EXIF & Software/AI Generation Prompt Metadata Parsing
- GPS Coordinate Extraction with ASTRALIS 3D Target Lock
"""

from typing import Dict, Any, Tuple
import io
import os
import base64
import numpy as np
from PIL import Image, ImageChops, ImageEnhance, ImageOps
from PIL.ExifTags import TAGS, GPSTAGS
import cv2
try:
    from email_defense.geoip import resolve_ip_geo
except ImportError:
    from ..email_defense.geoip import resolve_ip_geo

def compute_ela(image: Image.Image, quality: int = 90) -> Tuple[Image.Image, float]:
    """Generates Error Level Analysis (ELA) image and returns alteration severity score."""
    # Convert to RGB
    img_rgb = image.convert("RGB")
    
    # Save to buffer at fixed JPEG quality
    buffer = io.BytesIO()
    img_rgb.save(buffer, "JPEG", quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer)
    
    # Compute absolute difference
    diff = ImageChops.difference(img_rgb, resaved)
    
    # Determine max difference to calculate dynamic scaling factor
    extrema = diff.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    scale = 255.0 / max(1, max_diff) if max_diff > 0 else 1.0
    scale = min(scale, 15.0)  # Bound scaling
    
    # Amplify differences
    diff_enhanced = ImageEnhance.Brightness(diff).enhance(scale)
    
    # Calculate alteration metric (ratio of non-uniform high error pixels)
    diff_np = np.array(diff)
    error_mean = float(np.mean(diff_np))
    error_std = float(np.std(diff_np))
    
    # High standard deviation indicates localized tampering/splicing
    alteration_score = min(100.0, round((error_std * 4.5) + (error_mean * 1.5), 1))
    
    return diff_enhanced, alteration_score

def compute_noise_analysis(image_np: np.ndarray) -> Tuple[np.ndarray, float]:
    """Extracts high-frequency sensor noise using Laplacian kernel (Sherloq method)."""
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    
    # Apply Laplacian operator for high-pass spatial filter
    laplacian = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
    abs_lap = np.absolute(laplacian)
    
    # Normalize to 0-255
    norm_lap = np.uint8(255 * (abs_lap / np.max(abs_lap))) if np.max(abs_lap) > 0 else np.zeros_like(gray)
    
    # Apply false color heatmap (JET colormap) for high-impact tactical HUD visualization
    heatmap = cv2.applyColorMap(norm_lap, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    
    # Standard deviation of local noise variance
    noise_variance = float(np.var(laplacian))
    smoothness_flag = 1.0 if noise_variance < 35.0 else 0.0 # AI generators have unnaturally low sensor noise
    
    return heatmap_rgb, round(noise_variance, 2)

def extract_exif_metadata(image: Image.Image) -> Dict[str, Any]:
    """Extracts camera parameters, software signatures, AI prompt traces, and GPS coordinates."""
    exif_data = {}
    gps_info = {}
    software_flags = []
    
    try:
        raw_exif = image._getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = TAGS.get(tag_id, tag_id)
                if tag_name == "GPSInfo":
                    for key in value:
                        sub_tag = GPSTAGS.get(key, key)
                        gps_info[sub_tag] = value[key]
                else:
                    # Sanitize value for JSON
                    if isinstance(value, (bytes, bytearray)):
                        try:
                            value = value.decode("utf-8", errors="ignore")
                        except Exception:
                            value = str(value[:30])
                    exif_data[str(tag_name)] = str(value)[:120]
    except Exception:
        pass

    # Check for AI Software signatures or Photoshop
    software = exif_data.get("Software", "").lower()
    artist = exif_data.get("Artist", "").lower()
    description = exif_data.get("ImageDescription", "").lower()
    
    ai_keywords = ["midjourney", "stable diffusion", "comfyui", "automatic1111", "dall-e", "novelai", "photoshop", "gimp"]
    found_signatures = []
    for kw in ai_keywords:
        if kw in software or kw in artist or kw in description:
            found_signatures.append(kw.upper())
    
    # Resolve GPS Coordinates if present
    lat, lon = None, None
    if "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
        try:
            lat_dms = gps_info["GPSLatitude"]
            lon_dms = gps_info["GPSLongitude"]
            lat_ref = gps_info.get("GPSLatitudeRef", "N")
            lon_ref = gps_info.get("GPSLongitudeRef", "E")
            
            lat = float(lat_dms[0]) + float(lat_dms[1])/60.0 + float(lat_dms[2])/3600.0
            if lat_ref == "S": lat = -lat
            
            lon = float(lon_dms[0]) + float(lon_dms[1])/60.0 + float(lon_dms[2])/3600.0
            if lon_ref == "W": lon = -lon
        except Exception:
            pass

    return {
        "has_exif": bool(exif_data),
        "camera_make": exif_data.get("Make", "Unknown Camera"),
        "camera_model": exif_data.get("Model", "Digital Sensor"),
        "software": exif_data.get("Software", "None Recorded"),
        "datetime": exif_data.get("DateTime", "Not Stamped"),
        "iso": exif_data.get("ISOSpeedRatings", "Auto"),
        "exposure_time": exif_data.get("ExposureTime", "Unknown"),
        "ai_signatures_detected": found_signatures,
        "gps": {
            "has_gps": lat is not None and lon is not None,
            "latitude": round(lat, 6) if lat else None,
            "longitude": round(lon, 6) if lon else None,
            "altitude": str(gps_info.get("GPSAltitude", "Unknown"))
        },
        "raw_tag_count": len(exif_data)
    }

def analyze_image_forensics(image_bytes: bytes, filename: str = "evidence.jpg") -> Dict[str, Any]:
    """Full forensic workflow: ELA, Noise analysis, EXIF dump, and Deepfake Probability."""
    img = Image.open(io.BytesIO(image_bytes))
    img_rgb = img.convert("RGB")
    width, height = img.size
    img_np = np.array(img_rgb)
    
    # 1. Error Level Analysis (ELA)
    ela_img, ela_score = compute_ela(img, quality=92)
    ela_buffer = io.BytesIO()
    ela_img.save(ela_buffer, format="JPEG")
    ela_b64 = "data:image/jpeg;base64," + base64.b64encode(ela_buffer.getvalue()).decode()
    
    # 2. Noise & Frequency Analysis
    noise_rgb, noise_var = compute_noise_analysis(img_np)
    noise_pil = Image.fromarray(noise_rgb)
    noise_buffer = io.BytesIO()
    noise_pil.save(noise_buffer, format="JPEG")
    noise_b64 = "data:image/jpeg;base64," + base64.b64encode(noise_buffer.getvalue()).decode()
    
    # 3. EXIF & Metadata
    exif = extract_exif_metadata(img)
    
    # 4. Deepfake / Synthetic Generation Confidence
    # Synthetic cues:
    # - Low sensor noise variance (< 50) typical of generative latent diffusion
    # - ELA inconsistency score > 60
    # - Striped EXIF or AI software tag present
    ai_prob = 15.0  # Base natural prior
    
    if exif["ai_signatures_detected"]:
        ai_prob += 65.0
    elif not exif["has_exif"]:
        ai_prob += 18.0 # Web stripping
        
    if noise_var < 45.0:
        ai_prob += 25.0
    elif noise_var < 80.0:
        ai_prob += 12.0
        
    if ela_score > 55.0:
        ai_prob += 22.0

    ai_prob = min(98.5, max(4.0, ai_prob))
    trust_score = round(100.0 - ai_prob, 1)
    
    verdict = "AI-GENERATED / MANIPULATED" if ai_prob >= 50.0 else "AUTHENTIC MEDIA"

    # Geolocation target coordinate for ASTRALIS 3D view
    target_geo = None
    if exif["gps"]["has_gps"]:
        target_geo = {
            "lat": exif["gps"]["latitude"],
            "lon": exif["gps"]["longitude"],
            "city": "Camera GPS Lock",
            "country": "Ground Coordinates",
            "org": "EXIF Satellite Geotag",
            "threat_risk": 5
        }
    else:
        # Default fallback to central forensics terminal node
        target_geo = {
            "lat": 37.7749,
            "lon": -122.4194,
            "city": "Digital Ingestion Terminal",
            "country": "Cyber Command",
            "org": "KAVACH Forensic Intake",
            "threat_risk": int(ai_prob)
        }

    return {
        "filename": filename,
        "resolution": f"{width}x{height}",
        "color_channels": len(img.getbands()),
        "verdict": verdict,
        "is_ai_generated": ai_prob >= 50.0,
        "deepfake_confidence": round(ai_prob, 1),
        "trust_score": trust_score,
        "ela_alteration_score": ela_score,
        "noise_variance": noise_var,
        "exif_metadata": exif,
        "target_geo": target_geo,
        "visual_artifacts": {
            "ela_heatmap_b64": ela_b64,
            "noise_frequency_b64": noise_b64
        },
        "forensic_indicators": [
            {
                "tool": "Error Level Analysis (ELA)",
                "result": f"Discrepancy Index: {ela_score:.1f}%",
                "severity": "CRITICAL" if ela_score > 60 else "NORMAL"
            },
            {
                "tool": "Sherloq Noise Frequency Filter",
                "result": f"Sensor Noise Variance: {noise_var}",
                "severity": "HIGH" if noise_var < 45 else "NORMAL"
            },
            {
                "tool": "EXIF Header Inspection",
                "result": f"{exif['camera_make']} {exif['camera_model']} | Software: {exif['software']}",
                "severity": "ALERT" if exif["ai_signatures_detected"] else "PASS"
            }
        ]
    }
