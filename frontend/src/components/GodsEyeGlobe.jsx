import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Crosshair, Eye, ShieldAlert, Satellite, Radio, Compass, RotateCcw, Flame } from 'lucide-react';

// Converts Lat/Lon to 3D Cartesian Vector on sphere of radius R
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export default function GodsEyeGlobe({
  activeTarget = null,
  hops = [],
  satellites = [],
  attackArcs = [],
  onSelectNode = null
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const animationFrameRef = useRef(null);
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  const [flirMode, setFlirMode] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showArcs, setShowArcs] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hudCoords, setHudCoords] = useState({ lat: '28.6139° N', lon: '77.2090° E', mgrs: '43R EK 9104' });
  const [lockedEntity, setLockedEntity] = useState(null);

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 30, 85);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 2. Earth Sphere & Cyber Grid
    const RADIUS = 28;
    const earthGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    
    // Cyber Grid Material
    const gridMat = new THREE.MeshBasicMaterial({
      color: flirMode ? 0x00ff44 : 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const gridMesh = new THREE.Mesh(earthGeo, gridMat);
    globeGroup.add(gridMesh);

    // Inner Dark Core Sphere
    const coreMat = new THREE.MeshBasicMaterial({
      color: flirMode ? 0x001a08 : 0x030814,
      transparent: true,
      opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.99, 48, 48), coreMat);
    globeGroup.add(coreMesh);

    // Glowing Atmosphere Halo
    const haloGeo = new THREE.SphereGeometry(RADIUS * 1.08, 32, 32);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(flirMode ? 0x00ff55 : 0x00b4d8) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 color;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(color, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // 3. Render Continental Landmass Dots (Sampling global locations)
    const DOT_COUNT = 850;
    const dotGeo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < DOT_COUNT; i++) {
      // Golden spiral distribution on sphere
      const y = 1 - (i / (DOT_COUNT - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = 2.399963229728653 * i; // golden angle
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      positions.push(x * RADIUS, y * RADIUS, z * RADIUS);
      colors.push(flirMode ? 0.0 : 0.0, flirMode ? 1.0 : 0.94, flirMode ? 0.3 : 1.0);
    }

    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.55
    });
    const landDots = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(landDots);

    // 4. Defense Hotspot Nodes
    const DEFENSE_HUBS = [
      { name: "KAVACH Cyber HQ", lat: 28.6139, lon: 77.2090, type: "COMMAND", color: 0x00ff88 },
      { name: "Hostile C2 Node", lat: 55.7558, lon: 37.6173, type: "THREAT_C2", color: 0xff3366 },
      { name: "Phish Botnet Relay", lat: 59.9343, lon: 30.3351, type: "THREAT_RELAY", color: 0xff3366 },
      { name: "APT Harvester", lat: 31.2304, lon: 121.4737, type: "THREAT_APT", color: 0xff9900 },
      { name: "Offshore VPS Hub", lat: 52.3676, lon: 4.9041, type: "PROXY", color: 0xffaa00 },
      { name: "US West Sensor Node", lat: 37.7749, lon: -122.4194, type: "SENSOR", color: 0x00f0ff },
      { name: "US East SES Gateway", lat: 38.9072, lon: -77.0369, type: "GATEWAY", color: 0x00f0ff }
    ];

    const hubGroup = new THREE.Group();
    DEFENSE_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, RADIUS + 0.3);
      
      // Node Marker Beacon
      const markerGeo = new THREE.SphereGeometry(hub.type.startsWith("THREAT") ? 0.9 : 0.7, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      hubGroup.add(marker);

      // Pulsing Ring
      const ringGeo = new THREE.RingGeometry(1.2, 1.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      hubGroup.add(ring);
    });
    globeGroup.add(hubGroup);

    // 5. Orbital Satellites & Trajectories
    const satGroup = new THREE.Group();
    const SATS_DATA = [
      { name: "KAVACH Sentinel-1 (LEO)", radius: RADIUS + 8, speed: 0.008, inclination: 0.6, color: 0x00ff88 },
      { name: "KAVACH Cyber-Interceptor (SSO)", radius: RADIUS + 12, speed: 0.006, inclination: 1.4, color: 0x00f0ff },
      { name: "KAVACH Geo-Guardian (GEO)", radius: RADIUS + 18, speed: 0.002, inclination: 0.1, color: 0xffb703 }
    ];

    const satMeshes = SATS_DATA.map((s) => {
      // Orbital Ring Line
      const orbitCurve = new THREE.EllipseCurve(0, 0, s.radius, s.radius, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(64);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMat = new THREE.LineBasicMaterial({
        color: s.color,
        transparent: true,
        opacity: 0.25
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = s.inclination;
      satGroup.add(orbitLine);

      // Satellite Object
      const satBoxGeo = new THREE.BoxGeometry(0.8, 0.4, 1.2);
      const satBoxMat = new THREE.MeshBasicMaterial({ color: s.color });
      const satMesh = new THREE.Mesh(satBoxGeo, satBoxMat);
      satGroup.add(satMesh);

      // Ground Scan Conical Ray
      const coneGeo = new THREE.ConeGeometry(3.5, s.radius - RADIUS, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: s.color,
        transparent: true,
        opacity: 0.08,
        wireframe: true
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      satGroup.add(coneMesh);

      return { ...s, mesh: satMesh, cone: coneMesh, angle: Math.random() * Math.PI * 2 };
    });
    globeGroup.add(satGroup);

    // 6. Attack Arc Curves
    const arcGroup = new THREE.Group();
    const arcPairs = [
      { src: { lat: 55.7558, lon: 37.6173 }, dst: { lat: 28.6139, lon: 77.2090 }, color: 0xff3366 },
      { src: { lat: 59.9343, lon: 30.3351 }, dst: { lat: 38.9072, lon: -77.0369 }, color: 0xff3366 },
      { src: { lat: 31.2304, lon: 121.4737 }, dst: { lat: 37.7749, lon: -122.4194 }, color: 0xff9900 },
      { src: { lat: 52.3676, lon: 4.9041 }, dst: { lat: 28.6139, lon: 77.2090 }, color: 0x00f0ff }
    ];

    arcPairs.forEach((arc) => {
      const v1 = latLonToVector3(arc.src.lat, arc.src.lon, RADIUS);
      const v2 = latLonToVector3(arc.dst.lat, arc.dst.lon, RADIUS);

      // Compute midpoint elevated above surface for trajectory arc
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const dist = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(RADIUS + dist * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const curvePoints = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: arc.color,
        transparent: true,
        opacity: 0.7,
        linewidth: 2
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(arcLine);
    });
    globeGroup.add(arcGroup);

    // 7. Mouse Orbit Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };

      // Update HUD telemetry based on rotation
      const calcLat = Math.round((globeGroup.rotation.x * 180 / Math.PI) % 90);
      const calcLon = Math.round((globeGroup.rotation.y * 180 / Math.PI) % 180);
      setHudCoords({
        lat: `${Math.abs(calcLat)}° ${calcLat >= 0 ? 'N' : 'S'}`,
        lon: `${Math.abs(calcLon)}° ${calcLon >= 0 ? 'E' : 'W'}`,
        mgrs: `43R ${Math.abs(calcLat * 12 + 10)} ${Math.abs(calcLon * 18 + 20)}`
      });
    };

    const onMouseUp = () => { isDragging = false; };
    const domElem = mountRef.current;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow idle rotation when not dragging
      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0018;
      }

      // Update Satellites
      satMeshes.forEach((sat) => {
        sat.angle += sat.speed;
        const x = sat.radius * Math.cos(sat.angle);
        const z = sat.radius * Math.sin(sat.angle) * Math.cos(sat.inclination);
        const y = sat.radius * Math.sin(sat.angle) * Math.sin(sat.inclination);
        sat.mesh.position.set(x, y, z);
        sat.mesh.lookAt(0, 0, 0);

        // Ground cone position
        sat.cone.position.set(x * 0.5, y * 0.5, z * 0.5);
        sat.cone.lookAt(x, y, z);
      });

      // Camera smooth zoom / tracking
      camera.lookAt(targetLookAtRef.current);
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('mousedown', onMouseDown);
      if (renderer.domElement && domElem.contains(renderer.domElement)) {
        domElem.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [flirMode]);

  // When activeTarget changes (e.g., from email hop or image EXIF GPS), animate globe rotation
  useEffect(() => {
    if (activeTarget && activeTarget.lat !== undefined && activeTarget.lon !== undefined) {
      setAutoRotate(false);
      setLockedEntity(activeTarget);
      
      // Calculate target rotation for Globe
      if (globeGroupRef.current) {
        const phi = (activeTarget.lat) * (Math.PI / 180);
        const theta = -(activeTarget.lon) * (Math.PI / 180);
        
        // Smooth target orientation
        globeGroupRef.current.rotation.x = phi * 0.5;
        globeGroupRef.current.rotation.y = theta + Math.PI / 2;
      }

      setHudCoords({
        lat: `${activeTarget.lat.toFixed(4)}°`,
        lon: `${activeTarget.lon.toFixed(4)}°`,
        mgrs: `TARGET ACQUIRED: ${activeTarget.city || 'COORDINATE LOCK'}`
      });
    }
  }, [activeTarget]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-xl border border-cyan-500/30 bg-[#02050c]">
      {/* 3D Canvas Mounting Area */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* GOD'S EYE CYBER HUD OVERLAYS */}
      {/* Top Left: Satellite & Defense Constellation Status */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/70 border border-cyan-400/40 text-cyan-300 font-mono-cyber text-xs tracking-wider">
          <Satellite className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>GOD'S EYE VIEW // REAL-TIME ORBITAL RADAR</span>
        </div>
        
        <div className="p-2.5 rounded bg-black/60 border border-cyan-500/20 text-[11px] font-mono-cyber text-slate-300 space-y-1 backdrop-blur-md">
          <div className="text-cyan-400 flex items-center justify-between">
            <span>SURVEILLANCE GRID:</span>
            <span className="text-emerald-400 font-bold">ONLINE (100%)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">SAT-01 (LEO):</span>
            <span className="text-cyan-300">540 KM // 7.6 KM/S</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">SAT-02 (SSO):</span>
            <span className="text-cyan-300">680 KM // SIGINT INTERCEPT</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">DEFENSE STATUS:</span>
            <span className="text-amber-400 font-bold">DEFCON 2</span>
          </div>
        </div>
      </div>

      {/* Top Right: Tactical Controls & FLIR Night Vision Toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setFlirMode(!flirMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono-cyber text-xs transition-all border ${
            flirMode 
              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 glow-emerald' 
              : 'bg-black/70 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20'
          }`}
          title="Toggle FLIR Thermal / Cyber Night-Vision Mode"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{flirMode ? 'FLIR THERMAL ON' : 'OPTICAL SPECTRUM'}</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded font-mono-cyber text-xs border ${
            autoRotate 
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200' 
              : 'bg-black/70 border-slate-600 text-slate-400'
          }`}
          title="Toggle Earth Auto-Rotation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Tactical Crosshair */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative w-48 h-48 border border-cyan-500/15 rounded-full flex items-center justify-center">
          <div className="absolute inset-2 border border-dashed border-cyan-500/20 rounded-full animate-radar" />
          <Crosshair className="w-10 h-10 text-cyan-400/30" />
          <div className="absolute top-2 text-[9px] font-mono-cyber text-cyan-500/60 tracking-widest">
            {lockedEntity ? `LOCKED: ${lockedEntity.city || 'NODE'}` : 'TRACKING PASSIVE'}
          </div>
        </div>
      </div>

      {/* Bottom Center: Live Coordinates & Targeting Telemetry */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-black/80 border border-cyan-500/40 text-xs font-mono-cyber text-cyan-300 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>GEO-RADAR:</span>
          </div>
          <span>LAT: <strong className="text-white">{hudCoords.lat}</strong></span>
          <span>LON: <strong className="text-white">{hudCoords.lon}</strong></span>
          <span className="text-amber-400 hidden sm:inline">[{hudCoords.mgrs}]</span>
        </div>
      </div>

      {/* Bottom Right: Active Target Node Card */}
      {activeTarget && (
        <div className="absolute bottom-4 right-4 z-20 p-3 rounded bg-black/85 border border-red-500/40 text-xs font-mono-cyber text-slate-200 backdrop-blur-md max-w-xs shadow-xl">
          <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>INTERCEPT TARGET LOCATED</span>
          </div>
          <div className="text-white text-sm font-semibold">{activeTarget.city || 'Unknown Node'}, {activeTarget.country || 'Global'}</div>
          <div className="text-slate-400 text-[11px] mt-0.5">IP: <span className="text-cyan-300">{activeTarget.ip || 'Classified'}</span></div>
          <div className="text-slate-400 text-[11px]">ISP/ORG: <span className="text-slate-200">{activeTarget.org || 'Unregistered Uplink'}</span></div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">THREAT RISK:</span>
            <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 font-bold border border-red-500/50">
              {activeTarget.threat_risk || 85}% CRITICAL
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
