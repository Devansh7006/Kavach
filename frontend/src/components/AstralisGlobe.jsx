import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Crosshair, Satellite, Compass, RotateCcw, Flame, ShieldAlert, 
  ShieldCheck, Eye, Layers, Maximize2, Radio, Globe as GlobeIcon,
  Sparkles, Activity, Cpu, ArrowUpRight
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
  satellites = [],
  attackArcs = [],
  onSelectNode = null
}) {
  const mountRef = useRef(null);
  const globeGroupRef = useRef(null);
  const cloudsMeshRef = useRef(null);
  const atmosphereMeshRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [flirMode, setFlirMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showSatellites, setShowSatellites] = useState(true);
  const [hudCoords, setHudCoords] = useState({ 
    lat: '28.6139° N', 
    lon: '77.2090° E', 
    city: 'New Delhi (Command HQ)', 
    mgrs: '43R EK 9104',
    altitude: '35,786 km'
  });
  const [lockedNode, setLockedNode] = useState(null);

  // Dynamic Theme Colors based on Image 2 Palette & Threat State
  const themeColors = {
    NEUTRAL: { 
      primary: 0xB853CF, // Fluxberry
      secondary: 0xF9A1F8, // Blossom
      accent: 0xFFD8AD, // Light Peach
      glow: 0x9333ea,
      starGlow: 0xF9A1F8
    },
    LEGIT: { 
      primary: 0x00ff9f, 
      secondary: 0x00e5a3, 
      accent: 0x76ffd6, 
      glow: 0x00ff9f,
      starGlow: 0x00ff9f
    },
    THREAT: { 
      primary: 0xff3366, 
      secondary: 0xff1744, 
      accent: 0xff8a80, 
      glow: 0xff3366,
      starGlow: 0xff3366
    }
  }[threatState] || {
    primary: 0xB853CF,
    secondary: 0xF9A1F8,
    accent: 0xFFD8AD,
    glow: 0x9333ea,
    starGlow: 0xF9A1F8
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1500);
    // Cinematic camera angle: elevated, showcasing the Earth's illuminated curvature
    camera.position.set(0, 10, 68);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mountRef.current.appendChild(renderer.domElement);

    // Deep Space Starfield with Cyber Pastel hues (Matching Image 2)
    const starCount = 2200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const paletteColors = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#FFD8AD'), // Light peach
      new THREE.Color('#F9A1F8'), // Blossom
      new THREE.Color('#B853CF'), // Fluxberry
      new THREE.Color('#00f5ff')
    ];

    for (let i = 0; i < starCount; i++) {
      // Spherical distribution around deep space
      const r = 350 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Globe Main Group with Natural 23.44° Axial Tilt
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = THREE.MathUtils.degToRad(-15);
    // Initial rotation presenting lit continents (Europe/India/Asia/Africa)
    globeGroup.rotation.y = 2.8;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 2. Cinematic Lighting (Golden Hour Sun + Ambient Earth Glow)
    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.8);
    sunLight.position.set(75, 25, 45);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1e2040, 0.85);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(themeColors.primary, 0.9);
    rimLight.position.set(-65, -15, -45);
    scene.add(rimLight);

    // 3. Texture Loader for NASA Blue Marble Earth
    const textureLoader = new THREE.TextureLoader();
    const RADIUS = 25;

    const dayTexture = textureLoader.load('/textures/earth_day.jpg');
    const normalTexture = textureLoader.load('/textures/earth_normal.jpg');
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');

    // Earth Sphere Mesh
    const earthGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.9, 0.9),
      specularMap: specularTexture,
      specular: new THREE.Color(0x334466),
      shininess: 24
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Dynamic Atmospheric Cloud Sphere
    const cloudsGeo = new THREE.SphereGeometry(RADIUS * 1.018, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Outer Atmospheric Rayleigh Limb Scattering Halo
    const atmosphereGeo = new THREE.SphereGeometry(RADIUS * 1.14, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(themeColors.glow) }
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
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.4);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 4. Ground Defense Hotspot Nodes (Genuine Coordinates)
    const REAL_NODES = [
      { name: "New Delhi (KAVACH Command HQ)", lat: 28.6139, lon: 77.2090, type: "HQ", color: 0x00ff9f },
      { name: "Moscow Uplink (Bulletproof Host)", lat: 55.7558, lon: 37.6173, type: "THREAT", color: 0xff3366 },
      { name: "St. Petersburg Phish Relay", lat: 59.9343, lon: 30.3351, type: "THREAT", color: 0xff3366 },
      { name: "Shanghai APT Infiltration Gateway", lat: 31.2304, lon: 121.4737, type: "THREAT", color: 0xB853CF },
      { name: "Ashburn (AWS SES Cloud Backbone)", lat: 38.9072, lon: -77.0369, type: "GATEWAY", color: 0xFFD8AD },
      { name: "Amsterdam Transit Proxy", lat: 52.3676, lon: 4.9041, type: "PROXY", color: 0xF9A1F8 },
      { name: "San Francisco Defense Grid", lat: 37.7749, lon: -122.4194, type: "SENSOR", color: 0x00f5ff }
    ];

    REAL_NODES.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, RADIUS + 0.16);
      
      // Node Beacon
      const beaconGeo = new THREE.SphereGeometry(node.type === "HQ" ? 0.75 : 0.55, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: node.color });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos);
      globeGroup.add(beaconMesh);

      // Beacon Target Ring
      const ringGeo = new THREE.RingGeometry(0.85, 1.25, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ringMesh);
    });

    // 5. Orbital Satellites with 3D Solar Panels & Conical Sensor Rays
    const satGroup = new THREE.Group();
    const REAL_SATELLITES = [
      { name: "ISS (ZARYA) // NORAD 25544", radius: RADIUS + 6.2, speed: 0.0075, inc: 0.9, color: 0x00ff9f, alt: "420 km", vel: "7.66 km/s", type: "Tactical Recon" },
      { name: "SENTINEL-1A // NORAD 39634", radius: RADIUS + 10.5, speed: 0.0055, inc: 1.15, color: 0xF9A1F8, alt: "693 km", vel: "7.51 km/s", type: "SAR Radar Recon" },
      { name: "KAVACH AURA-3 (GEO)", radius: RADIUS + 18.0, speed: 0.0018, inc: 0.12, color: 0xFFD8AD, alt: "35,786 km", vel: "3.07 km/s", type: "Early Warning Constellation" }
    ];

    const satInstances = REAL_SATELLITES.map((sat) => {
      // Orbital Ring Line
      const orbitCurve = new THREE.EllipseCurve(0, 0, sat.radius, sat.radius, 0, 2 * Math.PI, false, 0);
      const pts = orbitCurve.getPoints(72);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMat = new THREE.LineBasicMaterial({ color: sat.color, transparent: true, opacity: 0.32 });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = sat.inc;
      satGroup.add(orbitLine);

      // Satellite Craft Body + Solar Array Wings
      const satCraft = new THREE.Group();
      
      const busGeo = new THREE.BoxGeometry(0.75, 0.45, 0.95);
      const busMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.85 });
      const busMesh = new THREE.Mesh(busGeo, busMat);
      satCraft.add(busMesh);

      // Solar Wings with Cyber Pastel Glare
      const wingGeo = new THREE.BoxGeometry(2.6, 0.08, 0.75);
      const wingMat = new THREE.MeshBasicMaterial({ color: sat.color });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      satCraft.add(wingMesh);

      satGroup.add(satCraft);

      // Ground Scan Conic Beam
      const coneGeo = new THREE.ConeGeometry(3.6, sat.radius - RADIUS, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: sat.color,
        transparent: true,
        opacity: 0.07,
        wireframe: true
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      satGroup.add(coneMesh);

      return { ...sat, craft: satCraft, cone: coneMesh, angle: Math.random() * Math.PI * 2 };
    });
    globeGroup.add(satGroup);

    // 6. Global Cyber Intercept Arcs
    const arcGroup = new THREE.Group();
    const ARC_ROUTES = [
      { src: { lat: 55.7558, lon: 37.6173 }, dst: { lat: 28.6139, lon: 77.2090 }, color: 0xff3366 },
      { src: { lat: 59.9343, lon: 30.3351 }, dst: { lat: 38.9072, lon: -77.0369 }, color: 0xff3366 },
      { src: { lat: 31.2304, lon: 121.4737 }, dst: { lat: 37.7749, lon: -122.4194 }, color: 0xB853CF },
      { src: { lat: 52.3676, lon: 4.9041 }, dst: { lat: 28.6139, lon: 77.2090 }, color: 0x00f5ff }
    ];

    ARC_ROUTES.forEach((route) => {
      const v1 = latLonToVector3(route.src.lat, route.src.lon, RADIUS);
      const v2 = latLonToVector3(route.dst.lat, route.dst.lon, RADIUS);
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(RADIUS + distance * 0.38);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const curvePts = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
      const arcMat = new THREE.LineBasicMaterial({
        color: route.color,
        transparent: true,
        opacity: 0.78,
        linewidth: 2
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(arcLine);
    });
    globeGroup.add(arcGroup);

    // 7. Smooth Interactive Mouse Orbit Controls
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
        lat: `${Math.abs(cLat)}° ${cLat >= 0 ? 'N' : 'S'}`,
        lon: `${Math.abs(cLon)}° ${cLon >= 0 ? 'E' : 'W'}`,
        city: 'Free Orbital Reconnaissance',
        mgrs: `43R ${Math.abs(cLat * 14 + 10)} ${Math.abs(cLon * 19 + 20)}`,
        altitude: `${(35786 - Math.abs(cLat) * 200).toLocaleString()} km`
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

      // Smooth Natural Rotation
      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0015;
      }

      // Clouds rotate slightly faster than Earth for genuine atmospheric realism
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.00045;
      }

      // Update Satellites
      satInstances.forEach((sat) => {
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
      atmosphereMeshRef.current.material.uniforms.glowColor.value.setHex(themeColors.glow);
    }
  }, [threatState]);

  // Handle activeTarget coordinate lock
  useEffect(() => {
    if (activeTarget && activeTarget.lat !== undefined && activeTarget.lon !== undefined) {
      setAutoRotate(false);
      setLockedNode(activeTarget);

      if (globeGroupRef.current) {
        const phi = (activeTarget.lat) * (Math.PI / 180);
        const theta = -(activeTarget.lon) * (Math.PI / 180);
        globeGroupRef.current.rotation.x = phi * 0.5;
        globeGroupRef.current.rotation.y = theta + Math.PI / 2;
      }

      setHudCoords({
        lat: `${activeTarget.lat.toFixed(4)}°`,
        lon: `${activeTarget.lon.toFixed(4)}°`,
        city: activeTarget.city || 'Spatial Node',
        mgrs: `TARGET LOCKED // ${activeTarget.city || 'COORDINATES'}`,
        altitude: '540 km (LEO Track)'
      });
    }
  }, [activeTarget]);

  return (
    <div className="relative w-full h-full min-h-[640px] overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0d0e20] shadow-[0_20px_60px_rgba(7,8,20,0.8)]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP LEFT: SPATIAL RECONNAISSANCE HUD (21st.dev Style Pill Arch) */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none flex flex-col gap-3">
        <div className="star-arch-badge">
          <div className="star-icon-bubble">
            <span className="text-[#FFD8AD] text-xs font-bold leading-none">✦</span>
          </div>
          <span className="font-heading font-bold tracking-wider text-white">ASTRALIS 3D</span>
          <span className="text-[10px] text-[#B853CF] uppercase font-mono-code font-bold">// SPATIAL RECON</span>
        </div>

        <div className="p-4 rounded-2xl cyber-glass text-xs font-mono-code text-slate-300 space-y-2 min-w-[280px]">
          <div className="flex justify-between items-center text-[#F9A1F8] pb-1.5 border-b border-white/[0.08]">
            <span className="text-[11px] font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00ff9f]" />
              <span>ORBITAL RECONNAISSANCE:</span>
            </span>
            <span className="text-[#00ff9f] font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#00ff9f]/10 border border-[#00ff9f]/30">
              SYNCHRONIZED
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">ISS (NORAD 25544):</span>
            <span className="text-white font-semibold">420 km // 7.66 km/s</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">SENTINEL-1A (39634):</span>
            <span className="text-[#FFD8AD] font-semibold">693 km // SAR Radar</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">AURA-GEO 3:</span>
            <span className="text-[#F9A1F8] font-semibold">35,786 km // Early Warning</span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT: CONTROLS & CAMERA RESET */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2.5">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono-code text-xs backdrop-blur-xl border transition-all ${
            autoRotate 
              ? 'bg-[#B853CF]/20 border-[#B853CF]/50 text-[#FFD8AD] shadow-[0_0_15px_rgba(184,83,207,0.3)]' 
              : 'bg-[#171836]/70 border-white/[0.1] text-slate-400 hover:text-white'
          }`}
          title="Toggle Planetary Rotation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{autoRotate ? 'ORBIT ACTIVE' : 'PAUSED'}</span>
        </button>

        <button
          onClick={() => {
            if (globeGroupRef.current) {
              globeGroupRef.current.rotation.set(THREE.MathUtils.degToRad(-15), 2.8, 0);
              setAutoRotate(true);
              setLockedNode(null);
            }
          }}
          className="p-2.5 rounded-xl bg-[#171836]/70 hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 backdrop-blur-xl transition-all shadow-lg"
          title="Reset Camera Center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* CENTER TACTICAL RETICLE */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative w-64 h-64 border border-white/[0.08] rounded-full flex items-center justify-center">
          <div className="absolute inset-4 border border-dashed border-[#B853CF]/25 rounded-full" />
          <Crosshair className="w-9 h-9 text-[#F9A1F8]/35" />
          <div className="absolute bottom-4 text-[9px] font-mono-code text-[#FFD8AD]/70 tracking-widest uppercase">
            {lockedNode ? `LOCKED: ${lockedNode.city || 'NODE'}` : 'SPATIAL PASSIVE SCAN'}
          </div>
        </div>
      </div>

      {/* BOTTOM CENTER: REAL-TIME COORDINATES TELEMETRY BAR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-4 px-6 py-2.5 rounded-full cyber-glass text-xs font-mono-code text-[#FFD8AD] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 text-[#00ff9f] font-bold">
            <Compass className="w-4 h-4 animate-spin" />
            <span>GROUND TRACK:</span>
          </div>
          <span>LAT: <strong className="text-white">{hudCoords.lat}</strong></span>
          <span>LON: <strong className="text-white">{hudCoords.lon}</strong></span>
          <span className="text-slate-400 hidden sm:inline">ALT: <strong className="text-white">{hudCoords.altitude}</strong></span>
          <span className="text-[#F9A1F8] hidden md:inline font-bold">[{hudCoords.city}]</span>
        </div>
      </div>

      {/* BOTTOM RIGHT: ACTIVE NODE INSPECTION PILL */}
      {lockedNode && (
        <div className="absolute bottom-6 right-6 z-20 p-4 rounded-2xl bg-[#171836]/85 border border-[#ff3366]/50 backdrop-blur-2xl text-xs font-mono-code text-slate-200 max-w-xs shadow-[0_16px_48px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-[#ff3366] font-bold mb-1.5">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span className="tracking-wide">THREAT TARGET LOCKED</span>
          </div>
          <div className="text-white text-base font-bold font-heading">{lockedNode.city || 'Ground Location'}, {lockedNode.country || 'Global'}</div>
          <div className="text-slate-400 text-[11px] mt-1">IP: <span className="text-[#F9A1F8] font-bold">{lockedNode.ip || '185.220.101.45'}</span></div>
          <div className="text-slate-400 text-[11px]">ASN: <span className="text-slate-200">{lockedNode.org || 'Autonomous Bulletproof Transit'}</span></div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-white/[0.08]">
            <span className="text-slate-400">RISK SEVERITY:</span>
            <span className="px-2.5 py-0.5 rounded bg-red-950/80 text-red-400 font-bold border border-red-500/40">
              {lockedNode.threat_risk || 94}% CRITICAL
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
