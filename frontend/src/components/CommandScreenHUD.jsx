import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, Plane, Activity, CheckSquare, Clock, CloudRain, 
  ChevronRight, AlertTriangle, CheckCircle2, ArrowUpRight, Crosshair,
  TrendingUp, Terminal, Radio, Eye, Layers, Compass, SlidersHorizontal,
  Flame, Lock, Cpu
} from 'lucide-react';
import AstralisGlobe, { PINNED_CITIES } from './AstralisGlobe';

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

  // Dual-Direction Column Chart Data (Exact from Image 1 Alibaba 20 Screen)
  const trajectoryBarData = [
    { hour: "02", up: 76, down: 18 },
    { hour: "03", up: 7, down: 25 },
    { hour: "04", up: 8, down: 19 },
    { hour: "05", up: 10, down: 32 },
    { hour: "06", up: 2, down: 15 },
    { hour: "07", up: 19, down: 45 },
    { hour: "08", up: 2401, down: 890 },
    { hour: "09", up: 120, down: 1100 },
    { hour: "10", up: 2600, down: 1350 },
    { hour: "11", up: 141, down: 620 },
    { hour: "12", up: 80, down: 410 },
    { hour: "13", up: 50, down: 320 }
  ];

  // Detailed Flight / Threat Vector Table (Exact from Image 1)
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
    <div className="relative w-full overflow-hidden text-slate-200">
      {/* Sci-Fi Cockpit Border Framing & Header (From Image 1 & 2) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-3 mb-3 border-b border-[#343645]/80 gap-3">
        {/* Left Title: Alibaba 20 / Big Data War Room Style */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#343645] border border-[#62C0F6]/40 text-[#B2F601] font-bold text-sm shadow">
            K20
          </div>
          <div>
            <h1 className="text-xl font-bold font-tactical text-white tracking-wide flex items-center gap-2">
              <span>全球态势指挥大屏</span>
              <span className="text-xs font-mono-hud text-[#62C0F6] uppercase font-semibold">
                // KAVACH AURA 3D COMMAND SCREEN
              </span>
            </h1>
            <div className="text-[10px] font-mono-hud text-slate-400">
              COMMAND SCREEN OF 2026 AUTONOMOUS CYBER DEFENSE ANNIVERSARY
            </div>
          </div>
        </div>

        {/* Right Top Status Cluster (Clock, Date, Temp, Ping from Image 1) */}
        <div className="flex items-center gap-4 text-xs font-mono-hud">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E111A]/90 border border-[#343645]">
            <span className="text-slate-400 text-[10px]">TIME:</span>
            <span className="text-white font-bold tracking-widest">{timeString}</span>
            <span className="text-slate-500 text-[10px]">{dateString}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E111A]/90 border border-[#343645]">
            <span className="text-slate-400 text-[10px]">TEMP:</span>
            <span className="text-[#B2F601] font-bold">32°C</span>
            <CloudRain className="w-3.5 h-3.5 text-[#62C0F6]" />
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E111A]/90 border border-[#343645]">
            <span className="text-slate-400 text-[10px]">DEFCON:</span>
            <span className={`font-bold ${threatState === 'THREAT' ? 'text-[#FF3366] animate-pulse' : 'text-[#B2F601]'}`}>
              {threatState === 'THREAT' ? '1 (CRITICAL)' : '4 (NORMAL)'}
            </span>
          </div>
        </div>
      </div>

      {/* Panoramic 3-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ============================================================ */}
        {/* LEFT FLANK HUD (4 Cols): Situation Statistics & Donut Gauges */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: 网络态势统计 / Situation Statistics (Image 1 Top Left) */}
          <div className="hud-glass-panel p-4 rounded-2xl border border-[#343645] space-y-3">
            <div className="flex items-center justify-between border-b border-[#343645]/80 pb-2">
              <div className="flex items-center gap-2 text-white font-tactical text-xs font-bold">
                <CheckSquare className="w-3.5 h-3.5 text-[#62C0F6]" />
                <span>网络态势统计</span>
                <span className="text-[10px] text-slate-400 font-mono-hud font-normal">Crossing statistics</span>
              </div>
            </div>

            {/* Big Metrics */}
            <div className="grid grid-cols-2 gap-2 font-mono-hud">
              <div className="p-2.5 rounded-xl bg-[#0E111A]/70 border border-[#343645]/60">
                <div className="text-[10px] text-slate-400">中继总人数 (TOTAL):</div>
                <div className="text-xl font-bold text-[#62C0F6] mt-0.5">48,304</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0E111A]/70 border border-[#343645]/60">
                <div className="text-[10px] text-slate-400">核查通过 (VERIFIED):</div>
                <div className="text-xl font-bold text-[#B2F601] mt-0.5">43,855</div>
              </div>
            </div>

            {/* Horizontal Subsystem Progress Bars (Image 1) */}
            <div className="space-y-2 pt-1 font-mono-hud text-[11px]">
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
                    <span className="text-[#62C0F6]">{bar.num} ({bar.val})</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1A1F2C] overflow-hidden">
                    <div 
                      className={`h-full ${bar.color} rounded-full`} 
                      style={{ width: bar.width }} 
                    />
                  </div>
                </div>
              ))}

              {/* Scale Marker Ticks (Image 1) */}
              <div className="flex justify-between text-[8px] text-slate-500 pt-1 border-t border-[#343645]/40 font-mono-hud">
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

          {/* Card 2: 威胁分布 / Threat Distribution Donut Rings (Image 1 Bottom Left) */}
          <div className="hud-glass-panel p-4 rounded-2xl border border-[#343645] space-y-3">
            <div className="flex items-center justify-between border-b border-[#343645]/80 pb-2">
              <div className="flex items-center gap-2 text-white font-tactical text-xs font-bold">
                <Activity className="w-3.5 h-3.5 text-[#B2F601]" />
                <span>威胁分布</span>
                <span className="text-[10px] text-slate-400 font-mono-hud font-normal">Threat distribution</span>
              </div>
            </div>

            {/* Donut Ring 1 with 4 Metrics */}
            <div className="flex items-center gap-3">
              {/* Circular SVG Donut Gauge */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#1E2332]"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#B2F601]"
                    strokeDasharray="91, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center font-mono-hud">
                  <span className="text-[8px] text-slate-400">总人数</span>
                  <span className="text-xs font-bold text-white">43,855</span>
                </div>
              </div>

              {/* 4 Breakdown Numbers (Image 1) */}
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono-hud w-full">
                <div className="p-1.5 rounded bg-[#0E111A]/60 border border-[#343645]/50">
                  <div className="text-[8px] text-[#62C0F6]">● 经核查总人数</div>
                  <div className="text-xs font-bold text-white">25,635</div>
                </div>
                <div className="p-1.5 rounded bg-[#0E111A]/60 border border-[#343645]/50">
                  <div className="text-[8px] text-[#B2F601]">● 拟出境总人数</div>
                  <div className="text-xs font-bold text-white">15,740</div>
                </div>
                <div className="p-1.5 rounded bg-[#0E111A]/60 border border-[#343645]/50">
                  <div className="text-[8px] text-amber-400">● 隔离观察</div>
                  <div className="text-xs font-bold text-white">890</div>
                </div>
                <div className="p-1.5 rounded bg-[#0E111A]/60 border border-[#343645]/50">
                  <div className="text-[8px] text-[#FF3366]">● 恶意拦截</div>
                  <div className="text-xs font-bold text-white">1,580</div>
                </div>
              </div>
            </div>

            {/* Donut Ring 2 */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#343645]/50">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#1E2332]"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#62C0F6]"
                    strokeDasharray="73, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center font-mono-hud">
                  <span className="text-[8px] text-slate-400">总人数</span>
                  <span className="text-xs font-bold text-white">15,740</span>
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono-hud w-full">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span className="text-[#62C0F6]">● 本市 (Internal):</span>
                  <span className="font-bold text-white">11,483</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span className="text-[#B2F601]">● 跨域 (Transit):</span>
                  <span className="font-bold text-white">2,062</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span className="text-amber-400">● 截停 (Isolated):</span>
                  <span className="font-bold text-white">2,195</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 实时态势资讯 / Real-Time Incident Stream (From Image 2) */}
          <div className="hud-glass-panel p-4 rounded-2xl border border-[#343645] space-y-2">
            <div className="flex items-center justify-between border-b border-[#343645]/80 pb-2">
              <div className="flex items-center gap-2 text-white font-tactical text-xs font-bold">
                <Terminal className="w-3.5 h-3.5 text-[#62C0F6]" />
                <span>实时态势资讯</span>
                <span className="text-[10px] text-slate-400 font-mono-hud font-normal">Real-Time Threat Intel</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#B2F601] animate-ping" />
            </div>

            <div className="space-y-2 text-[11px] font-mono-hud">
              <div className="p-2 rounded bg-[#0E111A]/80 border-l-2 border-[#62C0F6]">
                <div className="text-[9px] text-[#62C0F6]">2026-10-20 21:57:04 UTC</div>
                <div className="text-slate-200 mt-0.5">M365 Spoofed Auth Payload Dropped (IP 185.220.101.45)</div>
              </div>
              <div className="p-2 rounded bg-[#0E111A]/80 border-l-2 border-[#B2F601]">
                <div className="text-[9px] text-[#B2F601]">2026-10-20 21:54:12 UTC</div>
                <div className="text-slate-200 mt-0.5">Sherloq ELA High Laplacian Noise Splicing Isolated</div>
              </div>
              <div className="p-2 rounded bg-[#0E111A]/80 border-l-2 border-[#FF3366]">
                <div className="text-[9px] text-[#FF3366]">2026-10-20 21:51:30 UTC</div>
                <div className="text-slate-200 mt-0.5">Librosa Synthetic Vocoder Phase Jitter Neutralized</div>
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
        {/* RIGHT FLANK HUD (3 Cols): Dual-Direction Chart & Flights     */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: 差旅分布 (航班信息) / Dual-Direction Column Chart (Exact Image 1) */}
          <div className="hud-glass-panel p-4 rounded-2xl border border-[#343645] space-y-3">
            <div className="flex items-center justify-between border-b border-[#343645]/80 pb-2">
              <div>
                <div className="flex items-center gap-2 text-white font-tactical text-xs font-bold">
                  <Plane className="w-3.5 h-3.5 text-[#B2F601]" />
                  <span>差旅分布 (航班信息)</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono-hud">
                  Travel Distribution (Flight Information)
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono-hud">
              <span className="text-slate-400 text-[10px]">每日拦截人数:</span>
              <span className="text-base font-bold text-[#B2F601]">2,195</span>
              <div className="flex gap-2 text-[9px]">
                <span className="text-amber-400">● 异常</span>
                <span className="text-[#62C0F6]">● 拦截</span>
              </div>
            </div>

            {/* THE ICONIC DUAL-DIRECTION COLUMN CHART */}
            <div className="h-44 w-full flex items-center justify-between gap-1 pt-2 pb-1 px-1 bg-[#0E111A]/60 rounded-xl border border-[#343645]/50 relative">
              {/* Zero Baseline Axis Line */}
              <div className="absolute top-1/2 left-2 right-2 h-px bg-[#343645]" />

              {trajectoryBarData.map((col, cidx) => {
                // Calculate height percentage up and down
                const maxVal = 2600;
                const upHeight = Math.max(6, (col.up / maxVal) * 72);
                const downHeight = Math.max(6, (col.down / 1500) * 72);

                return (
                  <div key={cidx} className="h-full flex flex-col justify-center items-center flex-1 relative group cursor-pointer">
                    {/* Upper Bar (Orange/Crimson Anomalies) */}
                    <div className="flex-1 flex flex-col justify-end items-center w-full">
                      {col.up > 2000 && (
                        <span className="text-[8px] font-mono-hud text-amber-300 font-bold mb-0.5 select-none scale-75 origin-bottom">
                          {col.up}
                        </span>
                      )}
                      <div 
                        className="w-full max-w-[12px] bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-sm group-hover:brightness-125 transition-all"
                        style={{ height: `${upHeight}px` }}
                      />
                    </div>

                    {/* Hour Label on Baseline */}
                    <span className="text-[7px] font-mono-hud text-slate-400 my-0.5 select-none z-10">
                      {col.hour}
                    </span>

                    {/* Lower Bar (Cyan/Lime Intercepts) */}
                    <div className="flex-1 flex flex-col justify-start items-center w-full">
                      <div 
                        className="w-full max-w-[12px] bg-gradient-to-b from-[#62C0F6] to-teal-400 rounded-b-sm group-hover:brightness-125 transition-all"
                        style={{ height: `${downHeight}px` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: 详细航班信息 / Detailed Flight & Threat Vectors Table (Image 1) */}
          <div className="hud-glass-panel p-4 rounded-2xl border border-[#343645] space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#343645]/80 pb-2">
              <div className="flex items-center gap-2 text-white font-tactical text-xs font-bold">
                <Plane className="w-3.5 h-3.5 text-[#62C0F6]" />
                <span>详细航班信息</span>
                <span className="text-[9px] text-slate-400 font-mono-hud font-normal">Detailed flight information</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[9px] font-mono-hud text-slate-400 border-b border-[#343645]/50 pb-1 px-1">
              <span className="col-span-2">时间</span>
              <span className="col-span-3">航班/代码</span>
              <span className="col-span-5">航段/路径</span>
              <span className="col-span-2 text-right">态势</span>
            </div>

            {/* Table Rows (Clickable to lock on globe) */}
            <div className="space-y-1 font-mono-hud text-[10px] max-h-48 overflow-y-auto pr-1">
              {flightVectorRows.map((row, ridx) => {
                const isSelected = selectedRouteIndex === ridx;
                return (
                  <div
                    key={ridx}
                    onClick={() => handleRowClick(row, ridx)}
                    className={`grid grid-cols-12 items-center p-1.5 rounded cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#62C0F6]/20 border border-[#62C0F6]/50 text-white'
                        : 'bg-[#0E111A]/50 hover:bg-[#343645]/40 text-slate-300'
                    }`}
                  >
                    <span className="col-span-2 text-slate-400 text-[9px]">{row.time}</span>
                    <span className="col-span-3 font-bold text-white truncate">{row.code}</span>
                    <span className="col-span-5 text-slate-300 truncate text-[9px]">{row.route}</span>
                    <span className="col-span-2 text-right">
                      <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                        row.status === 'CRITICAL' 
                          ? 'bg-red-950 text-red-300 border border-red-500/30' 
                          : row.status === 'ELEVATED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {row.sector}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: 年龄/威胁分类占比 (4 Donut Gauges from Image 2 Bottom Right) */}
          <div className="hud-glass-panel p-4 rounded-2xl border border-[#343645] space-y-2">
            <div className="flex items-center justify-between border-b border-[#343645]/80 pb-2">
              <div className="flex items-center gap-2 text-white font-tactical text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-[#B2F601]" />
                <span>年龄/分类分布</span>
                <span className="text-[9px] text-slate-400 font-mono-hud font-normal">Classification Ratio</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 font-mono-hud">
              {[
                { pct: "9%", label: "30岁以下", sub: "Packet Drop", col: "text-[#62C0F6]", stroke: "18, 100" },
                { pct: "17%", label: "30-39岁", sub: "BGP Drift", col: "text-[#B2F601]", stroke: "34, 100" },
                { pct: "19%", label: "40-49岁", sub: "PRNU Noise", col: "text-amber-400", stroke: "38, 100" },
                { pct: "55%", label: "50岁以上", sub: "Auth Shield", col: "text-teal-300", stroke: "110, 100" }
              ].map((d, didx) => (
                <div key={didx} className="flex flex-col items-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#1E2332]"
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
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">{d.pct}</span>
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
