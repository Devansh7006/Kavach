import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, Eye, ShieldAlert, ShieldCheck, Camera, 
  RefreshCw, Layers, Info, MapPin, ZoomIn, FileText
} from 'lucide-react';

export default function ImageForensicsTab({ onTargetSelected, onVerdictChange }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeView, setActiveView] = useState('ORIGINAL'); // 'ORIGINAL' | 'ELA' | 'NOISE'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const loadSyntheticSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, '#101c30');
    grad.addColorStop(1, '#070b14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    ctx.fillStyle = '#ff3366';
    ctx.fillRect(110, 110, 180, 180);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('SPLICED ADOBE LAYER', 120, 205);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'spliced_evidence.jpg', { type: 'image/jpeg' });
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      analyzeFile(file);
    }, 'image/jpeg', 0.92);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      analyzeFile(file);
    }
  };

  const analyzeFile = async (file) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/image-forensics', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data);

      if (onVerdictChange) {
        onVerdictChange(data.is_ai_generated ? 'THREAT' : 'LEGIT');
      }

      if (onTargetSelected && data.target_geo) {
        onTargetSelected(data.target_geo);
      }
    } catch (err) {
      console.error(err);
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
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>IMAGE FORENSICS & DEEPFAKE ENGINE // AMPED FIVE & SHERLOQ CORE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Applies Error Level Analysis (ELA), Laplacian high-frequency PRNU noise variance, and EXIF software prompt detection.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadSyntheticSample}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 font-mono-code text-xs border border-white/[0.12] transition-all"
          >
            SAMPLE TAMPERED TEST
          </button>
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono-code text-xs font-semibold shadow-lg transition-all">
            UPLOAD EVIDENCE
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Forensic Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Viewport (7 cols) */}
        <div className="lg:col-span-7 glass-surface p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
            <div className="text-xs font-mono-code text-cyan-300 flex items-center gap-2 font-bold">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>FORENSIC SPECTRUM INSPECTOR</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex rounded-xl bg-black/60 p-1 border border-white/[0.1] font-mono-code text-xs">
              {['ORIGINAL', 'ELA', 'NOISE'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveView(mode)}
                  disabled={!result && mode !== 'ORIGINAL'}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeView === mode 
                      ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-500/30 shadow' 
                      : 'text-slate-400 hover:text-white'
                  } disabled:opacity-30`}
                >
                  {mode === 'ELA' ? 'ELA HEATMAP' : mode === 'NOISE' ? 'SHERLOQ NOISE' : 'ORIGINAL'}
                </button>
              ))}
            </div>
          </div>

          {/* Active Image Canvas */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/[0.08] bg-black/80 flex items-center justify-center">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/85 z-20 flex flex-col items-center justify-center gap-2 font-mono-code text-cyan-300">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span>COMPUTING ERROR LEVEL ANALYSIS & LAPLACIAN KERNEL...</span>
              </div>
            )}

            {previewUrl ? (
              <img
                src={
                  activeView === 'ELA' && result?.visual_artifacts?.ela_heatmap_b64
                    ? result.visual_artifacts.ela_heatmap_b64
                    : activeView === 'NOISE' && result?.visual_artifacts?.noise_frequency_b64
                    ? result.visual_artifacts.noise_frequency_b64
                    : previewUrl
                }
                alt="Evidence"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center p-8 space-y-2 text-slate-500 font-mono-code text-xs">
                <ImageIcon className="w-12 h-12 mx-auto opacity-30" />
                <div>DRAG & DROP EVIDENCE IMAGE OR CLICK UPLOAD</div>
              </div>
            )}

            {previewUrl && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 border border-white/[0.12] text-[10px] font-mono-code text-cyan-300 backdrop-blur-md">
                SPECTRUM: {activeView} // {result?.resolution || 'ACTIVE'}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] font-mono-code text-slate-400 flex items-center justify-between">
            <span>
              {activeView === 'ELA' && "Error Level Analysis: highlights pixel discrepancy against standard JPEG quantization."}
              {activeView === 'NOISE' && "Sherloq Noise Filter: extracts high-frequency camera sensor noise to isolate generative diffusion."}
              {activeView === 'ORIGINAL' && "Original unprocessed evidentiary frame."}
            </span>
            <span className="text-cyan-400 font-bold">AMPED FIVE CERTIFIED</span>
          </div>
        </div>

        {/* Right Column: Deep Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="img-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Verdict Card */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  result.is_ai_generated 
                    ? 'glass-surface-crimson' 
                    : 'glass-surface-emerald'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      {result.is_ai_generated ? (
                        <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,51,102,0.4)]">
                          <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                          <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-mono-code text-slate-400">MEDIA INTEGRITY</div>
                        <div className={`text-base font-bold font-display ${
                          result.is_ai_generated ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {result.verdict}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono-code">
                      <div className="text-xs text-slate-400">SYNTHETIC RISK</div>
                      <div className="text-2xl font-bold font-display text-white">
                        {result.deepfake_confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-mono-code">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                      <span className="text-slate-400 block text-[10px]">ELA DISCREPANCY</span>
                      <strong className="text-amber-300 font-display text-base">{result.ela_alteration_score}%</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                      <span className="text-slate-400 block text-[10px]">SENSOR NOISE VARIANCE</span>
                      <strong className="text-purple-300 font-display text-base">{result.noise_variance}</strong>
                    </div>
                  </div>
                </div>

                {/* EXIF Metadata Card */}
                <div className="glass-surface p-4 rounded-2xl space-y-2.5">
                  <div className="text-xs font-mono-code text-cyan-300 flex items-center justify-between border-b border-white/[0.08] pb-2 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>EXIF & EMBEDDED METADATA</span>
                    </span>
                    <span className="text-slate-400 text-[11px] font-normal">{result.exif_metadata.raw_tag_count} Tags</span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono-code">
                    <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                      <span className="text-slate-400">CAMERA MODEL:</span>
                      <span className="text-white">{result.exif_metadata.camera_make} {result.exif_metadata.camera_model}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                      <span className="text-slate-400">SOFTWARE / SIGNATURE:</span>
                      <span className={result.exif_metadata.ai_signatures_detected.length ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {result.exif_metadata.software}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                      <span className="text-slate-400">ISO / SHUTTER SPEED:</span>
                      <span className="text-cyan-300">{result.exif_metadata.iso} // {result.exif_metadata.exposure_time}</span>
                    </div>

                    {result.exif_metadata.gps?.has_gps && (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>GPS: {result.exif_metadata.gps.latitude}, {result.exif_metadata.gps.longitude}</span>
                        </div>
                        <button
                          onClick={() => onTargetSelected && onTargetSelected(result.target_geo)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/40"
                        >
                          LOCK GOD'S EYE
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-surface p-10 rounded-2xl text-center font-mono-code text-xs text-slate-400 space-y-2">
                <Info className="w-8 h-8 text-cyan-400/30 mx-auto" />
                <div>SELECT AN IMAGE TO EXECUTE ELA & SHERLOQ NOISE EXTRACTION</div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
