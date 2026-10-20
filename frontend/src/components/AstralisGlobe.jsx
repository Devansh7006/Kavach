import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Crosshair, Satellite, Compass, RotateCcw, Flame, ShieldAlert, 
  ShieldCheck, Eye, Layers, Maximize2, Radio, Globe as GlobeIcon,
  Mic, Sliders, Volume2, ArrowRight, Plane, MapPin, Activity,
  CheckCircle2, AlertTriangle, EyeOff, Terminal, SlidersHorizontal,
  ZoomIn, ZoomOut
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
  const [zoomLevel, setZoomLevel] = useState(46);
  
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
    latLon: `28°38'12.4"N 77°13'44.2"E`,
    sector: "GOD'S EYE // SECTOR DELTA-7 ORBITAL RECON ACTIVE"
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
    
    globeGroupRef.current.rotation.y = targetLonRad;
    globeGroupRef.current.rotation.x = targetLatRad;
  }, [activeTarget]);

  // Zoom handlers
  const handleZoom = (delta) => {
    if (!cameraRef.current) return;
    const newDist = Math.max(26, Math.min(80, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newDist;
    setZoomLevel(newDist);
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !globeGroupRef.current) return;
    cameraRef.current.position.set(0, 0, 46);
    cameraRef.current.lookAt(0, 0, 0);
    globeGroupRef.current.rotation.set(0.1, 1.85, THREE.MathUtils.degToRad(-15));
    setZoomLevel(46);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Perfectly centered perspective camera looking directly at (0, 0, 0)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1500);
    camera.position.set(0, 0, 46);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Deep Space Starfield (Subtle Cyber Lime & Cyan Stardust)
    const starCount = 1400;
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
      const r = 260 + Math.random() * 320;
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
    const starMat = new THREE.PointsMaterial({ size: 1.1, vertexColors: true, transparent: true, opacity: 0.75 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Globe Group with Natural Axial Tilt
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = THREE.MathUtils.degToRad(-15);
    globeGroup.rotation.y = 1.85;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 2. High-Precision Tactical Lighting (Sun, Ambient, Rim)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(45, 25, 45);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0x62C0F6, 1.2);
    fillLight.position.set(-45, -15, 30);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(accentColor), 1.4);
    rimLight.position.set(0, -35, -30);
    scene.add(rimLight);

    // 3. Realistic NASA Earth Spheres (RADIUS = 15.8 fits full globe in 720px)
    const textureLoader = new THREE.TextureLoader();
    const RADIUS = 15.8;

    const dayTexture = textureLoader.load('/textures/earth_day.jpg');
    const normalTexture = textureLoader.load('/textures/earth_normal.jpg');
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');
    const lightsTexture = textureLoader.load('/textures/earth_lights.png');

    // Primary Earth Sphere with Day Texture & Night Emissive City Lights
    const earthGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.55,
      metalness: 0.1,
      emissiveMap: lightsTexture,
      emissive: new THREE.Color(0xffbb55),
      emissiveIntensity: 0.75
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Atmospheric Cloud Layer with Real Alpha Transparency
    const cloudsGeo = new THREE.SphereGeometry(RADIUS * 1.016, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmospheric Rayleigh Limb Scattering Halo
    const atmosphereGeo = new THREE.SphereGeometry(RADIUS * 1.14, 64, 64);
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
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.4);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 1.1;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 4. City Markers with 3D Leader Pins (Alibaba 20 Screen)
    const cityObjects = PINNED_CITIES.map((city) => {
      const surfacePos = latLonToVector3(city.lat, city.lon, RADIUS);
      const hoverPos = latLonToVector3(city.lat, city.lon, RADIUS + 1.8);

      // Base dot on earth surface
      const baseMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 10, 10),
        new THREE.MeshBasicMaterial({ color: city.risk > 70 ? 0xFF3366 : city.risk > 30 ? 0x62C0F6 : 0xB2F601 })
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
        new THREE.RingGeometry(0.15, 0.28, 12),
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

    // 5. Tactical Asset & Flight Vectors (Swirling Signal Dots)
    const flightCount = 200;
    const flightGeo = new THREE.BufferGeometry();
    const flightPos = new Float32Array(flightCount * 3);
    for (let i = 0; i < flightCount; i++) {
      const lat = (Math.random() * 80) - 20;
      const lon = (Math.random() * 360) - 180;
      const vec = latLonToVector3(lat, lon, RADIUS + 0.18);
      flightPos[i * 3] = vec.x;
      flightPos[i * 3 + 1] = vec.y;
      flightPos[i * 3 + 2] = vec.z;
    }
    flightGeo.setAttribute('position', new THREE.BufferAttribute(flightPos, 3));
    const flightMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      transparent: true,
      opacity: 0.85
    });
    const flightsPoints = new THREE.Points(flightGeo, flightMat);
    globeGroup.add(flightsPoints);

    // 6. Tactical Route Arcs (Glowing Parabolic Bezier Curves)
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
      const arcMat = new THREE.LineBasicMaterial({ color: r.col, transparent: true, opacity: 0.85, linewidth: 2 });
      globeGroup.add(new THREE.Line(arcGeo, arcMat));

      [v1, v2].forEach((v) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: r.col }));
        b.position.copy(v);
        globeGroup.add(b);
      });
    });

    // 7. Orbital Satellites & Space Stations (ISS NORAD 25544)
    const satGroup = new THREE.Group();
    const REAL_ORBITALS = [
      { name: "ISS (ZARYA) NORAD 25544", radius: RADIUS + 3.8, speed: 0.007, inc: 0.85, col: 0xB2F601, alt: "420 km", vel: "7.66 km/s" },
      { name: "SENTINEL-1A SAR RADAR", radius: RADIUS + 6.2, speed: 0.005, inc: 1.25, col: 0x62C0F6, alt: "693 km", vel: "7.51 km/s" },
      { name: "KH11-4180 DEFENSE ORBIT", radius: RADIUS + 9.8, speed: 0.0025, inc: 0.45, col: 0xFF3366, alt: "12,400 km", vel: "4.82 km/s" }
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
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 }));
      const wings = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 0.5), new THREE.MeshBasicMaterial({ color: s.col }));
      craft.add(body, wings);
      satGroup.add(craft);

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(2.2, s.radius - RADIUS, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: s.col, transparent: true, opacity: 0.07, wireframe: true })
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
        sector: `GOD'S EYE // SECTOR ${Math.abs(cLat)}.50N ${Math.abs(cLon)}.79W | RECON ACTIVE`
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
        globeGroup.rotation.y += 0.0015;
      }
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0006;
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

      // Project 2D City Labels
      frameCount++;
      if (frameCount % 2 === 0 && mountRef.current) {
        camera.getWorldPosition(cameraWorldPos);
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;

        const updated = cityObjects.map((city) => {
          tempVec.copy(city.hoverPos);
          tempVec.applyMatrix4(globeGroup.matrixWorld);

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

    // Resize Handler
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
      if (domElem) domElem.removeEventListener('mousedown', onMouseDown);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [flirMode, accentColor]);

  // Handle City Pin Click
  const handleCityPinClick = (city) => {
    if (globeGroupRef.current) {
      const targetLonRad = THREE.MathUtils.degToRad(-city.lon - 90);
      const targetLatRad = THREE.MathUtils.degToRad(city.lat * 0.4);
      globeGroupRef.current.rotation.y = targetLonRad;
      globeGroupRef.current.rotation.x = targetLatRad;
    }

    setSelectedEntity({
      callsign: `${city.code}-GATE`,
      model: city.org,
      status: `THREAT RISK: ${city.risk}% · SECTOR ${city.sector}`,
      route: `${city.name.toUpperCase()} HUB -> GLOBAL BACKBONE`,
      lat: `${city.lat}° N`,
      lon: `${city.lon}° E`
    });

    if (onSelectNode) {
      onSelectNode({
        city: city.name,
        lat: city.lat,
        lon: city.lon,
        country: "Global Infrastructure",
        org: city.org,
        threat_risk: city.risk
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[720px] rounded-[28px] overflow-hidden bg-[#06080d] border border-white/[0.09] shadow-2xl select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing z-0" />

      {/* FLOATING 2D PINNED CITY LABELS OVER 3D GLOBE */}
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
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a0a0d]/90 border border-white/20 hover:border-[#B2F601] shadow-2xl backdrop-blur-md">
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
          <span className="text-[#62C0F6] tracking-wider hidden md:inline">GOD'S EYE // SI-TK // ORBITAL RECON</span>
          <span className="px-2 py-0.5 rounded bg-[#343645]/80 text-[#B2F601] border border-[#B2F601]/30">
            KH11-4180
          </span>
        </div>
      </div>

      {/* TOP RIGHT: CONTROLS & ZOOM BUTTONS */}
      <div className="absolute top-12 right-6 z-20 pointer-events-none flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold font-mono-hud">
          <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse" />
          <span className="text-slate-300">ORBITAL REC: LIVE</span>
        </div>

        <div className="flex items-center gap-1.5 pt-1 pointer-events-auto font-mono-hud">
          {/* Zoom In */}
          <button
            onClick={() => handleZoom(-4)}
            className="p-1.5 rounded-xl bg-black/70 hover:bg-white/[0.1] text-white border border-white/10 transition-all cursor-pointer shadow-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#62C0F6]" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoom(4)}
            className="p-1.5 rounded-xl bg-black/70 hover:bg-white/[0.1] text-white border border-white/10 transition-all cursor-pointer shadow-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-[#62C0F6]" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-xl bg-black/70 hover:bg-white/[0.1] text-white border border-white/10 transition-all cursor-pointer shadow-lg"
            title="Reset Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B2F601]" />
          </button>

          {/* FLIR Mode Toggle */}
          <button
            onClick={() => setFlirMode(!flirMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-lg cursor-pointer ${
              flirMode 
                ? 'bg-[#FF3366] text-white border-red-400 animate-pulse' 
                : 'bg-black/70 text-[#B2F601] border-white/10 hover:border-[#B2F601]/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{flirMode ? "THERMAL ON" : "FLIR"}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              autoRotate 
                ? 'bg-[#62C0F6]/20 border-[#62C0F6]/50 text-[#62C0F6]' 
                : 'bg-black/70 border-white/10 text-slate-400'
            }`}
          >
            ROTATION
          </button>
        </div>
      </div>

      {/* CENTER COCKPIT RETICLE CROSSHAIR */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative w-72 h-72 border border-white/[0.08] rounded-full flex items-center justify-center">
          <div className="absolute inset-6 border border-dashed border-[#62C0F6]/20 rounded-full animate-spin-slow" />
          <Crosshair className="w-10 h-10 text-[#62C0F6]/30" />
          <div className="absolute bottom-5 text-[9px] font-bold text-[#B2F601] tracking-widest uppercase font-mono-hud">
            GOD'S EYE // TARGET SECTOR LOCKED
          </div>
        </div>
      </div>

      {/* SELECTED ENTITY TOOLTIP */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-16 z-20 p-3 rounded-2xl bg-[#0a0a0d]/92 border border-[#62C0F6]/40 text-xs text-white backdrop-blur-xl shadow-2xl pointer-events-auto font-mono-hud">
        <div className="font-extrabold text-[#B2F601] flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-[#62C0F6]" />
          <span>{selectedEntity.callsign}</span>
          <span className="text-[10px] text-slate-400">({selectedEntity.model})</span>
        </div>
        <div className="text-[11px] text-slate-300 mt-0.5">{selectedEntity.status}</div>
        <div className="text-[10px] text-[#62C0F6] font-bold mt-1">{selectedEntity.route}</div>
      </div>

      {/* BOTTOM LEFT: MGRS & EXACT COORDINATES */}
      <div className="absolute bottom-16 left-6 z-20 pointer-events-none space-y-1 font-mono-hud">
        <div className="text-xs font-bold text-[#62C0F6] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#B2F601]" />
          <span>MGRS: {hudCoords.mgrs}</span>
        </div>
        <div className="text-[11px] text-slate-300 font-bold">{hudCoords.latLon}</div>
        <div className="text-[9px] text-slate-500">{hudCoords.sector}</div>
      </div>

      {/* CENTER BOTTOM: GOD'S EYE RECON STATUS PILL */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-[#0a0a0d]/92 border border-white/[0.12] backdrop-blur-2xl shadow-2xl font-mono-hud text-xs">
        <button 
          onClick={handleResetCamera}
          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#62C0F6]/20 text-[11px] font-bold text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
        >
          <GlobeIcon className="w-3.5 h-3.5 text-[#B2F601]" />
          <span>GLOBAL RECON</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#62C0F6]/15 border border-[#62C0F6]/30 font-bold text-[#62C0F6]">
          <Eye className="w-3.5 h-3.5 text-[#B2F601] animate-pulse" />
          <span className="tracking-wider">GOD'S EYE 3D // SATELLITE RADAR LOCK</span>
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-full bg-[#B2F601] animate-pulse" />
            <span className="w-0.5 h-2 bg-[#62C0F6]" />
            <span className="w-0.5 h-3.5 bg-[#B2F601] animate-pulse" />
          </div>
        </div>

        <button 
          onClick={() => setFlirMode(!flirMode)}
          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#62C0F6]/20 text-[11px] font-bold text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-[#FF3366]" />
          <span>THERMAL</span>
        </button>
      </div>
    </div>
  );
}
