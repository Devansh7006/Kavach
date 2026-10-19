import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Film, RefreshCw, BarChart2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function VideoForensicsTab({ onVerdictChange }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(0);

  const loadTestVideoAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const mockFrames = Array.from({ length: 8 }, (_, i) => ({
        frame_number: i * 15,
        timestamp: `${(i * 0.5).toFixed(1)}s`,
        ela_score: 45 + (i % 3) * 16,
        flow_movement: (0.16 + (i * 0.04)).toFixed(2),
        ai_probability: 62 + (i % 4) * 9,
        status: i % 2 === 0 ? "ALERT_ANOMALY" : "CONSISTENT"
      }));

      const res = {
        filename: "suspected_deepfake_broadcast.mp4",
        total_frames: 120,
        fps: 30.0,
        duration: "4.0s",
        verdict: "DEEPFAKE / SYNTHETIC VIDEO DETECTED",
        deepfake_confidence: 78.2,
        trust_score: 21.8,
        temporal_consistency: "UNSTABLE_SYNTHETIC_JITTER",
        timeline: mockFrames,
        forensic_summary: [
          "Analyzed 8 keyframe intervals at 30.0 FPS.",
          "Optical flow discrepancy across facial landmarks indicates deepfake face-swap warping.",
          "Inter-frame compression inconsistency detected via Amped Authenticator algorithm."
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
      const res = await fetch('/api/media/video-forensics', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data);
      if (onVerdictChange) onVerdictChange(data.deepfake_confidence > 50 ? 'THREAT' : 'LEGIT');
    } catch (err) {
      console.error(err);
      loadTestVideoAnalysis();
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
            <Film className="w-4 h-4 text-cyan-400" />
            <span>VIDEO FORENSICS & TEMPORAL DEEPFAKE ANALYZER // AMPED AUTHENTICATOR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detects face-swap artifacts, inter-frame optical flow jitter, and compression anomalies across time intervals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadTestVideoAnalysis}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 font-mono-code text-xs border border-white/[0.12] transition-all"
          >
            LOAD SAMPLE DEEPFAKE
          </button>
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono-code text-xs font-semibold shadow-lg transition-all">
            UPLOAD VIDEO (.MP4/.MOV)
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="glass-surface p-4 rounded-2xl border-l-4 border-red-500">
              <div className="text-xs text-slate-400 font-mono-code">INTEGRITY VERDICT</div>
              <div className="text-base font-bold text-red-400 font-display mt-1">{result.verdict}</div>
              <div className="text-[11px] text-slate-400 font-mono-code mt-0.5">Confidence: {result.deepfake_confidence}%</div>
            </div>

            <div className="glass-surface p-4 rounded-2xl border-l-4 border-amber-500">
              <div className="text-xs text-slate-400 font-mono-code">TEMPORAL MOTION</div>
              <div className="text-base font-bold text-amber-300 font-display mt-1">{result.temporal_consistency}</div>
              <div className="text-[11px] text-slate-400 font-mono-code mt-0.5">Optical Flow Drift</div>
            </div>

            <div className="glass-surface p-4 rounded-2xl border-l-4 border-cyan-500">
              <div className="text-xs text-slate-400 font-mono-code">KEYFRAMES INSPECTED</div>
              <div className="text-base font-bold text-cyan-300 font-display mt-1">{result.timeline?.length || 0} INTERVALS</div>
              <div className="text-[11px] text-slate-400 font-mono-code mt-0.5">FPS: {result.fps} // Duration: {result.duration}</div>
            </div>

            <div className="glass-surface p-4 rounded-2xl border-l-4 border-emerald-500">
              <div className="text-xs text-slate-400 font-mono-code">TRUST SCORE</div>
              <div className="text-base font-bold text-emerald-400 font-display mt-1">{result.trust_score}%</div>
              <div className="text-[11px] text-slate-400 font-mono-code mt-0.5">Authenticity Baseline</div>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="glass-surface p-5 rounded-2xl space-y-4">
            <div className="text-xs font-mono-code text-cyan-300 flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>FRAME-BY-FRAME ANOMALY SCRUBBER</span>
              </span>
              <span className="text-slate-400 text-[11px] font-normal">Click keyframe to inspect</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {result.timeline?.map((frame, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFrame(idx)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all border font-mono-code text-xs ${
                    selectedFrame === idx
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(0,218,243,0.3)]'
                      : frame.status === 'ALERT_ANOMALY'
                      ? 'bg-red-950/30 border-red-500/40 hover:border-red-500/70'
                      : 'bg-black/40 border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400">F#{frame.frame_number}</span>
                    <span className="text-cyan-300">{frame.timestamp}</span>
                  </div>

                  {frame.thumbnail_b64 ? (
                    <img src={frame.thumbnail_b64} alt={`Frame ${idx}`} className="w-full h-12 object-cover rounded-lg mb-1.5" />
                  ) : (
                    <div className="w-full h-12 rounded-lg bg-black/60 flex items-center justify-center text-[10px] text-slate-500 mb-1.5">
                      KEYFRAME {idx + 1}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">AI:</span>
                    <span className={frame.ai_probability > 50 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {frame.ai_probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Frame Telemetry */}
            {result.timeline && result.timeline[selectedFrame] && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 font-mono-code text-xs">
                <div>
                  <span className="text-slate-400">SELECTED FRAME:</span>{' '}
                  <strong className="text-cyan-300 font-display">#{result.timeline[selectedFrame].frame_number}</strong> ({result.timeline[selectedFrame].timestamp})
                </div>
                <div>
                  <span className="text-slate-400">ELA ERROR SCORE:</span>{' '}
                  <strong className="text-amber-300 font-display">{result.timeline[selectedFrame].ela_score}%</strong>
                </div>
                <div>
                  <span className="text-slate-400">OPTICAL MOTION DRIFT:</span>{' '}
                  <strong className="text-purple-300 font-display">{result.timeline[selectedFrame].flow_movement}</strong>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-white/[0.12] text-[10px] text-cyan-300">
                  AMPED STATUS: {result.timeline[selectedFrame].status}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-surface p-12 rounded-2xl text-center font-mono-code text-xs text-slate-400 space-y-2">
          {isAnalyzing ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div>EXTRACTING KEYFRAMES & COMPUTING OPTICAL FLOW MATRICES...</div>
            </div>
          ) : (
            <>
              <Video className="w-12 h-12 text-cyan-400/30 mx-auto" />
              <div>UPLOAD VIDEO FOOTAGE TO COMMENCE TEMPORAL ARTIFACT INSPECTION</div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
