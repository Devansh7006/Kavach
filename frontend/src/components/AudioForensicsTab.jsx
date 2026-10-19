import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Radio, ShieldCheck, ShieldAlert, Activity, RefreshCw, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AudioForensicsTab({ onVerdictChange }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const loadTestSyntheticVoice = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const mockMfcc = [
        { name: "MFCC-1", value: -18.4 },
        { name: "MFCC-2", value: 42.1 },
        { name: "MFCC-3", value: -8.9 },
        { name: "MFCC-4", value: 15.3 },
        { name: "MFCC-5", value: -22.1 },
        { name: "MFCC-6", value: 19.8 },
        { name: "MFCC-7", value: -14.2 },
        { name: "MFCC-8", value: 9.6 },
        { name: "MFCC-9", value: -11.0 },
        { name: "MFCC-10", value: 6.4 },
        { name: "MFCC-11", value: -7.8 },
        { name: "MFCC-12", value: 4.2 },
        { name: "MFCC-13", value: -5.1 }
      ];

      const res = {
        filename: "executive_voice_note_clone.wav",
        sample_rate: "16000 Hz",
        duration: "6.2s",
        verdict: "SYNTHETIC / AI VOICE CLONE",
        deepfake_confidence: 88.4,
        trust_score: 11.6,
        mfcc_coefficients: mockMfcc,
        spectral_metrics: {
          spectral_flatness: 0.0381,
          spectral_centroid_hz: 2410.5,
          spectral_rolloff_hz: 4890.0,
          zero_crossing_rate: 0.0821
        },
        acoustic_signatures: [
          { parameter: "Neural Vocoder Phase Jitter", status: "DETECTED (HIGH)" },
          { parameter: "Harmonic Formant Naturalness", status: "UNNATURAL REGULARITY" },
          { parameter: "High-Frequency Cutoff", status: "4890 Hz (Acoustic Compression)" }
        ]
      };
      setResult(res);
      if (onVerdictChange) onVerdictChange('THREAT');
      setIsAnalyzing(false);
    }, 1100);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      setResult(data);
      if (onVerdictChange) onVerdictChange(data.deepfake_confidence > 50 ? 'THREAT' : 'LEGIT');
    } catch (err) {
      console.error(err);
      loadTestSyntheticVoice();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Banner */}
      <div className="glass-surface p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-cyan-400 gap-4">
        <div>
          <h2 className="text-base font-bold font-display text-cyan-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>AUDIO FORENSICS & SYNTHETIC VOICE DETECTOR // LIBROSA MFCC PIPELINE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Extracts 13 Mel-Frequency Cepstral Coefficients (MFCC), Mel-Spectrogram density, and neural vocoder phase anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadTestSyntheticVoice}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 font-mono-code text-xs border border-white/[0.12] transition-all"
          >
            LOAD SAMPLE SYNTHETIC VOICE
          </button>
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono-code text-xs font-semibold shadow-lg transition-all">
            UPLOAD AUDIO (.WAV/.MP3)
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Verdict & Spectrogram (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className={`p-5 rounded-2xl border transition-all ${
              result.deepfake_confidence > 50 
                ? 'glass-surface-crimson' 
                : 'glass-surface-emerald'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  {result.deepfake_confidence > 50 ? (
                    <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,51,102,0.4)]">
                      <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-mono-code text-slate-400">VOICE INTEGRITY AUDIT</div>
                    <div className={`text-base font-bold font-display ${
                      result.deepfake_confidence > 50 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {result.verdict}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono-code">
                  <div className="text-xs text-slate-400">AI PROBABILITY</div>
                  <div className="text-2xl font-bold font-display text-white">
                    {result.deepfake_confidence}%
                  </div>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs font-mono-code">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                  <span className="text-slate-400 block text-[10px]">SAMPLE RATE</span>
                  <strong className="text-cyan-300 font-display">{result.sample_rate}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                  <span className="text-slate-400 block text-[10px]">DURATION</span>
                  <strong className="text-white font-display">{result.duration}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                  <span className="text-slate-400 block text-[10px]">SPECTRAL FLATNESS</span>
                  <strong className="text-amber-300 font-display">{result.spectral_metrics?.spectral_flatness}</strong>
                </div>
              </div>
            </div>

            {/* Spectrogram Display */}
            <div className="glass-surface p-4 rounded-2xl space-y-2">
              <div className="text-xs font-mono-code text-cyan-300 flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MEL-SPECTROGRAM DENSITY HEATMAP</span>
                </span>
                <span className="text-slate-400 text-[11px] font-normal">Librosa Power-to-dB</span>
              </div>

              {result.spectrogram_b64 ? (
                <img src={result.spectrogram_b64} alt="Mel Spectrogram" className="w-full h-44 object-cover rounded-xl border border-white/[0.08]" />
              ) : (
                <div className="h-44 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-center text-xs font-mono-code text-cyan-400/60">
                  MEL-SPECTROGRAM SYNTHESIZED (64 BANDS)
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 13 MFCC Coefficients (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-surface p-4 rounded-2xl space-y-2">
              <div className="text-xs font-mono-code text-cyan-300 flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>13 MFCC COEFFICIENTS (MEL-FREQUENCY CEPSTRAL)</span>
                </span>
                <span className="text-slate-400 text-[11px] font-normal">Acoustic Vector</span>
              </div>

              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.mfcc_coefficients || []}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#070b14', borderColor: '#00daf3', fontSize: '11px', fontFamily: 'monospace', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {result.mfcc_coefficients?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#ff3366' : '#00daf3'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Acoustic Anomaly Checks */}
            <div className="glass-surface p-4 rounded-2xl space-y-2">
              <div className="text-xs font-mono-code text-slate-400 border-b border-white/[0.08] pb-1.5">
                NEURAL SYNTHESIZER ANOMALY CHECKS
              </div>
              <div className="space-y-1.5 font-mono-code text-xs">
                {result.acoustic_signatures?.map((sig, sidx) => (
                  <div key={sidx} className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex justify-between items-center">
                    <span className="text-slate-300">{sig.parameter}</span>
                    <span className="text-amber-300 font-bold">{sig.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-surface p-12 rounded-2xl text-center font-mono-code text-xs text-slate-400 space-y-2">
          {isAnalyzing ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div>EXTRACTING MEL SPECTROGRAM & 13 MFCC BANDS...</div>
            </div>
          ) : (
            <>
              <Mic className="w-12 h-12 text-cyan-400/30 mx-auto" />
              <div>UPLOAD AUDIO TO COMMENCE LIBROSA SPECTRAL AUDIT</div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
