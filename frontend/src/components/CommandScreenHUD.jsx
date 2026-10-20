import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, Plane, Activity, CheckSquare, Clock, CloudRain, 
  ChevronRight, AlertTriangle, CheckCircle2, ArrowUpRight, Crosshair,
  TrendingUp, Terminal, Radio, Eye, Layers, Compass, SlidersHorizontal,
  Flame, Lock, Cpu
} from 'lucide-react';
import AstralisGlobe, { PINNED_CITIES } from './AstralisGlobe';
import { 
  ThreatSparklineCard, 
  VerticalBarVisualizerCard, 
  QuickActionPill, 
  NotificationPill,
  DynamicIslandStatusCapsule 
} from './DynamicIslandWidgets';

export default function CommandScreenHUD({
  activeTarget,
  threatState = 'NEUTRAL',
  onSelectNode,
  telemetry,
  realPing = 11.8
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (n) => (n < 10 ? `0${n}` : n);
  const timeString = `${formatDigits(currentTime.getHours())}:${formatDigits(currentTime.getMinutes())}:${formatDigits(currentTime.getSeconds())}`;
  const dateString = `${currentTime.getFullYear()}.${formatDigits(currentTime.getMonth() + 1)}.${formatDigits(currentTime.getDate())}`;

  // Detailed Flight / Threat Vector Table (From Image 1 Alibaba 20 Screen)
  const flightVectorRows = [
    { time: "09:01", code: "CA1817", route: "WESTWARD RELAY -> MOSCOW", status: "CRITICAL", sector: "1", risk: 94, city: "Moscow", lat: 55.75, lon: 37.61 },
    { time: "09:02", code: "MU536", route: "SHANGHAI -> FRANKFURT", status: "NORMAL", sector: "2", risk: 18, city: "Frankfurt", lat: 50.11, lon: 8.68 },
    { time: "09:03", code: "CZ3704", route: "BEIJING -> SEATTLE", status: "ELEVATED", sector: "1", risk: 52, city: "Beijing", lat: 39.90, lon: 116.40 },
    { time: "09:04", code: "CA1770", route: "LONDON -> NEW YORK", status: "NORMAL", sector: "3", risk: 14, city: "London", lat: 51.50, lon: -0.12 },
    { time: "09:04", code: "CA1780", route: "DUBAI -> TOKYO", status: "NORMAL", sector: "2", risk: 22, city: "Dubai", lat: 25.20, lon: 55.27 },
    { time: "09:05", code: "CZ8769", route: "SINGAPORE -> SYDNEY", status: "NORMAL", sector: "1", risk: 10, city: "Singapore", lat: 1.35, lon: 103.81 },
    { time: "09:05", code: "TR480", route: "BANGALORE -> ZURICH", status: "CRITICAL", sector: "2", risk: 88, city: "New Delhi", lat: 28.61, lon: 77.20 },
    { time: "09:05", code: "HU7277", route: "SVO -> NEW DELHI", status: "ELEVATED", sector: "1", risk: 42, city: "Moscow", lat: 55.75, lon: 37.61 }
  ];

  const handleRowClick = (row, idx) => {
    setSelectedRouteIndex(idx);
    if (onSelectNode) {
      onSelectNode({
        city: row.city,
        lat: row.lat,
        lon: row.lon,
        country: row.route,
        org: `${row.code} Flight Vector`,
        threat_risk: row.risk
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden text-slate-200 font-body-clean">
      {/* Dynamic Island Status Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-white/[0.08] gap-3">
        {/* Left Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0a0a0d] border border-white/15 text-[#B2F601] font-bold text-xs shadow-md">
            K20
          </div>
          <div>
            <h1 className="text-lg font-extrabold font-body-clean text-white tracking-tight flex items-center gap-2">
              <span>全球态势指挥大屏</span>
              <span className="text-xs font-mono-hud text-[#62C0F6] uppercase font-semibold">
                // AURA 3D COMMAND WAR ROOM
              </span>
            </h1>
            <div className="text-[10px] text-slate-400 font-body-clean">
              AUTONOMOUS CYBER DEFENSE & MULTI-SPECTRAL FORENSIC CORE
            </div>
          </div>
        </div>

        {/* Right Status Capsule */}
        <div className="flex items-center gap-2.5">
          <DynamicIslandStatusCapsule 
            time={timeString} 
            label={threatState === 'THREAT' ? "DEFCON 1 // BREACH" : "DEFCON 4 // NORMAL"} 
            badge={threatState === 'THREAT' ? "CRITICAL" : "100% OK"}
            battery="32°C"
          />
        </div>
      </div>

      {/* Panoramic 3-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ============================================================ */}
        {/* LEFT FLANK HUD (3.5 Cols): Apple Island Cards & Crossing Stats */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card 1: THREAT SPARKLINE CARD (Widget 1 from reference image) */}
          <ThreatSparklineCard 
            totalSignals="48,304" 
            delta="+1,240" 
            pct="1.24%" 
          />

          {/* Card 2: NOTIFICATION ALERT PILL (Widget 5 from reference image) */}
          <NotificationPill 
            title="M365 Auth Gateway" 
            subtitle="Credential harvest spoof isolated" 
            percentage="98" 
          />

          {/* Card 3: 网络态势统计 / Situation Statistics (Image 1 Left) */}
          <div className="p-4 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-3 select-none">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
              <div className="flex items-center gap-2 text-white text-xs font-bold font-body-clean">
                <CheckSquare className="w-3.5 h-3.5 text-[#62C0F6]" />
                <span>网络态势统计</span>
                <span className="text-[10px] text-slate-500 font-normal">Crossing Statistics</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#B2F601]/15 text-[#B2F601] font-bold">LIVE</span>
            </div>

            {/* Horizontal Subsystem Progress Bars (Image 1) */}
            <div className="space-y-2 pt-1 font-body-clean text-[11px]">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>按指标统计 (Metric Breakdown)</span>
                <div className="flex gap-2 text-[9px]">
                  <span className="text-[#62C0F6]">● 本分支</span>
                  <span className="text-[#B2F601]">● 正常</span>
                  <span className="text-[#FF3366]">● 告警</span>
                </div>
              </div>

              {[
                { label: "NN (RFC Phish)", val: "92%", num: "44,120", width: "92%", color: "bg-[#62C0F6]" },
                { label: "CV (Sherloq ELA)", val: "78%", num: "37,680", width: "78%", color: "bg-[#B2F601]" },
                { label: "VID (Amped Flow)", val: "65%", num: "31,400", width: "65%", color: "bg-[#62C0F6]" },
                { label: "VOX (Librosa 13)", val: "89%", num: "42,500", width: "89%", color: "bg-[#B2F601]" }
              ].map((bar, bidx) => (
                <div key={bidx} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-300">
                    <span>{bar.label}</span>
                    <span className="text-[#62C0F6] font-bold">{bar.num} ({bar.val})</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1c1e26] overflow-hidden">
                    <div 
                      className={`h-full ${bar.color} rounded-full`} 
                      style={{ width: bar.width }} 
                    />
                  </div>
                </div>
              ))}

              {/* Scale Marker Ticks (Image 1) */}
              <div className="flex justify-between text-[8px] text-slate-500 pt-1 border-t border-white/[0.06] font-mono-hud">
                <span>0</span>
                <span>5000</span>
                <span>10000</span>
                <span>15000</span>
                <span>20000</span>
                <span>25000</span>
                <span>31760</span>
              </div>
            </div>
          </div>

          {/* Card 4: 实时态势资讯 / Real-Time Incident Stream (From Image 2) */}
          <div className="p-4 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-2 select-none">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
              <div className="flex items-center gap-2 text-white text-xs font-bold font-body-clean">
                <Terminal className="w-3.5 h-3.5 text-[#62C0F6]" />
                <span>实时态势资讯</span>
                <span className="text-[10px] text-slate-500 font-normal">Real-Time Threat Intel</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#B2F601] animate-ping" />
            </div>

            <div className="space-y-1.5 text-[11px] font-body-clean">
              <div className="p-2 rounded-xl bg-black/60 border border-white/[0.05] border-l-2 border-l-[#62C0F6]">
                <div className="text-[9px] text-[#62C0F6] font-mono-hud">2026-10-20 21:57:04 UTC</div>
                <div className="text-slate-200 mt-0.5 text-xs font-medium">M365 Spoofed Auth Payload Dropped</div>
              </div>
              <div className="p-2 rounded-xl bg-black/60 border border-white/[0.05] border-l-2 border-l-[#B2F601]">
                <div className="text-[9px] text-[#B2F601] font-mono-hud">2026-10-20 21:54:12 UTC</div>
                <div className="text-slate-200 mt-0.5 text-xs font-medium">Sherloq ELA High Noise Splicing Isolated</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER VIEWPORT (6 Cols): Full 3D Recon Globe with City Pins */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 h-[720px] relative">
          <AstralisGlobe
            activeTarget={activeTarget}
            threatState={threatState}
            onSelectNode={onSelectNode}
          />
        </div>

        {/* ============================================================ */}
        {/* RIGHT FLANK HUD (3 Cols): Vertical Bar Widget & Flights      */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card 1: VERTICAL BAR VISUALIZER CARD (Widget 6 from reference image) */}
          <VerticalBarVisualizerCard 
            title="TRAJECTORY FREQUENCY" 
            subtitle="Daily Intercept Load (2,195 / 24h)" 
          />

          {/* Card 2: QUICK ACTION PILL (Widget 2 & 4 from reference image) */}
          <QuickActionPill 
            icon="★" 
            title="AURA-GEO 3 SATELLITE" 
            subtitle="Geostationary Early Warning • 35,786 km" 
            actionLabel="Lock Recon" 
            onClick={() => onSelectNode && onSelectNode({ city: "Orbital Recon", lat: 35.78, lon: -100, threat_risk: 12 })}
          />

          {/* Card 3: 详细航班信息 / Detailed Flight & Threat Vectors Table (Image 1) */}
          <div className="p-4 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-2.5 select-none">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
              <div className="flex items-center gap-2 text-white text-xs font-bold font-body-clean">
                <Plane className="w-3.5 h-3.5 text-[#62C0F6]" />
                <span>详细航班信息</span>
                <span className="text-[9px] text-slate-500 font-normal">Flight & Threat Vectors</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[9px] font-mono-hud text-slate-400 border-b border-white/[0.06] pb-1 px-1">
              <span className="col-span-2">时间</span>
              <span className="col-span-3">航班/代码</span>
              <span className="col-span-5">航段/路径</span>
              <span className="col-span-2 text-right">态势</span>
            </div>

            {/* Table Rows (Clickable to lock on globe) */}
            <div className="space-y-1 font-body-clean text-[10px] max-h-48 overflow-y-auto pr-1">
              {flightVectorRows.map((row, ridx) => {
                const isSelected = selectedRouteIndex === ridx;
                return (
                  <div
                    key={ridx}
                    onClick={() => handleRowClick(row, ridx)}
                    className={`grid grid-cols-12 items-center p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#B2F601]/15 border border-[#B2F601]/40 text-white'
                        : 'bg-black/40 hover:bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    <span className="col-span-2 text-slate-400 text-[9px] font-mono-hud">{row.time}</span>
                    <span className="col-span-3 font-bold text-white truncate">{row.code}</span>
                    <span className="col-span-5 text-slate-300 truncate text-[9px]">{row.route}</span>
                    <span className="col-span-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                        row.status === 'CRITICAL' 
                          ? 'bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]/30' 
                          : row.status === 'ELEVATED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-[#B2F601]/20 text-[#B2F601] border border-[#B2F601]/30'
                      }`}>
                        SEC-{row.sector}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: 4 RADIAL DONUT PERCENTAGE GAUGES (From Image 2) */}
          <div className="p-4 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-2 select-none">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
              <div className="flex items-center gap-2 text-white text-xs font-bold font-body-clean">
                <Layers className="w-3.5 h-3.5 text-[#B2F601]" />
                <span>防御分类占比</span>
                <span className="text-[9px] text-slate-500 font-normal">Classification Ratio</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 font-body-clean">
              {[
                { pct: "9%", label: "丢包率", sub: "Packet Drop", col: "text-[#62C0F6]", stroke: "18, 100" },
                { pct: "17%", label: "漂移率", sub: "BGP Drift", col: "text-[#B2F601]", stroke: "34, 100" },
                { pct: "19%", label: "噪点率", sub: "PRNU Noise", col: "text-amber-400", stroke: "38, 100" },
                { pct: "55%", label: "通过率", sub: "Auth Shield", col: "text-teal-300", stroke: "110, 100" }
              ].map((d, didx) => (
                <div key={didx} className="flex flex-col items-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#1c1e26]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={d.col}
                        strokeDasharray={d.stroke}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-white">{d.pct}</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 mt-1">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
