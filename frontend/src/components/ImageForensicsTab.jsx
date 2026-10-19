import React, { useState } from 'react';
import { 
  Image as ImageIcon, Eye, ShieldAlert, ShieldCheck, Flame, Sliders, 
  MapPin, Camera, Info, RefreshCw, ZoomIn, Layers, AlertCircle
} from 'lucide-react';

export default function ImageForensicsTab({ onTargetSelected }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeView, setActiveView] = useState('ORIGINAL'); // 'ORIGINAL' | 'ELA' | 'NOISE'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Generate sample canvas image if user wants quick test without uploading
  const loadSyntheticSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Draw synthetic gradient and spliced block
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, '#1a365d');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Synthetic spliced object
    ctx.fillStyle = '#ff3366';
    ctx.fillRect(120, 120, 160, 160);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText('SPLICED ARTIFACT', 130, 205);

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

      // Auto-target God's eye if GPS is found
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
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-cyan-400">
        <div>
          <h2 className="text-sm font-bold font-mono-cyber text-cyan-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>IMAGE FORENSICS & DEEPFAKE ENGINE // AMPED FIVE & SHERLOQ CORE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Applies Error Level Analysis (ELA), Laplacian high-frequency noise variance, and EXIF software prompt detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSyntheticSample}
            className="px-3 py-1.5 rounded bg-black/60 hover:bg-cyan-500/20 text-cyan-300 font-mono-cyber text-xs border border-cyan-500/40"
          >
            LOAD SAMPLE TEST SPLICING
          </button>
          <label className="cursor-pointer px-4 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono-cyber text-xs font-semibold glow-cyan">
            UPLOAD EVIDENCE IMAGE
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Forensic Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Viewport: Multi-Spectral Heatmap Inspector (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="text-xs font-mono-cyber text-cyan-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>FORENSIC SPECTRUM INSPECTOR</span>
            </div>

            {/* View Mode Toggle Tabs */}
            <div className="flex rounded bg-black/50 p-1 border border-slate-700 font-mono-cyber text-xs">
              <button
                onClick={() => setActiveView('ORIGINAL')}
                className={`px-3 py-1 rounded transition-all ${
                  activeView === 'ORIGINAL' ? 'bg-cyan-500/30 text-cyan-200 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ORIGINAL
              </button>
              <button
                onClick={() => setActiveView('ELA')}
                disabled={!result}
                className={`px-3 py-1 rounded transition-all ${
                  activeView === 'ELA' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                } disabled:opacity-30`}
              >
                ELA HEATMAP
              </button>
              <button
                onClick={() => setActiveView('NOISE')}
                disabled={!result}
                className={`px-3 py-1 rounded transition-all ${
                  activeView === 'NOISE' ? 'bg-purple-500/30 text-purple-300 font-bold' : 'text-slate-400 hover:text-white'
                } disabled:opacity-30`}
              >
                SHERLOQ NOISE
              </button>
            </div>
          </div>

          {/* Active Image Display */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-black/80 flex items-center justify-center">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/75 z-20 flex flex-col items-center justify-center gap-2 font-mono-cyber text-cyan-300">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span>COMPUTING MULTI-LAYER COMPRESSION DIFFERENTIALS...</span>
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
                alt="Forensic Evidence"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center p-8 space-y-2 text-slate-500 font-mono-cyber text-xs">
                <ImageIcon className="w-12 h-12 mx-auto opacity-30" />
                <div>DRAG & DROP EVIDENCE IMAGE OR CLICK UPLOAD</div>
              </div>
            )}

            {/* Tactical Watermark HUD */}
            {previewUrl && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-cyan-500/30 text-[10px] font-mono-cyber text-cyan-300">
                MODE: {activeView} // {result?.resolution || 'ACTIVE'}
              </div>
            )}
          </div>

          {/* Legend Description */}
          <div className="p-2.5 rounded bg-black/40 border border-slate-800 text-[11px] font-mono-cyber text-slate-400 flex items-center justify-between">
            <span>
              {activeView === 'ELA' && "ELA highlights compression anomalies: bright yellow/purple spots indicate altered pixels."}
              {activeView === 'NOISE' && "Sherloq Noise Analysis: isolates high-frequency PRNU camera sensor vs synthetic smoothing."}
              {activeView === 'ORIGINAL' && "Original ingested image stream with zero color modification."}
            </span>
            <span className="text-cyan-400">AMPED FIVE CERTIFIED</span>
          </div>
        </div>

        {/* Right Column: Forensic Breakdown & EXIF Metadata (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div className={`p-4 rounded-xl border ${
                result.is_ai_generated 
                  ? 'glass-panel-danger border-red-500/50 glow-crimson' 
                  : 'glass-panel border-emerald-500/50 glow-emerald'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.is_ai_generated ? (
                      <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    )}
                    <div>
                      <div className="text-xs font-mono-cyber text-slate-400">MEDIA INTEGRITY</div>
                      <div className={`text-base font-bold font-mono-cyber ${
                        result.is_ai_generated ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {result.verdict}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono-cyber">
                    <div className="text-xs text-slate-400">SYNTHETIC RISK</div>
                    <div className="text-2xl font-bold text-white">
                      {result.deepfake_confidence}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-mono-cyber">
                  <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">ELA DISCREPANCY</span>
                    <strong className="text-amber-400">{result.ela_alteration_score}%</strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">NOISE VARIANCE</span>
                    <strong className="text-purple-400">{result.noise_variance}</strong>
                  </div>
                </div>
              </div>

              {/* EXIF Metadata Card */}
              <div className="glass-panel p-4 rounded-xl space-y-2">
                <div className="text-xs font-mono-cyber text-cyan-400 flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>EXIF & EMBEDDED METADATA</span>
                  </span>
                  <span className="text-slate-400">{result.exif_metadata.raw_tag_count} Tags</span>
                </div>

                <div className="space-y-1.5 text-xs font-mono-cyber">
                  <div className="flex justify-between p-1.5 rounded bg-black/30 border border-slate-800">
                    <span className="text-slate-400">CAMERA MODEL:</span>
                    <span className="text-white">{result.exif_metadata.camera_make} {result.exif_metadata.camera_model}</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-black/30 border border-slate-800">
                    <span className="text-slate-400">SOFTWARE / GENERATOR:</span>
                    <span className={result.exif_metadata.ai_signatures_detected.length ? 'text-red-400 font-bold' : 'text-slate-200'}>
                      {result.exif_metadata.software}
                    </span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-black/30 border border-slate-800">
                    <span className="text-slate-400">ISO / SHUTTER:</span>
                    <span className="text-cyan-300">{result.exif_metadata.iso} // {result.exif_metadata.exposure_time}</span>
                  </div>

                  {/* GPS Geotag Lock */}
                  {result.exif_metadata.gps?.has_gps && (
                    <div className="mt-2 p-2 rounded bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>GPS: {result.exif_metadata.gps.latitude}, {result.exif_metadata.gps.longitude}</span>
                      </div>
                      <button
                        onClick={() => onTargetSelected && onTargetSelected(result.target_geo)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/50"
                      >
                        LOCK IN GOD'S EYE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Forensic Indicators List */}
              <div className="glass-panel p-4 rounded-xl space-y-2">
                <div className="text-xs font-mono-cyber text-slate-400 border-b border-cyan-500/20 pb-1">
                  SECURITY ANOMALY CHECKS
                </div>
                <div className="space-y-1">
                  {result.forensic_indicators?.map((ind, i) => (
                    <div key={i} className="text-xs font-mono-cyber p-1.5 rounded bg-black/30 flex justify-between items-center">
                      <div>
                        <div className="text-white">{ind.tool}</div>
                        <div className="text-[10px] text-slate-400">{ind.result}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ind.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/40' :
                        ind.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {ind.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-xl text-center font-mono-cyber text-xs text-slate-400 space-y-2">
              <Info className="w-8 h-8 text-cyan-400/30 mx-auto" />
              <div>SELECT AN IMAGE TO BEGIN ELA & NOISE EXTRACTION</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
