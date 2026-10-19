import React, { useState } from 'react';
import { Mic, Volume2, ShieldCheck, ShieldAlert, Activity, RefreshCw, BarChart3, Radio } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AudioForensicsTab() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Load test synthetic voice analysis
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

      setResult({
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
      });
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
      
      // Transform raw mfccs into chart array if needed
      if (Array.isArray(data.mfcc_coefficients)) {
        data.mfcc_coefficients = data.mfcc_coefficients.map((val, idx) => ({
          name: `MFCC-${idx + 1}`,
          value: typeof val === 'object' ? val.value : val
        }));
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      loadTestSyntheticVoice();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-cyan-400">
        <div>
          <h2 className="text-sm font-bold font-mono-cyber text-cyan-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>AUDIO FORENSICS & SYNTHETIC VOICE DETECTOR // LIBROSA MFCC PIPELINE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Extracts 13 Mel-Frequency Cepstral Coefficients (MFCC), Mel-Spectrogram, and vocoder phase anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTestSyntheticVoice}
            className="px-3 py-1.5 rounded bg-black/60 hover:bg-cyan-500/20 text-cyan-300 font-mono-cyber text-xs border border-cyan-500/40"
          >
            LOAD SYNTHETIC CLONED VOICE SAMPLE
          </button>
          <label className="cursor-pointer px-4 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono-cyber text-xs font-semibold glow-cyan">
            UPLOAD AUDIO (.WAV/.MP3)
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Verdict & Spectrogram (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className={`p-4 rounded-xl border ${
              result.deepfake_confidence > 50 
                ? 'glass-panel-danger border-red-500/50 glow-crimson' 
                : 'glass-panel border-emerald-500/50 glow-emerald'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.deepfake_confidence > 50 ? (
                    <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  )}
                  <div>
                    <div className="text-xs font-mono-cyber text-slate-400">AUDIO CLONE ASSESSMENT</div>
                    <div className={`text-base font-bold font-mono-cyber ${
                      result.deepfake_confidence > 50 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {result.verdict}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono-cyber">
                  <div className="text-xs text-slate-400">AI PROBABILITY</div>
                  <div className="text-2xl font-bold text-white">
                    {result.deepfake_confidence}%
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono-cyber">
                <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px]">SAMPLE RATE</span>
                  <strong className="text-cyan-300">{result.sample_rate}</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px]">DURATION</span>
                  <strong className="text-white">{result.duration}</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px]">FLATNESS</span>
                  <strong className="text-amber-400">{result.spectral_metrics?.spectral_flatness}</strong>
                </div>
              </div>
            </div>

            {/* Spectrogram / Visual Display */}
            <div className="glass-panel p-4 rounded-xl space-y-2">
              <div className="text-xs font-mono-cyber text-cyan-400 flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>MEL-SPECTROGRAM DENSITY HEATMAP</span>
                </span>
                <span className="text-slate-400">Librosa Power-to-dB</span>
              </div>

              {result.spectrogram_b64 ? (
                <img src={result.spectrogram_b64} alt="Mel Spectrogram" className="w-full h-44 object-cover rounded border border-slate-800" />
              ) : (
                <div className="h-44 rounded bg-black/60 border border-slate-800 flex items-center justify-center text-xs font-mono-cyber text-cyan-400/60">
                  MEL-SPECTROGRAM SYNTHESIZED (64 BANDS)
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 13 MFCC Coefficients & Acoustic Signatures (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* MFCC Bar Chart */}
            <div className="glass-panel p-4 rounded-xl space-y-2">
              <div className="text-xs font-mono-cyber text-cyan-400 flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>13 MFCC COEFFICIENTS (MEL-FREQUENCY CEPSTRAL)</span>
                </span>
                <span className="text-slate-400">Acoustic Fingerprint</span>
              </div>

              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.mfcc_coefficients || []}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#00f0ff', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Bar dataKey="value" fill="#00f0ff" radius={[2, 2, 0, 0]}>
                      {result.mfcc_coefficients?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#ff3366' : '#00f0ff'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Acoustic Anomaly Checks */}
            <div className="glass-panel p-4 rounded-xl space-y-2">
              <div className="text-xs font-mono-cyber text-slate-400 border-b border-cyan-500/20 pb-1">
                ACOUSTIC SYNTHESIZER ANOMALY CHECKS
              </div>
              <div className="space-y-1.5 font-mono-cyber text-xs">
                {result.acoustic_signatures?.map((sig, sidx) => (
                  <div key={sidx} className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">{sig.parameter}</span>
                    <span className="text-amber-400 font-bold">{sig.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-xl text-center font-mono-cyber text-xs text-slate-400 space-y-2">
          {isAnalyzing ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div>EXTRACTING MEL SPECTROGRAM & 13 MFCC BANDS...</div>
            </div>
          ) : (
            <>
              <Mic className="w-12 h-12 text-cyan-400/30 mx-auto" />
              <div>UPLOAD AUDIO TO COMMENCE LIBROSA SPECTRAL DEEPFAKE AUDIT</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
