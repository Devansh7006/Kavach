import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldAlert, ShieldCheck, FileCode, Hash, Binary, 
  Search, Copy, Check, RefreshCw, AlertTriangle, Terminal, 
  FileSearch, Download, ExternalLink, Cpu, Eye, BookOpen, Layers, Upload
} from 'lucide-react';

export default function BinaryHexInspectorTab({ onVerdictChange, onLogAudit }) {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [hexFilter, setHexFilter] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      analyzeFile(droppedFile);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resetBuffer = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onVerdictChange) onVerdictChange('NEUTRAL');
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    analyzeFile(uploadedFile);
  };

  const analyzeFile = async (targetFile) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', targetFile);

    try {
      const res = await fetch('/api/forensics/hex-analysis', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data);

      if (onVerdictChange) {
        onVerdictChange(data.is_tampered ? 'THREAT' : 'LEGIT');
      }

      if (onLogAudit) {
        onLogAudit({
          module: "HEX/BINARY",
          action: "INSPECTED",
          target: targetFile.name,
          verdict: data.is_tampered ? "⚠️ MALICIOUS / STEGANOGRAPHY DETECTED" : "✅ CLEAN FILE INTEGRITY VERIFIED",
          status: data.is_tampered ? "THREAT" : "LEGIT",
          details: `SHA-256: ${data.hashes?.sha256?.slice(0, 16)}... | Magic Bytes: ${data.magic_bytes} | Consensus Ratio: ${data.engine_ratio}`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHexSearchChange = (val) => {
    setHexFilter(val);
    if (val.trim().length >= 2 && onLogAudit) {
      onLogAudit({
        module: "HEX/BINARY",
        action: "SEARCH QUERY",
        target: `Hex Query: "${val}"`,
        verdict: `BYTE PATTERN FILTER APPLIED`,
        status: "INFO",
        details: `Inspecting 512-byte raw hex stream & ASCII translation`
      });
    }
  };

  const filteredHexRows = result?.hex_preview?.filter(row => {
    if (!hexFilter) return true;
    const q = hexFilter.toLowerCase();
    return row.hex.toLowerCase().includes(q) || row.ascii.toLowerCase().includes(q) || row.offset.toLowerCase().includes(q);
  }) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-slate-200 font-body-clean"
    >
      {/* 1. FORENSIC EXPERT PLAYBOOK HERO BANNER */}
      <div className="p-6 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#62C0F6]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B2F601]/15 text-[#B2F601] font-mono-hud text-[10px] font-bold border border-[#B2F601]/30">
                NIST SP 800-86 COMPLIANT
              </span>
              <span className="text-xs font-mono-hud text-[#62C0F6] uppercase font-bold">
                KAVACH FILE INTEGRITY & HEX SENTINEL
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-aveton text-white tracking-tight flex items-center gap-2">
              <Binary className="w-6 h-6 text-[#62C0F6]" />
              <span>FORENSIC EXPERT PLAYBOOK // FILE INTEGRITY & HEX ANALYSIS</span>
            </h2>
          </div>

          {/* Production Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] text-[10px] font-mono-hud text-slate-300 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#B2F601] animate-pulse" />
              <span>LIVE INGESTION ACTIVE</span>
            </span>

            {result && (
              <button
                onClick={resetBuffer}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white font-mono-hud text-xs border border-white/[0.12] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>CLEAR BUFFER</span>
              </button>
            )}

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#62C0F6] hover:bg-[#7ed2ff] text-[#0a0a0d] font-bold text-xs shadow-[0_0_15px_rgba(98,192,246,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>BROWSE EVIDENCE</span>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>
        </div>

        {/* The 3 Core Pillars of File Forensics (User Specification) */}
        <div className="mt-4 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#62C0F6] font-bold font-mono-hud">
              <Hash className="w-4 h-4 text-[#62C0F6]" />
              <span>CRYPTOGRAPHIC HASHES</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Generating unique digital fingerprints (MD5, SHA-1, SHA-256). If even one single bit or pixel is altered, the entire hash cascades completely, establishing court-admissible proof of tampering.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#B2F601] font-bold font-mono-hud">
              <FileCode className="w-4 h-4 text-[#B2F601]" />
              <span>HEX & STEGANOGRAPHY</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Inspecting raw binary machine code to locate hidden payloads, appended archives, or encrypted exfiltration text hidden after End-Of-File (EOF) markers like JPEG <code className="text-[#B2F601]">FF D9</code> or PNG <code className="text-[#B2F601]">IEND</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#FF3366] font-bold font-mono-hud">
              <FileSearch className="w-4 h-4 text-[#FF3366]" />
              <span>FILE CARVING & MALWARE</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Detects polyglot files (e.g. executable header disguised with media extension), evaluates unallocated slack sectors, and verifies whether evidence contains embedded executable anomalies.
            </p>
          </div>
        </div>
      </div>

      {/* 2. KAVACH FILE INTEGRITY SCAN RESULTS */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="vt-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* KAVACH DETECTION RATIO BAR & BANNER */}
            <div className={`p-6 rounded-[28px] border shadow-2xl transition-all ${
              result.is_tampered 
                ? 'bg-[#18090f] border-[#FF3366]/40 shadow-[0_0_30px_rgba(255,51,102,0.25)]' 
                : 'bg-[#09150d] border-[#B2F601]/40 shadow-[0_0_30px_rgba(178,246,1,0.25)]'
            }`}>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left Verdict Pill */}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl ${
                    result.is_tampered 
                      ? 'bg-[#FF3366]/20 border-[#FF3366] text-[#FF3366]' 
                      : 'bg-[#B2F601]/20 border-[#B2F601] text-[#B2F601]'
                  }`}>
                    {result.is_tampered ? (
                      <ShieldAlert className="w-8 h-8 animate-bounce" />
                    ) : (
                      <ShieldCheck className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-mono-hud text-slate-400 uppercase tracking-wider font-bold">
                      KAVACH FILE INTEGRITY AUDIT // TAMPERING & SLACK INSPECTION
                    </div>
                    <div className={`text-xl sm:text-2xl font-extrabold font-aveton mt-0.5 ${
                      result.is_tampered ? 'text-[#FF3366]' : 'text-[#B2F601]'
                    }`}>
                      {result.is_tampered ? "TAMPERED / MALICIOUS INJECTION DETECTED" : "AUTHENTIC / ZERO TAMPERING DETECTED"}
                    </div>
                    <div className="text-xs text-slate-300 font-mono-hud mt-1 flex flex-wrap items-center gap-3">
                      <span>EVIDENCE: <strong className="text-white">{result.filename}</strong></span>
                      <span>SIZE: <strong className="text-white">{result.file_size_bytes} bytes ({(result.file_size_bytes / 1024).toFixed(2)} KB)</strong></span>
                      <span className={result.is_tampered ? 'text-[#FF3366] font-bold' : 'text-[#B2F601] font-bold'}>
                        {result.is_tampered ? "⚠️ INJECTED TRAILING BYTES" : "✅ 100% CLEAN INTACT BYTES"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Security Consensus Detection Gauge */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/60 border border-white/10 self-stretch sm:self-auto justify-between sm:justify-start">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#1e2029]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={result.is_tampered ? 'text-[#FF3366]' : 'text-[#B2F601]'}
                        strokeDasharray={result.is_tampered ? '35, 100' : '0, 100'}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute text-xs font-mono-hud font-extrabold text-white">
                      {result.engine_ratio}
                    </span>
                  </div>

                  <div className="font-mono-hud text-xs pr-3">
                    <div className="text-slate-400 text-[10px]">HEURISTIC ENGINES</div>
                    <div className="text-sm font-bold text-white">
                      {result.is_tampered ? 'ANOMALIES DETECTED' : 'CRYPTOGRAPHICALLY VERIFIED'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {result.is_tampered ? 'Steganography / Injected Payload' : 'Zero Threat Signatures'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Alerts Callout */}
              {result.embedded_payloads && result.embedded_payloads.length > 0 && (
                <div className="mt-4 p-3.5 rounded-2xl bg-[#FF3366]/10 border border-[#FF3366]/30 space-y-1.5 text-xs font-mono-hud">
                  <div className="text-[#FF3366] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>STEGANOGRAPHY & CARVING ANOMALIES DETECTED:</span>
                  </div>
                  {result.embedded_payloads.map((payload, pidx) => (
                    <div key={pidx} className="text-rose-200 pl-6 text-[11px]">
                      • {payload}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TWO COLUMN INSPECTOR: Hashes & Playbook / Raw Hex Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Hashes & Signatures (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Cryptographic Hashes Card */}
                <div className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                    <div className="flex items-center gap-2 text-white font-bold text-xs font-mono-hud">
                      <Hash className="w-4 h-4 text-[#62C0F6]" />
                      <span>CRYPTOGRAPHIC FINGERPRINTS</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#62C0F6]/15 text-[#62C0F6] font-mono-hud font-bold">
                      SHA-256 SEALED
                    </span>
                  </div>

                  <div className="space-y-2.5 font-mono-hud text-xs">
                    {/* MD5 */}
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-slate-500 block text-[9px]">MD5 DIGEST</span>
                        <span className="text-[#62C0F6] font-semibold select-all text-[11px]">{result.hashes.md5}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.hashes.md5, 'md5')}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300"
                        title="Copy MD5"
                      >
                        {copiedKey === 'md5' ? <Check className="w-3.5 h-3.5 text-[#B2F601]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* SHA-1 */}
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-slate-500 block text-[9px]">SHA-1 DIGEST</span>
                        <span className="text-slate-300 font-semibold select-all text-[11px]">{result.hashes.sha1}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.hashes.sha1, 'sha1')}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300"
                        title="Copy SHA-1"
                      >
                        {copiedKey === 'sha1' ? <Check className="w-3.5 h-3.5 text-[#B2F601]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* SHA-256 */}
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-slate-500 block text-[9px]">SHA-256 PRIMARY FORENSIC FINGERPRINT</span>
                        <span className="text-[#B2F601] font-bold select-all text-[10px] break-all">{result.hashes.sha256}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.hashes.sha256, 'sha256')}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 shrink-0"
                        title="Copy SHA-256"
                      >
                        {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-[#B2F601]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* SSDEEP */}
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-slate-500 block text-[9px]">SSDEEP FUZZY CORRELATION HASH</span>
                        <span className="text-purple-300 font-semibold select-all text-[10px]">{result.hashes.ssdeep_fuzzy}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.hashes.ssdeep_fuzzy, 'ssdeep')}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 shrink-0"
                        title="Copy SSDEEP"
                      >
                        {copiedKey === 'ssdeep' ? <Check className="w-3.5 h-3.5 text-[#B2F601]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Magic Bytes & File Carving Header Check */}
                <div className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                    <div className="flex items-center gap-2 text-white font-bold text-xs font-mono-hud">
                      <Binary className="w-4 h-4 text-[#B2F601]" />
                      <span>MAGIC BYTES & FILE CARVING</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono-hud">HEADER VALIDATION</span>
                  </div>

                  <div className="space-y-2 font-mono-hud text-xs">
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] flex justify-between items-center">
                      <span className="text-slate-400">FIRST 8 BYTES:</span>
                      <span className="text-[#62C0F6] font-bold">{result.magic_bytes}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] flex justify-between items-center">
                      <span className="text-slate-400">MIME IDENTIFICATION:</span>
                      <span className="text-white font-semibold">{result.file_type}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] flex justify-between items-center">
                      <span className="text-slate-400">CARVING STATUS:</span>
                      <span className={result.is_tampered ? 'text-[#FF3366] font-bold' : 'text-[#B2F601] font-bold'}>
                        {result.is_tampered ? 'SUSPICIOUS TRAILING DATA' : 'NO FRAGMENTATION'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Forensic Playbook Checklist Card */}
                <div className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[#B2F601] font-bold text-xs font-mono-hud">
                    <BookOpen className="w-4 h-4 text-[#B2F601]" />
                    <span>FORENSIC EXPERT PLAYBOOK NOTES</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300 font-mono-hud">
                    {result.playbook_notes.map((note, nidx) => (
                      <div key={nidx} className="flex items-start gap-2 p-1.5 rounded-lg bg-black/40 border border-white/[0.04]">
                        <span className="text-[#B2F601] font-bold">✓</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Raw Hex Viewer (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2.5 border-b border-white/[0.08] gap-3">
                    <div className="flex items-center gap-2 text-white font-bold text-xs font-mono-hud">
                      <FileCode className="w-4 h-4 text-[#62C0F6]" />
                      <span>RAW BINARY HEX DUMP (FIRST 512 BYTES)</span>
                    </div>

                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search byte hex or ASCII..."
                        value={hexFilter}
                        onChange={(e) => handleHexSearchChange(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs font-mono-hud text-white placeholder-slate-500 focus:outline-none focus:border-[#62C0F6]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 text-[10px] font-mono-hud text-slate-400 border-b border-white/[0.06] pb-1 px-2 select-none">
                    <span className="col-span-2">OFFSET</span>
                    <span className="col-span-7">00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span>
                    <span className="col-span-3 text-right">ASCII DECODE</span>
                  </div>

                  <div className="max-h-[460px] overflow-y-auto font-mono-hud text-[11px] space-y-0.5 pr-1 select-text">
                    {filteredHexRows.map((row, ridx) => {
                      const isHeaderRow = ridx === 0;
                      return (
                        <div
                          key={ridx}
                          className={`grid grid-cols-12 items-center p-1 px-2 rounded-lg transition-colors ${
                            isHeaderRow 
                              ? 'bg-[#62C0F6]/10 text-white font-bold' 
                              : ridx % 2 === 0 ? 'bg-black/40' : 'bg-black/20'
                          } hover:bg-white/[0.06]`}
                        >
                          <span className="col-span-2 text-slate-500 text-[10px] font-semibold">{row.offset}</span>
                          <span className={`col-span-7 font-mono tracking-wider ${
                            isHeaderRow ? 'text-[#62C0F6]' : 'text-slate-300'
                          }`}>
                            {row.hex}
                          </span>
                          <span className="col-span-3 text-right text-amber-300 font-mono tracking-wider truncate">
                            {row.ascii}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono-hud text-slate-400 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#62C0F6]" />
                        <span>Header Magic Bytes</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>ASCII Printables</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <span>Null/Unprintable (.)</span>
                      </span>
                    </div>
                    <span>OFFSET FORMAT: HEX 32-BIT</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-16 rounded-[28px] border-2 transition-all cursor-pointer text-center space-y-4 font-mono-hud group select-none ${
              isDragging 
                ? 'border-[#B2F601] bg-[#B2F601]/10 shadow-[0_0_30px_rgba(178,246,1,0.3)]' 
                : 'bg-[#0a0a0d] border-white/[0.1] hover:border-[#62C0F6]/60 hover:bg-[#070b14] shadow-2xl'
            }`}
            title="Click or touch to browse file, or drag and drop file here"
          >
            {isAnalyzing ? (
              <div className="space-y-3">
                <RefreshCw className="w-12 h-12 text-[#62C0F6] animate-spin mx-auto" />
                <div className="text-white font-bold text-sm">COMPUTING CRYPTOGRAPHIC HASHES & CARVING FILE SLACK...</div>
                <div className="text-xs text-slate-400">Extracting MD5, SHA-256, magic byte headers, and trailing EOF markers</div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto group-hover:border-[#62C0F6]/60 group-hover:bg-[#62C0F6]/10 group-hover:scale-105 transition-all">
                  <FileCode className="w-10 h-10 text-slate-500 group-hover:text-[#62C0F6] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-base font-extrabold text-white group-hover:text-[#62C0F6] transition-colors font-aveton">
                    CLICK / TOUCH TO BROWSE EVIDENCE OR DRAG & DROP HERE
                  </div>
                  <div className="text-xs text-slate-400 max-w-md mx-auto">
                    Upload any image, video, document, archive, or suspicious binary to execute NIST SP 800-86 cryptographic & hex integrity analysis.
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] text-xs font-bold text-slate-300 border border-white/15 group-hover:border-[#62C0F6]/50 group-hover:text-white transition-all shadow-md">
                    <Upload className="w-3.5 h-3.5 text-[#62C0F6]" />
                    <span>Tap or Click to Select File</span>
                  </span>
                  <span className="text-[10px] text-slate-500">or drop evidence file anywhere</span>
                </div>
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
