import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Mail, Image as ImageIcon, Video, Radio, FileText, 
  Satellite, Flame, Terminal, AlertCircle, Cpu, Wifi, Eye
} from 'lucide-react';

import GodsEyeGlobe from './components/GodsEyeGlobe';
import EmailDefenseTab from './components/EmailDefenseTab';
import ImageForensicsTab from './components/ImageForensicsTab';
import VideoForensicsTab from './components/VideoForensicsTab';
import AudioForensicsTab from './components/AudioForensicsTab';
import DossierExportTab from './components/DossierExportTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('GODS_EYE'); // 'GODS_EYE' | 'EMAIL' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOSSIER'
  const [activeTarget, setActiveTarget] = useState({
    lat: 55.7558,
    lon: 37.6173,
    city: "Moscow Uplink",
    country: "Russia",
    org: "Bulletproof C2 Relay",
    threat_risk: 94
  });

  const [telemetry, setTelemetry] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([
    "[04:15:02] KAVACH SENTINEL-1 ORBIT INITIALIZED // ALTITUDE 540 KM",
    "[04:15:10] RFC 5322 EMAIL DEFENSE ENGINE LOADED (100 BASELINE SAMPLES)",
    "[04:15:18] AMPED FIVE & SHERLOQ ELA MULTI-SPECTRAL CORES READY",
    "[04:15:25] LIBROSA 13-MFCC ACOUSTIC HARMONIC PARSER ARMED",
    "[04:15:30] GOD'S EYE SPATIAL RADAR CONNECTED TO ORBITAL GRID"
  ]);

  // Fetch live telemetry from FastAPI backend
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/gods-eye/telemetry');
        const data = await res.json();
        setTelemetry(data);
      } catch (err) {
        console.log("Telemetry fallback", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 8000);
    return () => clearInterval(interval);
  }, []);

  // Simulate periodic cyber defense stream log
  useEffect(() => {
    const logInterval = setInterval(() => {
      const msgs = [
        `[${new Date().toLocaleTimeString()}] SATELLITE INTERCEPT: Blocked suspicious SMTP packet from 185.220.101.45`,
        `[${new Date().toLocaleTimeString()}] SHERLOQ SENSOR: ELA divergence detected on inbound passport scan`,
        `[${new Date().toLocaleTimeString()}] GREYNOISE ALERT: Mass port probe flagged as Mirai Botnet Variant`,
        `[${new Date().toLocaleTimeString()}] DMARC ENGINE: Quarantined spoofed banking envelope (#BEC-8921)`,
        `[${new Date().toLocaleTimeString()}] VOICE AUTHENTICATOR: Synthetic vocoder jitter isolated at 4890 Hz`
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setTerminalLogs(prev => [randomMsg, ...prev.slice(0, 5)]);
    }, 6000);

    return () => clearInterval(logInterval);
  }, []);

  const handleTargetSelection = (target) => {
    setActiveTarget(target);
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString()}] TARGET LOCK ENGAGED: ${target.city || 'COORDINATES'} (${target.lat}, ${target.lon})`,
      ...prev.slice(0, 5)
    ]);
  };

  return (
    <div className="min-h-screen bg-[#040810] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none bg-grid-cyber opacity-30 z-0" />

      {/* TOP HEADER / WAR ROOM COMMAND BAR */}
      <header className="relative z-30 border-b border-cyan-500/20 bg-black/60 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center glow-cyan border border-cyan-400/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-mono-cyber tracking-wider text-white">
                  KAVACH <span className="text-cyan-400 font-light">// THE PROTECTOR</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono-cyber font-bold">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono-cyber">
                AI CYBER SENTINEL & MULTI-MODAL FORENSIC DEFENSE SYSTEM
              </p>
            </div>
          </div>

          {/* Real-Time Telemetry Counters */}
          <div className="flex items-center gap-4 text-xs font-mono-cyber">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-black/50 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">DEFCON:</span>
              <span className="text-amber-400 font-bold">2 (ELEVATED)</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-black/50 border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">MODEL BASELINE:</span>
              <span className="text-cyan-300 font-bold">100 SAMPLES</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              <span>GOD'S EYE LINK: ARMED</span>
            </div>
          </div>
        </div>
      </header>

      {/* NAVIGATION BAR */}
      <nav className="relative z-30 border-b border-cyan-500/10 bg-black/40 backdrop-blur-sm px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 font-mono-cyber text-xs">
          {[
            { id: 'GODS_EYE', label: "GOD'S EYE 3D VIEW", icon: Globe },
            { id: 'EMAIL', label: "EMAIL DEFENSE & .EML", icon: Mail },
            { id: 'IMAGE', label: "IMAGE FORENSICS (AMPED)", icon: ImageIcon },
            { id: 'VIDEO', label: "VIDEO FORENSICS", icon: Video },
            { id: 'AUDIO', label: "AUDIO VOCODER AUDIT", icon: Radio },
            { id: 'DOSSIER', label: "INCIDENT DOSSIER", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all shrink-0 border ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 glow-cyan font-bold'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: GOD'S EYE VIEW (ORBITAL RADAR & 3D CYBER WAR ROOM) */}
        {activeTab === 'GODS_EYE' && (
          <div className="space-y-6">
            <div className="h-[580px] w-full">
              <GodsEyeGlobe
                activeTarget={activeTarget}
                satellites={telemetry?.satellites || []}
                attackArcs={telemetry?.attack_arcs || []}
                onSelectNode={handleTargetSelection}
              />
            </div>

            {/* Quick-Launch Forensic Actions Below 3D Globe */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('EMAIL')}
                className="glass-panel p-4 rounded-xl cursor-pointer hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-mono-cyber text-sm font-semibold mb-1">
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>EMAIL FORENSICS CONSOLE</span>
                </div>
                <p className="text-xs text-slate-400">
                  Analyze raw .eml, extract SPF/DKIM/DMARC headers, and geocode origin hops directly into God's Eye.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('IMAGE')}
                className="glass-panel p-4 rounded-xl cursor-pointer hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-mono-cyber text-sm font-semibold mb-1">
                  <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>AMPED FIVE & SHERLOQ CORE</span>
                </div>
                <p className="text-xs text-slate-400">
                  Run multi-spectral Error Level Analysis (ELA) and Laplacian camera sensor noise filtering.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('VIDEO')}
                className="glass-panel p-4 rounded-xl cursor-pointer hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-mono-cyber text-sm font-semibold mb-1">
                  <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>AMPED VIDEO AUTHENTICATOR</span>
                </div>
                <p className="text-xs text-slate-400">
                  Inspect frame-by-frame temporal optical flow and face-swap warping anomalies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMAIL DEFENSE */}
        {activeTab === 'EMAIL' && (
          <EmailDefenseTab onTargetSelected={handleTargetSelection} />
        )}

        {/* TAB 3: IMAGE FORENSICS */}
        {activeTab === 'IMAGE' && (
          <ImageForensicsTab onTargetSelected={handleTargetSelection} />
        )}

        {/* TAB 4: VIDEO FORENSICS */}
        {activeTab === 'VIDEO' && (
          <VideoForensicsTab />
        )}

        {/* TAB 5: AUDIO FORENSICS */}
        {activeTab === 'AUDIO' && (
          <AudioForensicsTab />
        )}

        {/* TAB 6: DOSSIER EXPORT */}
        {activeTab === 'DOSSIER' && (
          <DossierExportTab />
        )}

        {/* REAL-TIME TERMINAL LOG STRIP (CYBER HUD FOOTER) */}
        <div className="glass-panel p-3 rounded-xl border border-cyan-500/20 font-mono-cyber text-xs">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>LIVE DEFENSE INTERCEPT TELEMETRY LOG</span>
            </span>
            <span className="text-[10px] text-slate-500">KAVACH AUDIT BUFFER</span>
          </div>

          <div className="space-y-1">
            {terminalLogs.map((log, lidx) => (
              <div key={lidx} className="text-slate-400 text-[11px] flex items-center gap-2">
                <span className="text-cyan-500">▶</span>
                <span className={lidx === 0 ? 'text-cyan-200 font-semibold' : ''}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-slate-900 bg-black/80 py-4 px-6 text-center text-xs font-mono-cyber text-slate-500">
        <div>
          KAVACH // THE PROTECTOR — DESIGNED & ENGINEERED FOR HACKATHON DEFENSE EXCELLENCE
        </div>
        <div className="text-[10px] text-slate-600 mt-1">
          SecYureD AI Suite: Sameeraj, Dipanshu Maheshwari, Yashashvi Gupta, Shubh Verma
        </div>
      </footer>
    </div>
  );
}
