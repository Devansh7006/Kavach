import React from 'react';
import { 
  Shield, TrendingUp, Bell, ShoppingCart, Satellite, Lock, 
  ArrowUpRight, Radio, CheckCircle, Wifi, Compass, Eye, Sparkles
} from 'lucide-react';

/**
 * 1. THREAT SPARKLINE CARD
 * Exact replica of the TSLA stock card from the user's reference image:
 * - Rounded squircle card (rounded-[28px])
 * - Pitch black obsidian (#0a0a0d)
 * - Red emblem badge on top-left + "KAVACH // SENTINEL" + "Neural Defense Matrix"
 * - "updated 2m ago" on top-right
 * - Large number: "48,304" with green tag "+1,240 / 1.24%"
 * - Glowing neon green sparkline wave with dashed baseline
 */
export function ThreatSparklineCard({ 
  totalSignals = "89,412", 
  delta = "+1,429", 
  pct = "11.8 ms", 
  title = "KAVACH SENTINEL",
  subtitle = "Neural Defense Matrix",
  updatedText = "Live Telemetry",
  onExplore = null 
}) {
  return (
    <div 
      onClick={onExplore}
      className="p-4 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl hover:border-[#B2F601]/40 transition-all cursor-pointer relative overflow-hidden group select-none"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#FF3366]/15 border border-[#FF3366]/40 flex items-center justify-center text-[#FF3366]">
            <Shield className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{title}</div>
            <div className="text-xs font-bold text-white font-body-clean">{subtitle}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[8px] text-slate-500">status</div>
          <div className="text-[9px] font-bold text-[#B2F601]">{updatedText}</div>
        </div>
      </div>

      {/* Primary Value & Green Growth Pill */}
      <div className="flex items-baseline gap-2.5 my-1.5">
        <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-aveton">
          {totalSignals}
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B2F601]/15 text-[#B2F601] text-[9px] font-bold border border-[#B2F601]/30">
          <TrendingUp className="w-2.5 h-2.5" />
          <span>{delta}</span>
          <span className="text-[8px] opacity-80">({pct})</span>
        </div>
      </div>

      {/* Glowing Neon Green Sparkline Wave (Exact from Reference) */}
      <div className="relative h-12 w-full mt-1">
        {/* Subtle Horizontal Dashed Baseline */}
        <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-white/10" />

        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60" preserveAspectRatio="none">
          {/* Neon Glow Filter */}
          <defs>
            <filter id="neonGreenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#B2F601" floodOpacity="0.8" />
            </filter>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B2F601" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#B2F601" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shaded Area Underneath */}
          <path
            d="M 0 36 Q 30 38, 60 30 T 120 35 T 150 48 T 180 32 T 220 28 T 260 22 T 300 24 L 300 60 L 0 60 Z"
            fill="url(#sparklineGrad)"
          />

          {/* Electric Neon Green Line with Dip and Rise */}
          <path
            d="M 0 36 Q 30 38, 60 30 T 120 35 T 150 48 T 180 32 T 220 28 T 260 22 T 300 24"
            fill="none"
            stroke="#B2F601"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#neonGreenGlow)"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * 2. VERTICAL BAR VISUALIZER CARD
 * Exact replica of the TSLA 14-day vertical bar card from reference:
 * - Rounded squircle card (rounded-[28px])
 * - 14 rounded vertical bars
 * - Most bars dark grey (#1e2025)
 * - Spiked active bars in glowing neon green (#B2F601)
 * - Days underneath: S M T W T F S S M T W T F S S M
 */
export function VerticalBarVisualizerCard({ title = "TRAJECTORY LOAD", subtitle = "Daily Intercept Frequency", onExplore = null }) {
  const bars = [
    { day: "S", height: 35, active: false },
    { day: "M", height: 42, active: false },
    { day: "T", height: 38, active: false },
    { day: "W", height: 50, active: false },
    { day: "T", height: 44, active: false },
    { day: "F", height: 40, active: false },
    { day: "S", height: 46, active: false },
    { day: "S", height: 85, active: true },   // Peak Glowing Bar 1
    { day: "M", height: 55, active: false },
    { day: "T", height: 95, active: true },   // Peak Glowing Bar 2
    { day: "W", height: 48, active: false },
    { day: "T", height: 42, active: false },
    { day: "F", height: 38, active: false },
    { day: "S", height: 45, active: false },
    { day: "S", height: 40, active: false },
    { day: "M", height: 34, active: false }
  ];

  return (
    <div 
      onClick={onExplore}
      className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl hover:border-[#B2F601]/40 transition-all cursor-pointer relative overflow-hidden group select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FF3366]/15 border border-[#FF3366]/40 flex items-center justify-center text-[#FF3366]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</div>
            <div className="text-xs font-bold text-white font-body-clean">{subtitle}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] text-slate-500">updated</div>
          <div className="text-[10px] font-bold text-slate-400">2m ago</div>
        </div>
      </div>

      {/* 14 Vertical Rounded Bars */}
      <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
        {bars.map((bar, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div 
              className={`w-full max-w-[8px] rounded-full transition-all duration-300 ${
                bar.active 
                  ? 'bg-[#B2F601] shadow-[0_0_12px_rgba(178,246,1,0.7)]' 
                  : 'bg-[#1e2029] group-hover:bg-[#282c38]'
              }`}
              style={{ height: `${bar.height}%` }}
            />
            <span className="text-[8px] font-bold text-slate-500 font-body-clean">
              {bar.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. QUICK ACTION PILL CAPSULE
 * Exact replica of the Amazon pill with green Buy button:
 * - Long black rounded capsule (rounded-full)
 * - Brand / Target icon on left
 * - Glowing green pill button on right
 */
export function QuickActionPill({ 
  icon = "a", 
  title = "SENTINEL-1A", 
  subtitle = "SAR Radar Recon • 693 km", 
  actionLabel = "Lock Orbit", 
  onClick = null 
}) {
  return (
    <div className="flex items-center justify-between p-2 pl-4 pr-2 rounded-full bg-[#0a0a0d] border border-white/[0.09] shadow-xl hover:border-[#B2F601]/40 transition-all select-none">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
          {icon}
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-bold tracking-wider">{title}</div>
          <div className="text-xs font-bold text-white font-body-clean">{subtitle}</div>
        </div>
      </div>

      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#B2F601] hover:bg-[#c4ff24] text-[#0a0a0d] text-xs font-bold font-body-clean shadow-[0_0_14px_rgba(178,246,1,0.4)] transition-all active:scale-95 cursor-pointer"
      >
        <Satellite className="w-3.5 h-3.5" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}

/**
 * 4. NOTIFICATION ALERT PILL
 * Exact replica of the Tesla notification pill with circular percentage ring:
 * - Black rounded capsule (rounded-full)
 * - Bell icon with red notification badge
 * - Circular percentage donut (%98) on right
 */
export function NotificationPill({ 
  title = "Microsoft M365 Auth", 
  subtitle = "Credential harvest spoof blocked", 
  percentage = "98" 
}) {
  return (
    <div className="flex items-center justify-between p-2 pl-4 pr-3 rounded-full bg-[#0a0a0d] border border-white/[0.09] shadow-xl select-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white">
            <Bell className="w-4 h-4" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FF3366] border border-[#0a0a0d] animate-pulse" />
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-bold tracking-wider">{title}</div>
          <div className="text-xs font-bold text-white font-body-clean">{subtitle}</div>
        </div>
      </div>

      {/* Circular Percentage Gauge (%73 / %98) */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-[#1e2029]"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-[#B2F601]"
            strokeDasharray="98, 100"
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
          />
        </svg>
        <span className="absolute text-[8px] font-bold text-white font-body-clean">%{percentage}</span>
      </div>
    </div>
  );
}

/**
 * 5. DYNAMIC ISLAND STATUS CAPSULE
 * Exact replica of the Spendings / ETH pill from reference:
 * - Rounded pill capsule (rounded-full)
 * - Clock / Nav indicator on left
 * - Dark black center pill capsule
 * - Link / Battery icons on right
 */
export function DynamicIslandStatusCapsule({ 
  time = "9:41", 
  label = "DEFCON 4 // NORMAL", 
  badge = "100%", 
  battery = "100" 
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-full bg-[#0a0a0d]/90 border border-white/[0.09] shadow-xl text-xs font-body-clean select-none">
      <div className="flex items-center gap-1.5 text-white font-bold pl-1">
        <span>{time}</span>
        <Compass className="w-3 h-3 text-[#B2F601]" />
      </div>

      {/* Center Black Island */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-white/10 mx-2 text-[11px]">
        <Shield className="w-3 h-3 text-[#B2F601]" />
        <span className="text-white font-semibold">{label}</span>
        <span className="text-[#B2F601] font-bold bg-[#B2F601]/15 px-1.5 py-0.2 rounded-full text-[9px]">{badge}</span>
      </div>

      <div className="flex items-center gap-2 text-slate-400 pr-1 text-[10px]">
        <span className="px-1.5 py-0.5 rounded-full bg-[#1e2029] text-white font-bold">{battery}</span>
      </div>
    </div>
  );
}
