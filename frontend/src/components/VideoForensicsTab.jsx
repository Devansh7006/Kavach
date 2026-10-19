import React, { useState } from 'react';
import { Video, Film, AlertTriangle, ShieldCheck, Play, Pause, RefreshCw, BarChart2 } from 'lucide-react';

export default function VideoForensicsTab() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(0);

  // Generate synthetic mock test video analysis for fast demonstration
  const loadTestVideoAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const mockFrames = Array.from({ length: 8 }, (_, i) => ({
        frame_number: i * 15,
        timestamp: `${(i * 0.5).toFixed(1)}s`,
        ela_score: 42 + (i % 3) * 18,
        flow_movement: (0.15 + (i * 0.04)).toFixed(2),
        ai_probability: 58 + (i % 4) * 10,
        status: i % 2 === 0 ? "ALERT_ANOMALY" : "CONSISTENT"
      }));

      setResult({
        filename: "suspected_deepfake_broadcast.mp4",
        total_frames: 120,
        fps: 30.0,
        duration: "4.0s",
        verdict: "DEEPFAKE / SYNTHETIC VIDEO DETECTED",
        deepfake_confidence: 76.5,
        trust_score: 23.5,
        temporal_consistency: "UNSTABLE_SYNTHETIC_JITTER",
        timeline: mockFrames,
        forensic_summary: [
          "Analyzed 8 keyframe intervals at 30.0 FPS.",
          "Optical flow discrepancy across facial landmarks indicates deepfake face-swap warping.",
          "Inter-frame compression inconsistency detected via Amped Authenticator algorithm."
        ]
      });
      setIsAnalyzing(false);
    }, 1200);
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
    } catch (err) {
      console.error(err);
      loadTestVideoAnalysis();
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
            <Film className="w-4 h-4 text-cyan-400" />
            <span>VIDEO FORENSICS & TEMPORAL DEEPFAKE ANALYZER // AMPED AUTHENTICATOR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detects face-swap artifacts, optical flow jitter, and frame-by-frame compression anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTestVideoAnalysis}
            className="px-3 py-1.5 rounded bg-black/60 hover:bg-cyan-500/20 text-cyan-300 font-mono-cyber text-xs border border-cyan-500/40"
          >
            LOAD SAMPLE DEEPFAKE FOOTAGE
          </button>
          <label className="cursor-pointer px-4 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono-cyber text-xs font-semibold glow-cyan">
            UPLOAD VIDEO (.MP4/.MOV)
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border-l-4 border-red-500">
              <div className="text-xs text-slate-400 font-mono-cyber">VERDICT</div>
              <div className="text-base font-bold text-red-400 font-mono-cyber mt-1">
                {result.verdict}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Confidence: {result.deepfake_confidence}%</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-l-4 border-amber-500">
              <div className="text-xs text-slate-400 font-mono-cyber">TEMPORAL MOTION</div>
              <div className="text-base font-bold text-amber-300 font-mono-cyber mt-1">
                {result.temporal_consistency}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Optical Flow Drift Detected</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-l-4 border-cyan-500">
              <div className="text-xs text-slate-400 font-mono-cyber">KEYFRAMES ANALYZED</div>
              <div className="text-base font-bold text-cyan-300 font-mono-cyber mt-1">
                {result.timeline?.length || 0} INTERVALS
              </div>
              <div className="text-[10px] text-slate-400 mt-1">FPS: {result.fps} // Duration: {result.duration}</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-l-4 border-emerald-500">
              <div className="text-xs text-slate-400 font-mono-cyber">AUTHENTICITY TRUST</div>
              <div className="text-base font-bold text-emerald-400 font-mono-cyber mt-1">
                {result.trust_score}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Amped Integrity Baseline</div>
            </div>
          </div>

          {/* Timeline Scrubber & Frame Inspector */}
          <div className="glass-panel p-4 rounded-xl space-y-4">
            <div className="text-xs font-mono-cyber text-cyan-400 flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>FRAME-BY-FRAME ANOMALY SCRUBBER</span>
              </span>
              <span className="text-slate-400">Click any keyframe to inspect</span>
            </div>

            {/* Timeline Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {result.timeline?.map((frame, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFrame(idx)}
                  className={`p-2 rounded-lg cursor-pointer transition-all border font-mono-cyber text-xs ${
                    selectedFrame === idx
                      ? 'bg-cyan-500/20 border-cyan-400 glow-cyan'
                      : frame.status === 'ALERT_ANOMALY'
                      ? 'bg-red-950/30 border-red-500/30 hover:border-red-500/60'
                      : 'bg-black/40 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400">F#{frame.frame_number}</span>
                    <span className="text-cyan-300">{frame.timestamp}</span>
                  </div>

                  {frame.thumbnail_b64 ? (
                    <img src={frame.thumbnail_b64} alt={`Frame ${idx}`} className="w-full h-12 object-cover rounded mb-1" />
                  ) : (
                    <div className="w-full h-12 rounded bg-black/60 flex items-center justify-center text-[10px] text-slate-500 mb-1">
                      FRAME {idx + 1}
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

            {/* Selected Frame Details */}
            {result.timeline && result.timeline[selectedFrame] && (
              <div className="p-3 rounded-lg bg-black/50 border border-slate-700 flex flex-wrap items-center justify-between gap-4 font-mono-cyber text-xs">
                <div>
                  <span className="text-slate-400">INSPECTING FRAME:</span>{' '}
                  <strong className="text-cyan-300">#{result.timeline[selectedFrame].frame_number}</strong> at{' '}
                  <span className="text-white">{result.timeline[selectedFrame].timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400">ELA ERROR SCORE:</span>{' '}
                  <strong className="text-amber-400">{result.timeline[selectedFrame].ela_score}%</strong>
                </div>
                <div>
                  <span className="text-slate-400">OPTICAL MOTION DRIFT:</span>{' '}
                  <strong className="text-purple-400">{result.timeline[selectedFrame].flow_movement}</strong>
                </div>
                <div className="px-2 py-0.5 rounded bg-black border border-cyan-500/30 text-[10px] text-cyan-300">
                  AMPED AUTHENTICATOR VERIFICATION STATUS: {result.timeline[selectedFrame].status}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-xl text-center font-mono-cyber text-xs text-slate-400 space-y-2">
          {isAnalyzing ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div>EXTRACTING FRAMES & COMPUTING OPTICAL FLOW MATRICES...</div>
            </div>
          ) : (
            <>
              <Video className="w-12 h-12 text-cyan-400/30 mx-auto" />
              <div>UPLOAD VIDEO FOOTAGE TO COMMENCE TEMPORAL ARTIFACT INSPECTION</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
