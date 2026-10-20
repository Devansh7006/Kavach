import React, { useEffect, useRef, useState, useCallback } from 'react';
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

// 16 Pinned Global Cities (Pure English)
export const PINNED_CITIES = [
  { id: 'MOW', name: 'Moscow', code: 'MOW', lat: 55.75, lon: 37.61, risk: 94, org: 'Bulletproof C2 Relay', sector: 'SEC-1' },
  { id: 'ISB', name: 'Islamabad', code: 'ISB', lat: 33.68, lon: 73.04, risk: 65, org: 'Autonomous Subnet', sector: 'SEC-2' },
  { id: 'THR', name: 'Tehran', code: 'THR', lat: 35.68, lon: 51.38, risk: 88, org: 'Sandworm Mirror', sector: 'SEC-1' },
  { id: 'DXB', name: 'Dubai', code: 'DXB', lat: 25.20, lon: 55.27, risk: 32, org: 'Gulf Interconnect', sector: 'SEC-2' },
  { id: 'LON', name: 'London', code: 'LON', lat: 51.50, lon: -0.12, risk: 14, org: 'LINX Exchange', sector: 'SEC-3' },
  { id: 'FRA', name: 'Frankfurt', code: 'FRA', lat: 50.11, lon: 8.68, risk: 18, org: 'DE-CIX Core', sector: 'SEC-2' },
  { id: 'DEL', name: 'New Delhi', code: 'DEL', lat: 28.61, lon: 77.20, risk: 42, org: 'NIXI Routing Hub', sector: 'SEC-1' },
  { id: 'WUH', name: 'Wuhan', code: 'WUH', lat: 30.59, lon: 114.30, risk: 54, org: 'Optical Backbone', sector: 'SEC-1' },
  { id: 'CAN', name: 'Guangzhou', code: 'CAN', lat: 23.12, lon: 113.26, risk: 29, org: 'Subsea Terminal', sector: 'SEC-2' },
  { id: 'HKG', name: 'Hong Kong', code: 'HKG', lat: 22.31, lon: 114.16, risk: 22, org: 'HKIX Transit', sector: 'SEC-2' },
  { id: 'SIN', name: 'Singapore', code: 'SIN', lat: 1.35, lon: 103.81, risk: 12, org: 'Equinix SG1 Hub', sector: 'SEC-1' },
  { id: 'JKT', name: 'Jakarta', code: 'JKT', lat: -6.20, lon: 106.84, risk: 45, org: 'APNIC Regional Node', sector: 'SEC-2' },
  { id: 'SYD', name: 'Sydney', code: 'SYD', lat: -33.86, lon: 151.20, risk: 10, org: 'Pacific Gateway', sector: 'SEC-3' },
  { id: 'SFO', name: 'San Francisco', code: 'SFO', lat: 37.77, lon: -122.41, risk: 15, org: 'Bay Area Transit', sector: 'SEC-3' },
  { id: 'NYC', name: 'New York', code: 'NYC', lat: 40.71, lon: -74.00, risk: 19, org: 'JFK Teleport', sector: 'SEC-3' },
  { id: 'TYO', name: 'Tokyo', code: 'TYO', lat: 35.67, lon: 139.65, risk: 11, org: 'JPIX Otari Center', sector: 'SEC-2' }
];

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
  const cameraRef = useRef(null);

  // States
  const [flirMode, setFlirMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [projectedCities, setProjectedCities] = useState([]);
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
    sector: "SECTOR 31.50N 101.79W | RECON ACTIVE"
  });

  const [flirSensitivity, setFlirSensitivity] = useState(75);
  const [flirBloom, setFlirBloom] = useState(60);

  // Theme Accent Colors
  const isThreat = threatState === 'THREAT';
  const isLegit = threatState === 'LEGIT';
  
  const accentColor = isThreat ? '#FF3366' : isLegit ? '#B2F601' : '#62C0F6';

  // Smoothly rotate globe towards target when activeTarget changes
  useEffect(() => {
    if (!activeTarget || !globeGroupRef.current) return;
    const targetLonRad = THREE.MathUtils.degToRad(-activeTarget.lon - 90);
    const targetLatRad = THREE.MathUtils.degToRad(activeTarget.lat * 0.4);
    
    // Smooth target orientation
    globeGroupRef.current.rotation.y = targetLonRad;
    globeGroupRef.current.rotation.x = targetLatRad;
  }, [activeTarget]);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 2000);
    camera.position.set(0, 14, 62);
    cameraRef.current = camera;

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

    // 4. City Markers with 3D Leader Pins (From Image 1 Alibaba 20 Screen)
    const cityObjects = PINNED_CITIES.map((city) => {
      const surfacePos = latLonToVector3(city.lat, city.lon, RADIUS);
      const hoverPos = latLonToVector3(city.lat, city.lon, RADIUS + 2.5);

      // Base dot on earth surface
      const baseMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 10, 10),
        new THREE.MeshBasicMaterial({ color: city.risk > 70 ? 0xFF3366 : 0xB2F601 })
      );
      baseMesh.position.copy(surfacePos);
      globeGroup.add(baseMesh);

      // Vertical 3D leader line from surface to hover
      const lineGeo = new THREE.BufferGeometry().setFromPoints([surfacePos, hoverPos]);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: 0x62C0F6, 
        transparent: true, 
        opacity: 0.75,
        linewidth: 1
      });
      const leaderLine = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(leaderLine);

      // Top pin ring
      const topRing = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.35, 12),
        new THREE.MeshBasicMaterial({ color: 0x62C0F6, side: THREE.DoubleSide })
      );
      topRing.position.copy(hoverPos);
      topRing.lookAt(0, 0, 0);
      globeGroup.add(topRing);

      return {
        ...city,
        surfacePos,
        hoverPos
      };
    });

    // 5. Tactical Asset & Flight Vectors
    const flightCount = 280;
    const flightGeo = new THREE.BufferGeometry();
    const flightPos = new Float32Array(flightCount * 3);
    for (let i = 0; i < flightCount; i++) {
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

    // 6. Real Tactical Route Arcs
    const TACTICAL_ROUTES = [
      { from: "California LAX", to: "Texas DFW", src: { lat: 34.05, lon: -118.24 }, dst: { lat: 32.77, lon: -96.79 }, dist: "1983 km", col: 0x62C0F6 },
      { from: "Moscow SVO", to: "New Delhi DEL", src: { lat: 55.75, lon: 37.61 }, dst: { lat: 28.61, lon: 77.20 }, dist: "4340 km", col: 0xFF3366 },
      { from: "Shanghai SHA", to: "San Francisco SFO", src: { lat: 31.23, lon: 121.47 }, dst: { lat: 37.77, lon: -122.41 }, dist: "9880 km", col: 0xB2F601 },
      { from: "Frankfurt FRA", to: "New York JFK", src: { lat: 50.11, lon: 8.68 }, dst: { lat: 40.71, lon: -74.00 }, dist: "6200 km", col: 0x62C0F6 },
      { from: "London LINX", to: "Moscow C2", src: { lat: 51.50, lon: -0.12 }, dst: { lat: 55.75, lon: 37.61 }, dist: "2500 km", col: 0xFF3366 },
      { from: "Singapore SG1", to: "Sydney GATE", src: { lat: 1.35, lon: 103.81 }, dst: { lat: -33.86, lon: 151.20 }, dist: "6300 km", col: 0xB2F601 }
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

      [v1, v2].forEach((v) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), new THREE.MeshBasicMaterial({ color: r.col }));
        b.position.copy(v);
        globeGroup.add(b);
      });
    });

    // 7. Orbital Satellites & Space Stations (ISS NORAD 25544)
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
      const mat = new THREE.LineBasicMaterial({ color: s.col, transparent: true, opacity: 0.35 });
      const line = new THREE.Line(geo, mat);
      line.rotation.x = s.inc;
      satGroup.add(line);

      const craft = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.9), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 }));
      const wings = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.7), new THREE.MeshBasicMaterial({ color: s.col }));
      craft.add(body, wings);
      satGroup.add(craft);

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(3.2, s.radius - RADIUS, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: s.col, transparent: true, opacity: 0.06, wireframe: true })
      );
      satGroup.add(cone);

      return { ...s, craft, cone, angle: Math.random() * Math.PI * 2 };
    });
    globeGroup.add(satGroup);

    // 8. Interactive Mouse Orbit Controls
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

    // 9. Animation Loop with Screen-Projected City Labels
    let frameCount = 0;
    const tempVec = new THREE.Vector3();
    const cameraWorldPos = new THREE.Vector3();

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

      // Project 2D City Labels (update every 2 frames for smooth performance)
      frameCount++;
      if (frameCount % 2 === 0 && mountRef.current) {
        camera.getWorldPosition(cameraWorldPos);
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;

        const updated = cityObjects.map((city) => {
          tempVec.copy(city.hoverPos);
          tempVec.applyMatrix4(globeGroup.matrixWorld);

          // Dot product between surface normal and camera vector to check front hemisphere
          const surfaceWorld = city.surfacePos.clone().applyMatrix4(globeGroup.matrixWorld);
          const dirToCamera = cameraWorldPos.clone().sub(surfaceWorld).normalize();
          const normal = surfaceWorld.clone().normalize();
          const dot = normal.dot(dirToCamera);

          if (dot > 0.08) {
            tempVec.project(camera);
            const screenX = (tempVec.x * 0.5 + 0.5) * w;
            const screenY = (-(tempVec.y * 0.5) + 0.5) * h;
            return {
              ...city,
              screenX,
              screenY,
              visible: tempVec.z < 1.0
            };
          } else {
            return { ...city, visible: false };
          }
        });
        setProjectedCities(updated);
      }

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
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [accentColor, autoRotate]);

  // Handle City Pin Click
  const handleCityPinClick = useCallback((city) => {
    setSelectedEntity({
      callsign: `${city.id}-NODE`,
      model: city.org,
      status: `THREAT RISK: ${city.risk}% // ${city.sector}`,
      route: `${city.name} [${city.code}] — ROUTING GATEWAY`,
      lat: `${city.lat}° N`,
      lon: `${city.lon}° E`
    });

    if (onSelectNode) {
      onSelectNode({
        city: city.name,
        lat: city.lat,
        lon: city.lon,
        country: city.name,
        org: city.org,
        threat_risk: city.risk
      });
    }
  }, [onSelectNode]);

  return (
    <div className="relative w-full h-full min-h-[680px] rounded-3xl overflow-hidden hud-glass-panel border border-[#62C0F6]/25 select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing z-0" />

      {/* FLOATING 2D PINNED CITY LABELS OVER 3D GLOBE (Matching Alibaba 20 Screen) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {projectedCities.map((city) => {
          if (!city.visible || city.screenX < 20 || city.screenY < 20) return null;
          return (
            <div
              key={city.id}
              onClick={() => handleCityPinClick(city)}
              className="absolute pointer-events-auto cursor-pointer transition-transform duration-100 hover:scale-110 group"
              style={{
                left: `${city.screenX}px`,
                top: `${city.screenY}px`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0E111A]/90 border border-white/20 hover:border-[#B2F601] shadow-2xl backdrop-blur-md">
                <span 
                  className="w-1.5 h-1.5 rounded-full shrink-0" 
                  style={{ backgroundColor: city.risk > 70 ? '#FF3366' : city.risk > 30 ? '#62C0F6' : '#B2F601' }}
                />
                <span className="text-[11px] font-bold text-white tracking-wide font-aveton">
                  {city.name}
                </span>
                <span className="text-[9px] text-[#62C0F6] font-mono-hud hidden sm:inline">
                  [{city.code}]
                </span>
              </div>
              {/* Leader tick indicator */}
              <div className="w-px h-2.5 bg-[#62C0F6]/60 mx-auto" />
            </div>
          );
        })}
      </div>

      {/* TOP RECON TELEMETRY BAR */}
      <div className="absolute top-3 left-6 right-6 z-20 pointer-events-none flex items-center justify-between font-mono-hud text-xs border-b border-white/[0.08] pb-2">
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5 text-[#B2F601] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#B2F601] animate-ping" />
            E VIS: 5049
          </span>
          <span className="text-slate-400">SRC: <strong className="text-white">5723</strong></span>
          <span className="text-slate-400">DENS: <strong className="text-[#62C0F6]">75%</strong></span>
          <span className="text-slate-400 hidden sm:inline">ELASTIC: <strong className="text-[#B2F601]">3.1ms</strong></span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="text-[#62C0F6] tracking-wider hidden md:inline">TOP SECRET // SI-TK // NOFORN</span>
          <span className="px-2 py-0.5 rounded bg-[#343645]/80 text-[#B2F601] border border-[#B2F601]/30">
            KH11-4180
          </span>
        </div>
      </div>

      {/* TOP RIGHT: RECORDING STATUS & CONTROLS */}
      <div className="absolute top-12 right-6 z-20 pointer-events-none flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse" />
          <span className="text-slate-300">REC 2026-10-20 18:22 UTC</span>
        </div>

        <div className="flex items-center gap-2 pt-1 pointer-events-auto">
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

      {/* FLIR PARAMETERS SIDEBAR */}
      {flirMode && (
        <div className="absolute right-6 top-32 z-20 p-4 rounded-2xl hud-glass-panel border-red-500/40 text-xs text-slate-200 space-y-3 w-56 pointer-events-auto">
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
          </div>
        </div>
      )}

      {/* CENTER COCKPIT RETICLE CROSSHAIR */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative w-64 h-64 border border-white/[0.07] rounded-full flex items-center justify-center">
          <div className="absolute inset-4 border border-dashed border-[#62C0F6]/20 rounded-full" />
          <Crosshair className="w-8 h-8 text-[#62C0F6]/30" />
          <div className="absolute bottom-4 text-[9px] font-bold text-[#B2F601] tracking-widest uppercase">
            TARGET SECTOR LOCKED // NORMAL
          </div>
        </div>
      </div>

      {/* SELECTED ENTITY TOOLTIP */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-20 p-2.5 rounded-xl bg-[#0E111A]/90 border border-[#62C0F6]/40 text-xs text-white backdrop-blur-xl shadow-2xl pointer-events-auto">
        <div className="font-extrabold text-[#B2F601] flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-[#62C0F6]" />
          <span>{selectedEntity.callsign}</span>
          <span className="text-[10px] text-slate-400">({selectedEntity.model})</span>
        </div>
        <div className="text-[11px] text-slate-300 mt-0.5">{selectedEntity.status}</div>
        <div className="text-[10px] text-[#62C0F6] font-bold mt-1">{selectedEntity.route}</div>
      </div>

      {/* BOTTOM LEFT: MGRS & EXACT COORDINATES */}
      <div className="absolute bottom-16 left-6 z-20 pointer-events-none space-y-1">
        <div className="text-xs font-bold text-[#62C0F6] flex items-center gap-1.5 font-mono-hud">
          <Compass className="w-3.5 h-3.5 text-[#B2F601]" />
          <span>MGRS: {hudCoords.mgrs}</span>
        </div>
        <div className="text-[11px] text-slate-300 font-bold font-mono-hud">{hudCoords.latLon}</div>
        <div className="text-[9px] text-slate-500 font-mono-hud">[High-Precision Geodesic Grid]</div>
      </div>

      {/* CENTER BOTTOM: AI CONSOLE MIC PILL */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-[#0E111A]/90 border border-white/[0.12] backdrop-blur-2xl shadow-2xl">
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
          <span>PRESETS</span>
        </button>
      </div>
    </div>
  );
}
