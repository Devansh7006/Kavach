import React, { useState } from 'react';
import { 
  Terminal, Search, Filter, ShieldAlert, ShieldCheck, Download, 
  Trash2, ArrowUpRight, History, CheckCircle2, Clock, Activity, FileText
} from 'lucide-react';

export default function ForensicAuditHistory({ 
  auditLogs = [], 
  onClearLogs = null,
  currentTime = ""
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'THREAT' | 'LEGIT'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs based on category and search query
  const filteredLogs = auditLogs.filter(log => {
    // 1. Threat/Legit filter
    if (filterType === 'THREAT' && log.status !== 'THREAT') return false;
    if (filterType === 'LEGIT' && log.status !== 'LEGIT') return false;

    // 2. Search query filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.target?.toLowerCase().includes(q) ||
      log.verdict?.toLowerCase().includes(q) ||
      log.module?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q)
    );
  });

  const threatCount = auditLogs.filter(l => l.status === 'THREAT').length;
  const legitCount = auditLogs.filter(l => l.status === 'LEGIT').length;

  const handleExportAudit = () => {
    const textContent = `
========================================================================
       KAVACH DEFENSE // FORENSIC ANALYSIS & SEARCH AUDIT TRAIL
========================================================================
GENERATED: ${new Date().toISOString()}
TOTAL AUDIT EVENTS: ${auditLogs.length}
THREATS DETECTED: ${threatCount}
VERIFIED AUTHENTIC: ${legitCount}

CHRONOLOGICAL FORENSIC AUDIT LOG:
${auditLogs.map((l, i) => `[${i + 1}] ${l.timestamp} [${l.module}] [${l.action}]
    TARGET: ${l.target}
    VERDICT: ${l.verdict} (${l.status})
    DETAILS: ${l.details || 'N/A'}
`).join('\n')}
========================================================================
END OF AUDIT BUFFER
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KAVACH_FORENSIC_AUDIT_TRAIL_${Date.now()}.txt`;
    a.click();
  };

  const getModuleBadge = (mod) => {
    switch (mod) {
      case 'EMAIL':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'IMAGE':
        return 'bg-[#62C0F6]/15 text-[#62C0F6] border-[#62C0F6]/30';
      case 'VIDEO':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'AUDIO':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'HEX/VT':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'RECON':
        return 'bg-[#B2F601]/15 text-[#B2F601] border-[#B2F601]/30';
      default:
        return 'bg-white/10 text-slate-300 border-white/20';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl font-mono-hud text-xs space-y-3 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/[0.07] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-[#B2F601]">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold font-aveton tracking-wide">
                FORENSIC ANALYSIS & SEARCH HISTORY
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#B2F601]/15 text-[#B2F601] text-[10px] font-bold border border-[#B2F601]/30">
                {auditLogs.length} EVENTS RECORDED
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-body-clean">
              Real-time chronological buffer of all searched queries, analyzed files, and isolated payloads
            </div>
          </div>
        </div>

        {/* Right Top Info & Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] text-slate-400 hidden md:inline">
            UTC: {currentTime || new Date().toUTCString()}
          </span>
          <button
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer text-[10px] font-bold"
            title="Download full forensic audit log"
          >
            <Download className="w-3 h-3 text-[#62C0F6]" />
            <span>EXPORT LOG</span>
          </button>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1 rounded-xl bg-white/[0.05] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-all cursor-pointer"
              title="Clear log buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Sub-Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/[0.07] text-[10px]">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              filterType === 'ALL'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL AUDITS ({auditLogs.length})
          </button>
          <button
            onClick={() => setFilterType('THREAT')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
              filterType === 'THREAT'
                ? 'bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]/40 shadow-[0_0_10px_rgba(255,51,102,0.3)]'
                : 'text-slate-400 hover:text-[#FF3366]'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-[#FF3366]" />
            <span>THREATS ONLY ({threatCount})</span>
          </button>
          <button
            onClick={() => setFilterType('LEGIT')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
              filterType === 'LEGIT'
                ? 'bg-[#B2F601]/20 text-[#B2F601] border border-[#B2F601]/40 shadow-[0_0_10px_rgba(178,246,1,0.3)]'
                : 'text-slate-400 hover:text-[#B2F601]'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-[#B2F601]" />
            <span>AUTHENTIC ({legitCount})</span>
          </button>
        </div>

        {/* Search Within History Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search analyzed history..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#62C0F6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Chronological History Log Stream */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No analyzed history matches your current search or filter.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div 
              key={log.id || idx}
              className={`p-2.5 rounded-xl border transition-all text-[11px] ${
                log.status === 'THREAT'
                  ? 'bg-[#18090f]/70 border-[#FF3366]/30 hover:border-[#FF3366]/50'
                  : log.status === 'LEGIT'
                  ? 'bg-[#09150d]/70 border-[#B2F601]/30 hover:border-[#B2F601]/50'
                  : 'bg-black/50 border-white/[0.06] hover:border-white/15'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                {/* Left Cluster: Timestamp + Module Badge + Action + Target */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>

                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getModuleBadge(log.module)}`}>
                    {log.module}
                  </span>

                  <span className="text-[10px] text-slate-400 font-semibold">{log.action}:</span>

                  <span className="font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                    {log.target}
                  </span>
                </div>

                {/* Right Verdict Badge */}
                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    log.status === 'THREAT'
                      ? 'bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/40'
                      : log.status === 'LEGIT'
                      ? 'bg-[#B2F601]/20 text-[#B2F601] border-[#B2F601]/40'
                      : 'bg-[#62C0F6]/20 text-[#62C0F6] border-[#62C0F6]/40'
                  }`}>
                    {log.verdict}
                  </span>
                </div>
              </div>

              {/* Secondary Details Line */}
              {log.details && (
                <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 pl-1 border-l border-white/10">
                  <span className="text-[#62C0F6]">▶</span>
                  <span className="truncate">{log.details}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
