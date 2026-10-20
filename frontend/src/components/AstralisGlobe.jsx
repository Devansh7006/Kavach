import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Crosshair, Satellite, Compass, RotateCcw, Flame, ShieldAlert, 
  ShieldCheck, Eye, Layers, Maximize2, Radio, Globe as GlobeIcon,
  Mic, Sliders, Volume2, ArrowRight, Plane, MapPin, Activity,
  CheckCircle2, AlertTriangle, EyeOff, Terminal, SlidersHorizontal
} from 'lucide-react';

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export default function AstralisGlobe({
  activeTarget = null,
  threatState = 'NEUTRAL', // 'NEUTRAL' | 'LEGIT' | 'THREAT'
  onSelectNode = null
}) {
  const mountRef = useRef(null);
  const globeGroupRef = useRef(null);
  const earthMeshRef = useRef(null);
  const cloudsMeshRef = useRef(null);
  const atmosphereMeshRef = useRef(null);
  const animationFrameRef = useRef(null);

  // States mirroring the exact God's Eye console in screenshots
  const [flirMode, setFlirMode] = useState(false);
  const [activeLayer, setActiveLayer] = useState('ALL'); // 'ALL' | 'FLIGHTS' | 'SATELLITES' | 'CYBER'
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState({
    callsign: "NB521",
    model: "PC21 QA353",
    status: "Operator Unknown · 18,475 ft · 229 kt",
    route: "LAX to DFW — 1983 km",
    lat: "31.50° N",
    lon: "101.79° W"
  });

  const [hudCoords, setHudCoords] = useState({
    mgrs: "13R FN 1726 7282",
    latLon: `29°34'47.05"N 103°47'21.57"W`,
    sector: "SECTOR 31.50N 101.79W | NORTH AMERICA"
  });

  const [flirSensitivity, setFlirSensitivity] = useState(75);
  const [flirBloom, setFlirBloom] = useState(60);

  // Theme Accent Colors from Image 4 (#B2F601, #62C0F6, #343645)
  const isThreat = threatState === 'THREAT';
  const isLegit = threatState === 'LEGIT';
  
  const accentColor = isThreat ? '#FF3366' : isLegit ? '#B2F601' : '#62C0F6';
  const secondaryColor = isThreat ? '#FF1744' : isLegit ? '#62C0F6' : '#B2F601';

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 2000);
    // Elevated perspective framing the globe like the satellite recon console
    camera.position.set(0, 14, 62);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mountRef.current.appendChild(renderer.domElement);

    // Deep Space Starfield (Subtle Cyber Lime & Cyan Stardust)
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#62C0F6'),
      new THREE.Color('#B2F601'),
      new THREE.Color('#343645')
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 380 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      starCol[i * 3] = c.r;
      starCol[i * 3 + 1] = c.g;
      starCol[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.75 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Globe Group with Natural Axial Tilt
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = THREE.MathUtils.degToRad(-18);
    // Face North America & Europe towards camera initially
    globeGroup.rotation.y = 1.85;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 2. Tactical Sun & Ambient Light
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
    sunLight.position.set(70, 30, 45);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x202636, 0.85);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(accentColor), 0.8);
    rimLight.position.set(-60, -20, -40);
    scene.add(rimLight);

    // 3. Realistic NASA Earth Spheres
    const textureLoader = new THREE.TextureLoader();
    const RADIUS = 24.5;

    const dayTexture = textureLoader.load('/textures/earth_day.jpg');
    const normalTexture = textureLoader.load('/textures/earth_normal.jpg');
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.9, 0.9),
      specularMap: specularTexture,
      specular: new THREE.Color(0x334466),
      shininess: 25
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Atmospheric Cloud Layer
    const cloudsGeo = new THREE.SphereGeometry(RADIUS * 1.016, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmospheric Rayleigh Limb Scattering Halo
    const atmosphereGeo = new THREE.SphereGeometry(RADIUS * 1.13, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(accentColor) }
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
        uniform vec3 glowColor;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 4. Hundreds of Tactical Asset & Flight Vectors (from Image 1 & 2)
    const flightCount = 380;
    const flightGeo = new THREE.BufferGeometry();
    const flightPos = new Float32Array(flightCount * 3);
    for (let i = 0; i < flightCount; i++) {
      // Density distributed across North America, Europe, Asia
      const lat = (Math.random() * 80) - 20;
      const lon = (Math.random() * 360) - 180;
      const vec = latLonToVector3(lat, lon, RADIUS + 0.22);
      flightPos[i * 3] = vec.x;
      flightPos[i * 3 + 1] = vec.y;
      flightPos[i * 3 + 2] = vec.z;
    }
    flightGeo.setAttribute('position', new THREE.BufferAttribute(flightPos, 3));
    const flightMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.85
    });
    const flightsPoints = new THREE.Points(flightGeo, flightMat);
    globeGroup.add(flightsPoints);

    // 5. Real Tactical Route Arcs (e.g. LAX to DFW 1983 km, SVO to DEL 4340 km)
    const TACTICAL_ROUTES = [
      { from: "California LAX", to: "Texas DFW", src: { lat: 34.05, lon: -118.24 }, dst: { lat: 32.77, lon: -96.79 }, dist: "1983 km", col: 0x62C0F6 },
      { from: "Moscow SVO", to: "New Delhi DEL", src: { lat: 55.75, lon: 37.61 }, dst: { lat: 28.61, lon: 77.20 }, dist: "4340 km", col: 0xFF3366 },
      { from: "Shanghai SHA", to: "San Francisco SFO", src: { lat: 31.23, lon: 121.47 }, dst: { lat: 37.77, lon: -122.41 }, dist: "9880 km", col: 0xB2F601 },
      { from: "Frankfurt FRA", to: "New York JFK", src: { lat: 50.11, lon: 8.68 }, dst: { lat: 40.71, lon: -74.00 }, dist: "6200 km", col: 0x62C0F6 }
    ];

    TACTICAL_ROUTES.forEach((r) => {
      const v1 = latLonToVector3(r.src.lat, r.src.lon, RADIUS);
      const v2 = latLonToVector3(r.dst.lat, r.dst.lon, RADIUS);
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const dist = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(RADIUS + dist * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const pts = curve.getPoints(45);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const arcMat = new THREE.LineBasicMaterial({ color: r.col, transparent: true, opacity: 0.8, linewidth: 2 });
      globeGroup.add(new THREE.Line(arcGeo, arcMat));

      // Endpoint beacons
      [v1, v2].forEach((v) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshBasicMaterial({ color: r.col }));
        b.position.copy(v);
        globeGroup.add(b);
      });
    });

    // 6. Orbital Satellites & Space Stations (ISS NORAD 25544)
    const satGroup = new THREE.Group();
    const REAL_ORBITALS = [
      { name: "ISS (ZARYA) NORAD 25544", radius: RADIUS + 5.8, speed: 0.007, inc: 0.9, col: 0xB2F601, alt: "420 km", vel: "7.66 km/s" },
      { name: "SENTINEL-1A NORAD 39634", radius: RADIUS + 9.5, speed: 0.005, inc: 1.15, col: 0x62C0F6, alt: "693 km", vel: "7.51 km/s" },
      { name: "KH11-4180 DEFENSE ORBIT", radius: RADIUS + 15.0, speed: 0.002, inc: 0.45, col: 0xFF3366, alt: "12,400 km", vel: "4.82 km/s" }
    ];

    const satItems = REAL_ORBITALS.map((s) => {
      const orbitCurve = new THREE.EllipseCurve(0, 0, s.radius, s.radius, 0, 2 * Math.PI, false, 0);
      const pts = orbitCurve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const mat = new THREE.LineBasicMaterial({ color: s.col, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(geo, mat);
      line.rotation.x = s.inc;
      satGroup.add(line);

      // Satellite mesh
      const craft = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.9), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 }));
      const wings = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.7), new THREE.MeshBasicMaterial({ color: s.col }));
      craft.add(body, wings);
      satGroup.add(craft);

      // Sensor cone
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(3.2, s.radius - RADIUS, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: s.col, transparent: true, opacity: 0.06, wireframe: true })
      );
      satGroup.add(cone);

      return { ...s, craft, cone, angle: Math.random() * Math.PI * 2 };
    });
    globeGroup.add(satGroup);

    // 7. Interactive Mouse Orbit Controls
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

      const cLat = Math.round((globeGroup.rotation.x * 180 / Math.PI) % 90);
      const cLon = Math.round((globeGroup.rotation.y * 180 / Math.PI) % 180);
      setHudCoords({
        mgrs: `13R ${Math.abs(cLat * 14 + 10)} ${Math.abs(cLon * 19 + 20)}`,
        latLon: `${Math.abs(cLat)}°${Math.abs(cLat * 3 % 60)}'N ${Math.abs(cLon)}°${Math.abs(cLon * 5 % 60)}'W`,
        sector: `GLOBAL SECTOR ${Math.abs(cLat)}.50N ${Math.abs(cLon)}.79W | RECON ACTIVE`
      });
    };

    const onMouseUp = () => { isDragging = false; };
    const domElem = mountRef.current;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0012;
      }
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0004;
      }

      // Update Satellites
      satItems.forEach((sat) => {
        sat.angle += sat.speed;
        const x = sat.radius * Math.cos(sat.angle);
        const z = sat.radius * Math.sin(sat.angle) * Math.cos(sat.inc);
        const y = sat.radius * Math.sin(sat.angle) * Math.sin(sat.inc);
        sat.craft.position.set(x, y, z);
        sat.craft.lookAt(0, 0, 0);

        sat.cone.position.set(x * 0.5, y * 0.5, z * 0.5);
        sat.cone.lookAt(x, y, z);
      });

      renderer.render(scene, camera);
    };
    animate();

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
  }, []);

  // Update Atmosphere Color on Threat State Change
  useEffect(() => {
    if (atmosphereMeshRef.current && atmosphereMeshRef.current.material.uniforms) {
      atmosphereMeshRef.current.material.uniforms.glowColor.value.setHex(new THREE.Color(accentColor).getHex());
    }
  }, [threatState]);

  // Handle FLIR Mode switch
  useEffect(() => {
    if (!earthMeshRef.current) return;
    if (flirMode) {
      // Thermal FLIR Shader Material (Image 3)
      earthMeshRef.current.material.color.setHex(0xff3300);
      earthMeshRef.current.material.wireframe = false;
      if (atmosphereMeshRef.current) {
        atmosphereMeshRef.current.material.uniforms.glowColor.value.setHex(0xff0044);
      }
    } else {
      earthMeshRef.current.material.color.setHex(0xffffff);
      if (atmosphereMeshRef.current) {
        atmosphereMeshRef.current.material.uniforms.glowColor.value.setHex(new THREE.Color(accentColor).getHex());
      }
    }
  }, [flirMode]);

  return (
    <div className={`relative w-full h-[680px] overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0b0e17] shadow-[0_24px_70px_rgba(0,0,0,0.85)] font-mono-hud transition-all duration-500 ${
      flirMode ? 'ring-2 ring-red-500/50' : ''
    }`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP STREAM TELEMETRY BAR (Exact from Image 2: E VIS:5049 SRC:5723 DENS:75% ELASTIC 3.1ms) */}
      <div className="absolute top-3 left-6 right-6 z-20 pointer-events-none flex items-center justify-between text-[11px] text-[#62C0F6]/80 font-bold border-b border-white/[0.08] pb-1.5">
        <div className="flex items-center gap-4">
          <span className="text-[#B2F601] tracking-widest font-black">E VIS: 5049</span>
          <span>SRC: 5723</span>
          <span>DENS: 75%</span>
          <span className="text-white">ELASTIC: 3.1ms</span>
          <span className="text-slate-400 hidden md:inline">| BUFFER: 100% OK</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#B2F601] animate-ping" />
          <span className="text-[#B2F601] font-extrabold uppercase tracking-wider">
            {flirMode ? "SPECTRUM: FLIR THERMAL ACTIVE" : "SPECTRUM: OPTICAL SATELLITE RADAR"}
          </span>
        </div>
      </div>

      {/* TOP LEFT: MILITARY INTELLIGENCE HEADER (Exact layout from Images 1 & 2) */}
      <div className="absolute top-10 left-6 z-20 pointer-events-none flex flex-col gap-2.5 max-w-sm">
        {/* Title & Glowing Recon Eye */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#62C0F6]/20 border border-[#62C0F6]/50 flex items-center justify-center glow-cyan">
            <Radio className="w-4 h-4 text-[#62C0F6] animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-tactical text-white tracking-wider flex items-center gap-1.5">
              AURA <span className="text-[#62C0F6] font-light">// SPATIAL RECON</span>
            </h1>
            <div className="text-[10px] text-slate-400 font-bold tracking-widest">0 PLACE LEFT BEHIND</div>
          </div>
        </div>

        {/* TOP SECRET Header Stamp */}
        <div className="space-y-1">
          <div className="text-[10px] tracking-widest font-extrabold text-[#62C0F6]">
            TOP SECRET // SI-TK // NOFORN
          </div>
          <div className="text-[11px] text-slate-400">KH11-4180 OPS-4127</div>
          <div className={`text-xl font-black tracking-tight font-tactical ${
            isThreat ? 'text-[#FF3366]' : 'text-[#B2F601]'
          }`}>
            {isThreat ? "CRITICAL THREAT" : "NORMAL"}
          </div>
          <div className="text-[11px] text-slate-300 leading-snug">
            SUMMARY: {hudCoords.sector}
          </div>
        </div>

        {/* Tactical Buttons [DATA LAYERS +] [MAP STACK +] [SCENES +] */}
        <div className="flex items-center gap-2 pt-1 pointer-events-auto">
          {["DATA LAYERS +", "MAP STACK +", "SCENES +"].map((btn, idx) => (
            <button
              key={idx}
              className="px-2.5 py-1 rounded bg-[#343645]/70 hover:bg-[#62C0F6]/20 text-[10px] font-bold text-slate-200 border border-white/[0.1] hover:border-[#62C0F6]/40 transition-all shadow-md backdrop-blur-md"
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* TOP RIGHT: RECORDING STATUS & SATELLITE PASS (Exact from Images 1 & 2) */}
      <div className="absolute top-10 right-6 z-20 pointer-events-none flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-pulse" />
          <span className="text-slate-300">REC 2026-10-20 18:25:00 UTC</span>
        </div>
        <div className="text-[10px] text-slate-400 tracking-wider">
          ORB: 47920 PASS: DESCENDING
        </div>

        {/* FLIR Mode Toggle & Reset Controls */}
        <div className="flex items-center gap-2 pt-2 pointer-events-auto">
          <button
            onClick={() => setFlirMode(!flirMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-lg ${
              flirMode 
                ? 'bg-[#FF3366] text-white border-red-400 glow-crimson animate-pulse' 
                : 'bg-[#343645]/80 text-[#B2F601] border-[#B2F601]/40 hover:bg-[#B2F601]/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{flirMode ? "FLIR ON (THERMAL)" : "FLIR MODE"}</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              autoRotate 
                ? 'bg-[#62C0F6]/20 border-[#62C0F6]/50 text-[#62C0F6]' 
                : 'bg-[#343645]/80 border-white/[0.1] text-slate-400'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FLIR PARAMETERS SIDEBAR (Appears when FLIR mode is engaged - Image 3) */}
      {flirMode && (
        <div className="absolute right-6 top-32 z-20 p-4 rounded-2xl hud-glass-panel border-red-500/40 text-xs text-slate-200 space-y-3 w-60 animate-in fade-in slide-in-from-right-2">
          <div className="flex items-center justify-between text-[#FF3366] font-bold border-b border-red-500/20 pb-1.5">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>FLIR PARAMETERS</span>
            </span>
            <span className="text-[10px]">INFRARED</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Sensitivity:</span>
                <span className="text-white font-bold">{flirSensitivity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={flirSensitivity}
                onChange={(e) => setFlirSensitivity(e.target.value)}
                className="w-full accent-red-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Thermal Bloom:</span>
                <span className="text-white font-bold">{flirBloom}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={flirBloom}
                onChange={(e) => setFlirBloom(e.target.value)}
                className="w-full accent-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button className="py-1 rounded bg-black/60 border border-red-500/30 text-[10px] text-white">WHOT</button>
              <button className="py-1 rounded bg-red-950/80 border border-red-500 text-[10px] text-red-200 font-bold">BHOT</button>
            </div>
          </div>
        </div>
      )}

      {/* CENTER COCKPIT CROSSHAIR RETICLE */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative w-72 h-72 border border-white/[0.08] rounded-full flex items-center justify-center">
          <div className="absolute inset-4 border border-dashed border-[#62C0F6]/25 rounded-full" />
          <Crosshair className="w-10 h-10 text-[#62C0F6]/30" />
          <div className="absolute bottom-5 text-[9px] font-bold text-[#B2F601] tracking-widest uppercase">
            TARGET SECTOR LOCKED // NORMAL
          </div>
        </div>
      </div>

      {/* INTERACTIVE FLIGHT / ASSET TOOLTIP (Exact from Image 2: NB521 · Operator unknown · 10475 ft · 229 kt) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-20 p-2.5 rounded-xl bg-black/85 border border-[#62C0F6]/40 text-xs text-white backdrop-blur-xl shadow-2xl pointer-events-auto">
        <div className="font-extrabold text-[#B2F601] flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-[#62C0F6]" />
          <span>{selectedEntity.callsign}</span>
          <span className="text-[10px] text-slate-400">({selectedEntity.model})</span>
        </div>
        <div className="text-[11px] text-slate-300 mt-0.5">{selectedEntity.status}</div>
        <div className="text-[10px] text-[#62C0F6] font-bold mt-1">{selectedEntity.route}</div>
      </div>

      {/* BOTTOM LEFT: MGRS & EXACT LAT/LON COORDINATES (Exact from Images 1 & 2) */}
      <div className="absolute bottom-16 left-6 z-20 pointer-events-none space-y-1">
        <div className="text-xs font-bold text-[#62C0F6] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#B2F601]" />
          <span>MGRS: {hudCoords.mgrs}</span>
        </div>
        <div className="text-[11px] text-slate-300 font-bold">{hudCoords.latLon}</div>
        <div className="text-[9px] text-slate-500">[CESIUM ion High-Precision Geodesic Grid]</div>
      </div>

      {/* CENTER BOTTOM: AI CONSOLE MIC PILL (Exact from Images 1, 2, 3) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-black/85 border border-white/[0.12] backdrop-blur-2xl shadow-2xl">
        <button className="px-3 py-1.5 rounded-xl bg-[#343645]/70 hover:bg-[#62C0F6]/20 text-[11px] font-bold text-slate-200 transition-all flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#B2F601]" />
          <span>LOCATION</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#62C0F6]/15 border border-[#62C0F6]/30 text-xs font-bold text-[#62C0F6]">
          <Mic className="w-3.5 h-3.5 text-[#B2F601] animate-pulse" />
          <span className="tracking-wider">AI RECON ACTIVE // LISTENING</span>
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-full bg-[#B2F601] animate-pulse" />
            <span className="w-0.5 h-2 bg-[#62C0F6]" />
            <span className="w-0.5 h-3.5 bg-[#B2F601] animate-pulse" />
          </div>
        </div>

        <button className="px-3 py-1.5 rounded-xl bg-[#343645]/70 hover:bg-[#62C0F6]/20 text-[11px] font-bold text-slate-200 transition-all flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-[#62C0F6]" />
          <span>VISUAL PRESETS</span>
        </button>
      </div>
    </div>
  );
}
