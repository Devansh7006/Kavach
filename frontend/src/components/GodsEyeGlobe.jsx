import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Crosshair, Satellite, Compass, RotateCcw, Flame, ShieldAlert, 
  ShieldCheck, Eye, Layers, Maximize2, Radio, Globe as GlobeIcon
} from 'lucide-react';

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
  const [hudCoords, setHudCoords] = useState({ 
    lat: '28.6139° N', 
    lon: '77.2090° E', 
    city: 'New Delhi (HQ)', 
    mgrs: '43R EK 9104',
    altitude: '35,786 km'
  });
  const [lockedNode, setLockedNode] = useState(null);

  // Dynamic Theme Colors
  const themeColors = {
    NEUTRAL: { primary: 0x00daf3, glow: 0x00d4ff, accent: '#00daf3' },
    LEGIT: { primary: 0x00ff88, glow: 0x00ff88, accent: '#00ff88' },
    THREAT: { primary: 0xff3366, glow: 0xff3366, accent: '#ff3366' }
  }[threatState] || { primary: 0x00daf3, glow: 0x00d4ff, accent: '#00daf3' };

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 22, 78);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 2. Lighting (Sunlight + Ambient Earth Fill)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(60, 30, 50);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x334155, 0.7);
    scene.add(ambientLight);

    const spaceLight = new THREE.DirectionalLight(themeColors.primary, 0.5);
    spaceLight.position.set(-60, -20, -40);
    scene.add(spaceLight);

    // 3. Texture Loader for Photorealistic NASA Earth
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
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: specularTexture,
      specular: new THREE.Color(0x222222),
      shininess: 18
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Floating Clouds Layer
    const cloudsGeo = new THREE.SphereGeometry(RADIUS * 1.018, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmospheric Rayleigh Glow Shader
    const atmosphereGeo = new THREE.SphereGeometry(RADIUS * 1.12, 32, 32);
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
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 4. Defense Hotspot Nodes (Real Coordinates)
    const REAL_NODES = [
      { name: "New Delhi (KAVACH Primary HQ)", lat: 28.6139, lon: 77.2090, type: "HQ", color: 0x00ff88 },
      { name: "Moscow Uplink (Bulletproof Host)", lat: 55.7558, lon: 37.6173, type: "THREAT", color: 0xff3366 },
      { name: "St. Petersburg Phish Relay", lat: 59.9343, lon: 30.3351, type: "THREAT", color: 0xff3366 },
      { name: "Shanghai APT Infiltration Gateway", lat: 31.2304, lon: 121.4737, type: "THREAT", color: 0xff9900 },
      { name: "Ashburn (AWS SES Backbone)", lat: 38.9072, lon: -77.0369, type: "GATEWAY", color: 0x00daf3 },
      { name: "Amsterdam Offshore Proxy", lat: 52.3676, lon: 4.9041, type: "PROXY", color: 0xffb703 },
      { name: "San Francisco Cloud Node", lat: 37.7749, lon: -122.4194, type: "SENSOR", color: 0x00daf3 }
    ];

    REAL_NODES.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, RADIUS + 0.15);
      
      // Node Beacon
      const beaconGeo = new THREE.SphereGeometry(node.type === "HQ" ? 0.75 : 0.6, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: node.color });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos);
      globeGroup.add(beaconMesh);

      // Beacon Target Ring
      const ringGeo = new THREE.RingGeometry(0.9, 1.25, 32);
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

    // 5. Orbital Defense Satellites with Solar Array Models
    const satGroup = new THREE.Group();
    const REAL_SATELLITES = [
      { name: "ISS (ZARYA) // NORAD 25544", radius: RADIUS + 6.5, speed: 0.0075, inc: 0.9, color: 0x00ff88, alt: "420 km", vel: "7.66 km/s" },
      { name: "SENTINEL-6 // NORAD 48274", radius: RADIUS + 11.0, speed: 0.0055, inc: 1.15, color: 0x00daf3, alt: "1,336 km", vel: "7.15 km/s" },
      { name: "KAVACH GEO-GUARDIAN", radius: RADIUS + 17.5, speed: 0.0018, inc: 0.1, color: 0xffb703, alt: "35,786 km", vel: "3.07 km/s" }
    ];

    const satInstances = REAL_SATELLITES.map((sat) => {
      // Orbit Ring
      const orbitCurve = new THREE.EllipseCurve(0, 0, sat.radius, sat.radius, 0, 2 * Math.PI, false, 0);
      const pts = orbitCurve.getPoints(72);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMat = new THREE.LineBasicMaterial({ color: sat.color, transparent: true, opacity: 0.28 });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = sat.inc;
      satGroup.add(orbitLine);

      // Satellite Body + Solar Panels
      const satCraft = new THREE.Group();
      
      const busGeo = new THREE.BoxGeometry(0.7, 0.45, 0.9);
      const busMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 });
      const busMesh = new THREE.Mesh(busGeo, busMat);
      satCraft.add(busMesh);

      // Solar Wings
      const wingGeo = new THREE.BoxGeometry(2.4, 0.08, 0.7);
      const wingMat = new THREE.MeshBasicMaterial({ color: 0x0088ff });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      satCraft.add(wingMesh);

      satGroup.add(satCraft);

      // Ground Scan Conical Sensor Beam
      const coneGeo = new THREE.ConeGeometry(3.8, sat.radius - RADIUS, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: sat.color,
        transparent: true,
        opacity: 0.08,
        wireframe: true
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      satGroup.add(coneMesh);

      return { ...sat, craft: satCraft, cone: coneMesh, angle: Math.random() * Math.PI * 2 };
    });
    globeGroup.add(satGroup);

    // 6. Real Global Cyber Attack Arcs
    const arcGroup = new THREE.Group();
    const ARC_ROUTES = [
      { src: { lat: 55.7558, lon: 37.6173 }, dst: { lat: 28.6139, lon: 77.2090 }, color: 0xff3366 },
      { src: { lat: 59.9343, lon: 30.3351 }, dst: { lat: 38.9072, lon: -77.0369 }, color: 0xff3366 },
      { src: { lat: 31.2304, lon: 121.4737 }, dst: { lat: 37.7749, lon: -122.4194 }, color: 0xff9900 },
      { src: { lat: 52.3676, lon: 4.9041 }, dst: { lat: 28.6139, lon: 77.2090 }, color: 0x00daf3 }
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
        opacity: 0.75,
        linewidth: 2
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(arcLine);
    });
    globeGroup.add(arcGroup);

    // 7. Interactive Mouse Drag & Zoom Controls
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
        city: 'Free Orbit Surveillance',
        mgrs: `43R ${Math.abs(cLat * 12 + 10)} ${Math.abs(cLon * 18 + 20)}`,
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

      // Rotate Earth slowly
      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0014;
      }

      // Clouds rotate slightly faster than Earth for realism
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0004;
      }

      // Update Satellite Orbits
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
        city: activeTarget.city || 'Ground Lock',
        mgrs: `TARGET LOCKED // ${activeTarget.city || 'COORDINATES'}`,
        altitude: '540 km (LEO Lock)'
      });
    }
  }, [activeTarget]);

  return (
    <div className="relative w-full h-full min-h-[580px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070b14] shadow-[0_12px_48px_rgba(0,0,0,0.6)]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP LEFT: SATELLITE OSINT HUD */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-black/60 border border-white/[0.12] backdrop-blur-xl text-xs font-mono-code text-cyan-300">
          <Satellite className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wider">GOD'S EYE 3D // NASA REAL PHOTO-EARTH</span>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] backdrop-blur-xl text-xs font-mono-code text-slate-300 space-y-1.5 min-w-[260px]">
          <div className="flex justify-between items-center text-cyan-400 pb-1 border-b border-white/[0.08]">
            <span className="text-[11px] font-bold">ORBITAL SURVEILLANCE:</span>
            <span className="text-emerald-400 font-bold text-[10px]">NORAD ONLINE</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">ISS (NORAD 25544):</span>
            <span className="text-white">420 km // 7.66 km/s</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">SENTINEL-6 (48274):</span>
            <span className="text-white">1,336 km // Altimetry</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">GEO-GUARDIAN:</span>
            <span className="text-amber-300 font-semibold">35,786 km // Early Warning</span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT: CONTROLS & CAMERA RESET */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono-code text-xs backdrop-blur-xl border transition-all ${
            autoRotate 
              ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200' 
              : 'bg-black/60 border-white/[0.1] text-slate-400'
          }`}
          title="Toggle Natural Planetary Rotation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{autoRotate ? 'ROTATING' : 'PAUSED'}</span>
        </button>

        <button
          onClick={() => {
            if (globeGroupRef.current) {
              globeGroupRef.current.rotation.set(0, 0, 0);
              setAutoRotate(true);
              setLockedNode(null);
            }
          }}
          className="p-2 rounded-lg bg-black/60 hover:bg-white/10 border border-white/[0.1] text-slate-300 backdrop-blur-xl transition-all"
          title="Reset Camera Center"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CENTER TACTICAL RETICLE */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative w-56 h-56 border border-white/[0.08] rounded-full flex items-center justify-center">
          <div className="absolute inset-3 border border-dashed border-cyan-500/20 rounded-full" />
          <Crosshair className="w-8 h-8 text-cyan-400/40" />
          <div className="absolute bottom-3 text-[9px] font-mono-code text-cyan-400/70 tracking-widest uppercase">
            {lockedNode ? `LOCKED: ${lockedNode.city || 'NODE'}` : 'GEOSPATIAL PASSIVE'}
          </div>
        </div>
      </div>

      {/* BOTTOM CENTER: PRECISE COORDINATES TELEMETRY BAR */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-black/75 border border-white/[0.12] backdrop-blur-2xl text-xs font-mono-code text-cyan-300 shadow-2xl">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>GEO-RADAR:</span>
          </div>
          <span>LAT: <strong className="text-white">{hudCoords.lat}</strong></span>
          <span>LON: <strong className="text-white">{hudCoords.lon}</strong></span>
          <span className="text-slate-400 hidden sm:inline">ALT: <strong className="text-white">{hudCoords.altitude}</strong></span>
          <span className="text-amber-400 hidden md:inline font-bold">[{hudCoords.city}]</span>
        </div>
      </div>

      {/* BOTTOM RIGHT: ACTIVE NODE INSPECTION PILL */}
      {lockedNode && (
        <div className="absolute bottom-5 right-5 z-20 p-3.5 rounded-xl bg-black/80 border border-red-500/50 backdrop-blur-2xl text-xs font-mono-code text-slate-200 max-w-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>INTERCEPT TARGET IDENTIFIED</span>
          </div>
          <div className="text-white text-sm font-bold font-display">{lockedNode.city || 'Ground Location'}, {lockedNode.country || 'Global'}</div>
          <div className="text-slate-400 text-[11px] mt-0.5">IP: <span className="text-cyan-300">{lockedNode.ip || '185.220.101.45'}</span></div>
          <div className="text-slate-400 text-[11px]">ASN: <span className="text-slate-200">{lockedNode.org || 'Autonomous Bulletproof Transit'}</span></div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-white/[0.08]">
            <span className="text-slate-400">RISK FACTOR:</span>
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-500/40">
              {lockedNode.threat_risk || 94}% CRITICAL
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
