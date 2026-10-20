import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, Mail, Image as ImageIcon, Video, Radio, FileText, 
  Satellite, Terminal, Activity, Wifi, ShieldAlert, ShieldCheck, 
  RefreshCw, Cpu, Clock, CheckCircle2, AlertOctagon, Sparkles,
  ArrowUpRight, Compass, Layers, Zap, Crosshair, Radar, Binary
} from 'lucide-react';

import CommandScreenHUD from './components/CommandScreenHUD';
import EmailDefenseTab from './components/EmailDefenseTab';
import ImageForensicsTab from './components/ImageForensicsTab';
import VideoForensicsTab from './components/VideoForensicsTab';
import AudioForensicsTab from './components/AudioForensicsTab';
import VirusTotalHexTab from './components/VirusTotalHexTab';
import DossierExportTab from './components/DossierExportTab';
import SpartanShieldLogo from './components/SpartanShieldLogo';
import ForensicAuditHistory from './components/ForensicAuditHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState('ASTRALIS');
  // Global Reactive Threat State: 'NEUTRAL' | 'LEGIT' | 'THREAT'
  const [threatState, setThreatState] = useState('NEUTRAL');
  const [activeTarget, setActiveTarget] = useState({
    lat: 55.7558,
    lon: 37.6173,
    city: "Moscow",
    country: "Russia",
    org: "Bulletproof C2 Relay",
    threat_risk: 94
  });

  // Authentic Telemetry Metrics
  const [realPing, setRealPing] = useState(11.8);
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [telemetry, setTelemetry] = useState(null);

  // Structured Chronological Audit Trail of Things Searched & Analyzed
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "LOG-01",
      timestamp: "19:30:15",
      module: "EMAIL",
      action: "ANALYZED",
      target: "URGENT: Microsoft 365 Account Deactivation Warning",
      verdict: "⚠️ AI-CRAFTED PHISHING DETECTED",
      status: "THREAT",
      details: "Sender: security-alert@micros0ft-support-portal.com | Certainty: 98.4% | RFC-5322 Invariant Violation"
    },
    {
      id: "LOG-02",
      timestamp: "19:28:42",
      module: "IMAGE",
      action: "ANALYZED",
      target: "spliced_evidence.jpg (800x600)",
      verdict: "⚠️ AI-GENERATED (SYNTHETIC)",
      status: "THREAT",
      details: "Diffusion Latent Model v6 | ELA Discrepancy: 88% | Sensor Noise Variance: 3.42"
    },
    {
      id: "LOG-03",
      timestamp: "19:26:10",
      module: "HEX/VT",
      action: "INSPECTED",
      target: "tampered_stego_evidence.jpg",
      verdict: "⚠️ STEGANOGRAPHY DETECTED",
      status: "THREAT",
      details: "SHA-256: d8f3a9b2... | Hidden encrypted payload appended past JPEG End-Of-File marker FF D9"
    },
    {
      id: "LOG-04",
      timestamp: "19:24:05",
      module: "VIDEO",
      action: "ANALYZED",
      target: "suspected_deepfake_broadcast.mp4",
      verdict: "⚠️ AI DEEPFAKE (FACE-SWAP)",
      status: "THREAT",
      details: "120 Frames @ 30 FPS | Temporal Optical Flow: Unstable Synthetic Jitter (84.6% Conf)"
    },
    {
      id: "LOG-05",
      timestamp: "19:22:18",
      module: "AUDIO",
      action: "ANALYZED",
      target: "executive_voice_note_clone.wav",
      verdict: "⚠️ AI VOICE CLONE (SYNTHETIC)",
      status: "THREAT",
      details: "13-Band Librosa MFCC Formants | ElevenLabs Vocoder Phase Jitter Detected (88.4% Conf)"
    },
    {
      id: "LOG-06",
      timestamp: "19:19:50",
      module: "HEX/VT",
      action: "INSPECTED",
      target: "disguised_polyglot.jpg",
      verdict: "⚠️ POLYGLOT MALWARE DETECTED",
      status: "THREAT",
      details: "MZ Executable Header masked with .jpg extension | 62/72 VirusTotal Engines Flagged"
    },
    {
      id: "LOG-07",
      timestamp: "19:15:33",
      module: "RECON",
      action: "TARGET LOCK",
      target: "Moscow Uplink (55.75° N, 37.61° E)",
      verdict: "⚠️ CRITICAL SECTOR 1 (94% RISK)",
      status: "THREAT",
      details: "Bulletproof C2 Relay Vector | Intercept Status: Locked by KAVACH Sentinel"
    },
    {
      id: "LOG-08",
      timestamp: "19:10:12",
      module: "EMAIL",
      action: "ANALYZED",
      target: "Engineering Sprint Planning - Q4 Roadmap Review",
      verdict: "✅ AUTHENTIC HUMAN EMAIL",
      status: "LEGIT",
      details: "Sender: alex.rivera@technology-innovations.com | SPF: PASS | DKIM: PASS | Trust: 96.8%"
    }
  ]);

  const handleLogAudit = (newEvent) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const logItem = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      ...newEvent
    };

    setAuditLogs(prev => [logItem, ...prev.slice(0, 49)]);
  };

  const handleClearLogs = () => {
    setAuditLogs([]);
  };

  // Measure Real Network Ping against Backend
  useEffect(() => {
    const measureRealPing = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch('/api/health');
        await res.json();
        const t1 = performance.now();
        setRealPing(Math.round((t1 - t0) * 10) / 10);
      } catch (err) {
        setRealPing(12.5);
      }
    };

    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/astralis/telemetry');
        const data = await res.json();
        setTelemetry(data);
      } catch (err) {
        console.log("Telemetry fetch fallback", err);
      }
    };

    measureRealPing();
    fetchTelemetry();
    const pingInterval = setInterval(measureRealPing, 5000);
    const telemetryInterval = setInterval(fetchTelemetry, 9000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(telemetryInterval);
    };
  }, []);

  // Clock & Uptime Counter
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleTargetSelection = (target) => {
    setActiveTarget(target);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setAuditLogs(prev => {
      // Avoid spamming duplicate logs if user clicks the same city
      if (prev.length > 0 && prev[0].target.includes(target.city || 'NODE')) {
        return prev;
      }
      const newLog = {
        id: `LOG-${Date.now()}`,
        timestamp: timeStr,
        module: "RECON",
        action: "TARGET LOCK",
        target: `${target.city || 'Geospatial Sector'} (${target.lat}, ${target.lon})`,
        verdict: (target.threat_risk || 0) > 70 
          ? `⚠️ HIGH RISK TARGET (${target.threat_risk}%)` 
          : `✅ NOMINAL NODE (${target.threat_risk || 10}%)`,
        status: (target.threat_risk || 0) > 70 ? "THREAT" : "LEGIT",
        details: target.org || target.country || "God's Eye Orbital Recon Intercept"
      };
      return [newLog, ...prev.slice(0, 49)];
    });
  };

  const formatUptime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className={`min-h-screen font-body-clean relative overflow-x-hidden selection:bg-[#B2F601] selection:text-[#0a0a0d] transition-colors duration-700 ${
      threatState === 'LEGIT' 
        ? 'bg-[#06120a]' 
        : threatState === 'THREAT' 
        ? 'bg-[#16060c]' 
        : 'bg-[#0a0a0d]'
    }`}>
      {/* Cyberpunk Ambiance Neon Glows (#B2F601, #62C0F6, #FF3366) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {threatState === 'LEGIT' ? (
          <>
            <div className="absolute -top-32 right-1/4 w-[850px] h-[850px] bg-[#B2F601]/14 rounded-full blur-[200px] animate-pulse-glow" />
            <div className="absolute top-1/3 -left-20 w-[700px] h-[700px] bg-[#62C0F6]/10 rounded-full blur-[220px]" />
            <div className="absolute -bottom-40 right-10 w-[750px] h-[750px] bg-[#B2F601]/10 rounded-full blur-[220px]" />
          </>
        ) : threatState === 'THREAT' ? (
          <>
            <div className="absolute -top-32 right-1/4 w-[850px] h-[850px] bg-[#FF3366]/22 rounded-full blur-[200px] animate-pulse-glow" />
            <div className="absolute top-1/3 -left-20 w-[700px] h-[700px] bg-rose-600/18 rounded-full blur-[220px]" />
            <div className="absolute -bottom-40 right-10 w-[750px] h-[750px] bg-[#FF3366]/12 rounded-full blur-[220px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 right-1/4 w-[850px] h-[850px] bg-[#B2F601]/10 rounded-full blur-[200px] animate-pulse-glow" />
            <div className="absolute top-1/3 -left-20 w-[700px] h-[700px] bg-[#62C0F6]/12 rounded-full blur-[220px]" />
            <div className="absolute -bottom-40 right-10 w-[750px] h-[750px] bg-[#343645]/25 rounded-full blur-[220px]" />
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(98,192,246,0.035),transparent_70%)]" />
      </div>

      {/* ============================================================ */}
      {/* FLOATING DYNAMIC ISLAND TOP NAVBAR                           */}
      {/* ============================================================ */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-[1550px] pointer-events-auto">
        <header className="h-14 rounded-full bg-[#0a0a0d]/92 backdrop-blur-2xl border border-white/[0.12] px-3 sm:px-5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.85)] gap-3">
          {/* Left Cluster: Spartan Shield Logo & Brand (Strictly Single Line, Never Wraps) */}
          <div 
            onClick={() => { setActiveTab('ASTRALIS'); setThreatState('NEUTRAL'); }}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0 whitespace-nowrap select-none"
          >
            <SpartanShieldLogo 
              className="w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-105 transition-transform" 
              isThreat={threatState === 'THREAT'} 
            />

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide font-aveton">
                  KAVACH
                </span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono-hud font-bold border tracking-wider ${
                  threatState === 'THREAT'
                    ? 'bg-[#FF3366]/15 text-[#FF3366] border-[#FF3366]/40 shadow-[0_0_8px_rgba(255,51,102,0.3)]'
                    : 'bg-[#B2F601]/15 text-[#B2F601] border-[#B2F601]/40 shadow-[0_0_8px_rgba(178,246,1,0.3)]'
                }`}>
                  AURA 3D
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono-hud text-[#62C0F6] uppercase tracking-wider font-semibold mt-0.5">
                DEFENSE WAR ROOM
              </span>
            </div>
          </div>

          {/* Center: Dynamic Island Sliding Tab Pills (100% Pure English) */}
          <div className="hidden lg:flex items-center p-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl shrink-0">
            {[
              { id: 'ASTRALIS', label: "AURA 3D", icon: Globe },
              { id: 'EMAIL', label: "EMAIL DEFENSE", icon: Mail },
              { id: 'IMAGE', label: "IMAGE FORENSICS", icon: ImageIcon },
              { id: 'VIDEO', label: "VIDEO FORENSICS", icon: Video },
              { id: 'AUDIO', label: "AUDIO FORENSICS", icon: Radio },
              { id: 'VIRUSTOTAL', label: "HEX SCAN", icon: Binary },
              { id: 'DOSSIER', label: "DOSSIER", icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className={`absolute inset-0 rounded-full ${
                        threatState === 'LEGIT'
                          ? 'bg-[#B2F601]/25 border border-[#B2F601]/60 shadow-[0_0_18px_rgba(178,246,1,0.4)]'
                          : threatState === 'THREAT'
                          ? 'bg-[#FF3366]/25 border border-[#FF3366]/60 shadow-[0_0_18px_rgba(255,51,102,0.4)]'
                          : 'bg-white/10 border border-white/20 shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                      }`}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 shrink-0 ${
                    isActive ? (threatState === 'LEGIT' ? 'text-[#B2F601]' : threatState === 'THREAT' ? 'text-[#FF3366]' : 'text-[#B2F601]') : 'text-slate-400'
                  }`} />
                  <span className="relative z-10 text-[10px] xl:text-[11px] font-mono-hud whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Trailing Cluster: Automated Sentinel Threat Monitor Badge */}
          <div className="flex items-center gap-2 shrink-0 select-none">
            {threatState === 'THREAT' ? (
              <div 
                onClick={() => setThreatState('NEUTRAL')}
                title="Click to reset threat monitor to standby"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF3366]/15 border border-[#FF3366]/40 text-[#FF3366] font-mono-hud text-[10px] font-extrabold shadow-[0_0_15px_rgba(255,51,102,0.35)] cursor-pointer hover:bg-[#FF3366]/25 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-ping" />
                <span className="tracking-wider">DEFCON 1 // THREAT DETECTED</span>
              </div>
            ) : threatState === 'LEGIT' ? (
              <div 
                onClick={() => setThreatState('NEUTRAL')}
                title="Click to reset threat monitor to standby"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B2F601]/15 border border-[#B2F601]/40 text-[#B2F601] font-mono-hud text-[10px] font-extrabold shadow-[0_0_15px_rgba(178,246,1,0.35)] cursor-pointer hover:bg-[#B2F601]/25 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#B2F601]" />
                <span className="tracking-wider">SYSTEM SECURE // INTEGRITY OK</span>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 font-mono-hud text-[10px] font-bold shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#62C0F6] animate-pulse" />
                <span className="tracking-wider">SENTINEL MONITORING ACTIVE</span>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* MOBILE NAV STRIP (100% Pure English) */}
      <div className="lg:hidden fixed top-20 left-4 right-4 z-40 rounded-full bg-[#0a0a0d]/95 backdrop-blur-xl border border-white/10 p-1.5 overflow-x-auto flex gap-1 font-body-clean text-xs">
        {[
          { id: 'ASTRALIS', label: "AURA 3D", icon: Globe },
          { id: 'EMAIL', label: "EMAIL", icon: Mail },
          { id: 'IMAGE', label: "IMAGE", icon: ImageIcon },
          { id: 'VIDEO', label: "VIDEO", icon: Video },
          { id: 'AUDIO', label: "AUDIO", icon: Radio },
          { id: 'VIRUSTOTAL', label: "HEX SCAN", icon: Binary },
          { id: 'DOSSIER', label: "DOSSIER", icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full shrink-0 border font-mono-hud text-xs ${
                isActive 
                  ? 'bg-[#B2F601] text-[#0a0a0d] font-bold border-transparent' 
                  : 'border-transparent text-slate-400'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* MAIN VIEWPORT CONTAINER (pt-20 gives exact 12px clearance below floating navbar) */}
      {/* ============================================================ */}
      <main className="relative z-10 max-w-[1800px] mx-auto pt-20 pb-4 px-3 sm:px-6 space-y-3">
        {/* REACTIVE SYSTEM STATUS ALERT BANNER */}
        <AnimatePresence mode="wait">
          {threatState === 'LEGIT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-full hud-glass-lime flex items-center justify-between text-xs font-mono-hud text-[#B2F601] px-6"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#B2F601] animate-pulse" />
                <span className="font-bold tracking-wide">
                  DEFENSE STATUS: VERIFIED AUTHENTIC // ZERO THREATS DETECTED // DIGITAL SIGNATURES INTACT
                </span>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-[#B2F601]/20 text-[#B2F601] text-[10px] font-bold border border-[#B2F601]/40">
                100% SECURE
              </span>
            </motion.div>
          )}

          {threatState === 'THREAT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-full hud-glass-crimson flex items-center justify-between text-xs font-mono-hud text-[#FF3366] px-6"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-[#FF3366] animate-bounce" />
                <span className="font-bold tracking-wide">
                  DEFCON 1 CRITICAL ALERT: MALICIOUS INTRUSION OR SYNTHETIC DEEPFAKE WARPING DETECTED
                </span>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-[#FF3366]/20 text-[#FF3366] text-[10px] font-bold border border-[#FF3366]/40 animate-pulse">
                HOSTILE COMPROMISE
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE TAB VIEWPORT */}
        <div className="relative">
          {activeTab === 'ASTRALIS' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CommandScreenHUD
                activeTarget={activeTarget}
                threatState={threatState}
                onSelectNode={handleTargetSelection}
                telemetry={telemetry}
                realPing={realPing}
                onLogAudit={handleLogAudit}
              />
            </motion.div>
          )}

          {activeTab === 'EMAIL' && (
            <EmailDefenseTab 
              onTargetSelected={handleTargetSelection} 
              onVerdictChange={setThreatState}
              onLogAudit={handleLogAudit}
            />
          )}

          {activeTab === 'IMAGE' && (
            <ImageForensicsTab 
              onTargetSelected={handleTargetSelection}
              onVerdictChange={setThreatState}
              onLogAudit={handleLogAudit}
            />
          )}

          {activeTab === 'VIDEO' && (
            <VideoForensicsTab 
              onVerdictChange={setThreatState} 
              onLogAudit={handleLogAudit}
            />
          )}

          {activeTab === 'AUDIO' && (
            <AudioForensicsTab 
              onVerdictChange={setThreatState} 
              onLogAudit={handleLogAudit}
            />
          )}

          {activeTab === 'VIRUSTOTAL' && (
            <VirusTotalHexTab 
              onVerdictChange={setThreatState} 
              onLogAudit={handleLogAudit}
            />
          )}

          {activeTab === 'DOSSIER' && (
            <DossierExportTab />
          )}
        </div>

        {/* REAL-TIME ANALYSIS & SEARCH HISTORY AUDIT TRAIL */}
        <ForensicAuditHistory 
          auditLogs={auditLogs}
          onClearLogs={handleClearLogs}
          currentTime={currentTime}
        />
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/[0.08] bg-[#0a0a0d]/95 py-4 px-6 text-center text-xs font-body-clean text-slate-500">
        <div className="text-slate-400 font-medium">
          KAVACH (THE PROTECTOR) // AUTONOMOUS CYBER DEFENSE WAR ROOM
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-semibold">
          SecYureD Engineering Team: <span className="text-slate-200">Sameeraj, Krish, Devansh, Prince</span>
        </div>
      </footer>
    </div>
  );
}
