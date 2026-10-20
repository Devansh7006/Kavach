import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Radio, ShieldCheck, ShieldAlert, Activity, RefreshCw, BarChart3, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AudioForensicsTab({ onVerdictChange, onLogAudit }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
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
    const file = e.dataTransfer.files[0];
    if (file) processAudioFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processAudioFile(file);
  };

  const processAudioFile = async (file) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/audio-forensics', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (Array.isArray(data.mfcc_coefficients)) {
        data.mfcc_coefficients = data.mfcc_coefficients.map((val, idx) => ({
          name: `MFCC-${idx + 1}`,
          value: typeof val === 'object' ? val.value : val
        }));
      }
      data.is_ai_generated = data.deepfake_confidence > 50;
      setResult(data);
      if (onVerdictChange) onVerdictChange(data.is_ai_generated ? 'THREAT' : 'LEGIT');
      if (onLogAudit) {
        onLogAudit({
          module: "AUDIO",
          action: "ANALYZED",
          target: file.name,
          verdict: data.is_ai_generated ? "⚠️ AI VOICE CLONE (SYNTHETIC)" : "✅ AUTHENTIC HUMAN VOICE",
          status: data.is_ai_generated ? "THREAT" : "LEGIT",
          details: `Sample Rate: ${data.sample_rate || '16 kHz'} | Confidence: ${data.deepfake_confidence || 85}%`
        });
      }
    } catch (err) {
      console.error("Audio forensics processing error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetBuffer = () => {
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onVerdictChange) onVerdictChange('NEUTRAL');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-slate-200 font-body-clean"
    >
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="audio/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Top Banner */}
      <div className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold font-aveton text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#62C0F6]" />
            <span>AUDIO FORENSICS & SYNTHETIC VOICE DETECTOR // LIBROSA MFCC PIPELINE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Extracts 13 Mel-Frequency Cepstral Coefficients (MFCC), Mel-Spectrogram density, and neural vocoder phase anomalies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] text-[10px] font-mono-hud text-slate-300 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#B2F601] animate-pulse" />
            <span>VOICE TIMBRE PIPELINE ACTIVE</span>
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
            <span>BROWSE AUDIO</span>
          </button>
        </div>
      </div>

      {result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Verdict & Spectrogram (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* PROMINENT AI VERDICT CARD */}
            <div className={`p-5 rounded-[28px] border shadow-2xl transition-all ${
              result.is_ai_generated 
                ? 'bg-[#18090f] border-[#FF3366]/40 shadow-[0_0_25px_rgba(255,51,102,0.25)]' 
                : 'bg-[#09150d] border-[#B2F601]/40 shadow-[0_0_25px_rgba(178,246,1,0.25)]'
            }`}>
              {/* Top Explicit Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <span className="text-[10px] text-slate-400 font-mono-hud uppercase tracking-wider font-bold">
                  VOICE INTEGRITY AUDIT // AI VERDICT
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono-hud border ${
                  result.is_ai_generated
                    ? 'bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/40 animate-pulse'
                    : 'bg-[#B2F601]/20 text-[#B2F601] border-[#B2F601]/40'
                }`}>
                  {result.is_ai_generated ? "⚠️ AI-GENERATED (SYNTHETIC CLONE)" : "✅ NOT AI-GENERATED (AUTHENTIC)"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  {result.is_ai_generated ? (
                    <div className="w-12 h-12 rounded-2xl bg-[#FF3366]/20 border border-[#FF3366]/40 flex items-center justify-center text-[#FF3366] shadow-[0_0_20px_rgba(255,51,102,0.4)]">
                      <ShieldAlert className="w-6 h-6 animate-bounce" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#B2F601]/20 border border-[#B2F601]/40 flex items-center justify-center text-[#B2F601] shadow-[0_0_20px_rgba(178,246,1,0.4)]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono-hud uppercase font-bold">IS THIS AUDIO AI-GENERATED?</div>
                    <div className={`text-base sm:text-lg font-bold font-aveton ${
                      result.is_ai_generated ? 'text-[#FF3366]' : 'text-[#B2F601]'
                    }`}>
                      {result.is_ai_generated ? "YES — AI-GENERATED VOICE CLONE" : "NO — NOT AI-GENERATED (AUTHENTIC)"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Tested against ElevenLabs, VALL-E, XTTS, Bark, RVC
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono-hud">
                  <div className="text-[10px] text-slate-400">AI PROBABILITY</div>
                  <div className="text-2xl font-extrabold font-aveton text-white">
                    {result.deepfake_confidence}%
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-mono-hud">
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/[0.08]">
                  <span className="text-slate-400 block text-[10px]">SAMPLING RATE</span>
                  <strong className="text-amber-300 font-aveton text-base">{result.sample_rate}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/[0.08]">
                  <span className="text-slate-400 block text-[10px]">RECORDING DURATION</span>
                  <strong className="text-purple-300 font-aveton text-base">{result.duration}</strong>
                </div>
              </div>
            </div>

            {/* Acoustic Signatures Table */}
            <div className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-2.5">
              <div className="text-xs font-mono-hud text-[#62C0F6] flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#62C0F6]" />
                  <span>NEURAL VOCODER & PHASE SIGNATURES</span>
                </span>
                <span className="text-slate-400 text-[11px] font-normal">Librosa 0.10</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono-hud">
                {result.acoustic_signatures?.map((sig, sidx) => (
                  <div key={sidx} className="flex justify-between items-center p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-300">{sig.parameter}</span>
                    <span className={`font-bold ${
                      result.is_ai_generated ? 'text-[#FF3366]' : 'text-[#B2F601]'
                    }`}>
                      {sig.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 13-Band MFCC Spectrum (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-[28px] bg-[#0a0a0d] border border-white/[0.09] shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold font-mono-hud text-xs text-[#62C0F6]">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#62C0F6]" />
                  <span>13-BAND MEL-FREQUENCY CEPSTRAL COEFFICIENTS (MFCC)</span>
                </span>
                <span className="text-slate-400 text-[10px]">Acoustic Formants</span>
              </div>

              {/* Chart */}
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.mfcc_coefficients} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0d', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }} 
                      labelStyle={{ color: '#62C0F6' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.mfcc_coefficients?.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value > 0 ? (result.is_ai_generated ? '#FF3366' : '#B2F601') : '#62C0F6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Spectral Metrics Grid */}
              {result.spectral_metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06] text-center text-xs font-mono-hud">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 text-[9px] block">SPECTRAL FLATNESS</span>
                    <strong className="text-white text-xs">{result.spectral_metrics.spectral_flatness}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 text-[9px] block">CENTROID HZ</span>
                    <strong className="text-[#62C0F6] text-xs">{result.spectral_metrics.spectral_centroid_hz} Hz</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 text-[9px] block">ROLLOFF HZ</span>
                    <strong className="text-purple-300 text-xs">{result.spectral_metrics.spectral_rolloff_hz} Hz</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400 text-[9px] block">ZERO CROSSING</span>
                    <strong className="text-[#B2F601] text-xs">{result.spectral_metrics.zero_crossing_rate}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-16 rounded-[28px] border-2 transition-all cursor-pointer text-center font-mono-hud text-xs text-slate-400 space-y-4 group select-none ${
            isDragging 
              ? 'border-[#B2F601] bg-[#B2F601]/10 shadow-[0_0_30px_rgba(178,246,1,0.3)]' 
              : 'bg-[#0a0a0d] border-white/[0.1] hover:border-[#62C0F6]/60 hover:bg-[#070b14] shadow-2xl'
          }`}
          title="Click or touch to browse audio recording, or drag and drop audio file here"
        >
          {isAnalyzing ? (
            <div className="space-y-3">
              <RefreshCw className="w-12 h-12 text-[#62C0F6] animate-spin mx-auto" />
              <div className="text-white font-bold text-sm">EXTRACTING 13-BAND MFCC COEFFICIENTS & PHASE HARMONICS...</div>
              <div className="text-slate-400">Analyzing voice timbre against neural vocoder cloning models</div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto group-hover:border-[#62C0F6]/60 group-hover:bg-[#62C0F6]/10 group-hover:scale-105 transition-all">
                <Mic className="w-10 h-10 text-slate-500 group-hover:text-[#62C0F6] transition-colors" />
              </div>

              <div className="space-y-1.5">
                <div className="text-base font-extrabold text-white group-hover:text-[#62C0F6] transition-colors font-aveton">
                  CLICK / TOUCH TO BROWSE AUDIO OR DRAG & DROP HERE
                </div>
                <div className="text-xs text-slate-400 max-w-md mx-auto">
                  Supports WAV, MP3, OGG, FLAC, M4A, AAC • Instant Librosa 13-Band MFCC Neural Voice Clone Verification
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] text-xs font-bold text-slate-300 border border-white/15 group-hover:border-[#62C0F6]/50 group-hover:text-white transition-all shadow-md">
                  <Upload className="w-3.5 h-3.5 text-[#62C0F6]" />
                  <span>Tap or Click to Select Audio</span>
                </span>
                <span className="text-[10px] text-slate-500">or drop audio file anywhere</span>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
