"""
KAVACH - ASTRALIS 3D Defense Satellite Orbital Tracker
Calculates real-time orbital positions and telemetry for cyber defense surveillance satellites.
"""

import math
import time
from typing import List, Dict, Any

SATELLITE_CONSTELLATION = [
    {
        "id": "SAT-KAVACH-01",
        "name": "KAVACH Sentinel-1 (LEO)",
        "norad_id": 98102,
        "inclination": 51.6,
        "altitude_km": 540,
        "period_min": 95.4,
        "phase_offset": 0.0,
        "type": "Optical / Multi-Spectral Surveillance"
    },
    {
        "id": "SAT-KAVACH-02",
        "name": "KAVACH Cyber-Interceptor (SSO)",
        "norad_id": 98103,
        "inclination": 97.4,
        "altitude_km": 680,
        "period_min": 98.2,
        "phase_offset": 1.57,
        "type": "Signals Intelligence / Packet Intercept"
    },
    {
        "id": "SAT-KAVACH-03",
        "name": "KAVACH Geo-Guardian (GEO)",
        "norad_id": 98104,
        "inclination": 2.1,
        "altitude_km": 35786,
        "period_min": 1436.0,
        "phase_offset": 3.14,
        "type": "Early Warning Threat Relayer"
    }
]

def get_live_satellite_positions() -> List[Dict[str, Any]]:
    """Calculates live sub-satellite latitude/longitude based on current epoch time."""
    now = time.time()
    results = []

    for sat in SATELLITE_CONSTELLATION:
        period_sec = sat["period_min"] * 60.0
        orbital_progress = ((now / period_sec) + sat["phase_offset"]) % (2.0 * math.pi)
        
        # Latitude oscillation based on inclination
        lat = sat["inclination"] * math.sin(orbital_progress)
        
        # Earth rotation + orbital revolution
        earth_rot_speed = 360.0 / 86400.0  # deg/sec
        lon = ((math.degrees(orbital_progress) * 1.2 - (now * earth_rot_speed)) % 360.0) - 180.0
        
        velocity_km_s = round(math.sqrt(398600.4418 / (6371.0 + sat["altitude_km"])), 2)

        results.append({
            "id": sat["id"],
            "name": sat["name"],
            "norad_id": sat["norad_id"],
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "altitude_km": sat["altitude_km"],
            "velocity_kms": velocity_km_s,
            "sensor_type": sat["type"],
            "telemetry_status": "OPERATIONAL_OPTIMAL",
            "coverage_radius_km": round(sat["altitude_km"] * 1.8)
        })

    return results
