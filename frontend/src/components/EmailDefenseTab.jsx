import React, { useState } from 'react';
import { 
  Mail, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Server, 
  MapPin, CheckCircle2, XCircle, Database, RefreshCw, Cpu, Activity,
  Globe2, Lock, Terminal, BarChart3, ChevronRight, FileCode
} from 'lucide-react';

const PRESET_EMAILS = [
  {
    name: "Phishing: Microsoft 365 Password Expiry",
    sender: "security-alert@micros0ft-support-portal.com",
    subject: "URGENT: Microsoft 365 Account Deactivation Warning",
    body: "Dear Employee, Your Office 365 password expires in 2 hours. Failure to verify will result in immediate mailbox suspension. Click the secure link below to verify your corporate credentials immediately: http://185.220.101.45/auth/login.php?user=corp"
  },
  {
    name: "Phishing: CFO Emergency Wire Transfer (BEC)",
    sender: "cfo-office@finance-internal-desk.com",
    subject: "Action Required: Overdue Wire Transfer Payment of $14,820",
    body: "Hi Accounts Payable, Please see the attached invoice for vendor consulting services rendered last week. The CEO requested this wire transfer be settled before 5 PM today to avoid statutory interest penalties. View invoice: http://swift-bank-transfer.top/doc/invoice_9281.exe"
  },
  {
    name: "Legitimate: Sprint Planning & Tech Review",
    sender: "alex.rivera@technology-innovations.com",
    subject: "Engineering Sprint Planning - Q4 Roadmap Review",
    body: "Hi Team, Tomorrow at 10:00 AM PST we will meet for the bi-weekly sprint retrospective and backlog grooming. Please review the updated Jira tickets and ensure story points are finalized. Best, Alex Rivera, Lead Architect"
  }
];

export default function EmailDefenseTab({ onTargetSelected }) {
  const [sender, setSender] = useState(PRESET_EMAILS[0].sender);
  const [subject, setSubject] = useState(PRESET_EMAILS[0].subject);
  const [body, setBody] = useState(PRESET_EMAILS[0].body);
  const [rawEml, setRawEml] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [retrainSuccess, setRetrainSuccess] = useState(null);
  const [datasetMetrics, setDatasetMetrics] = useState(null);

  // Load baseline dataset metrics on mount
  React.useEffect(() => {
    fetch('/api/email/dataset')
      .then(r => r.json())
      .then(d => setDatasetMetrics(d))
      .catch(err => console.log('Dataset fetch fallback', err));
  }, []);

  const handlePresetSelect = (preset) => {
    setSender(preset.sender);
    setSubject(preset.subject);
    setBody(preset.body);
    setRawEml('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawEml(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setRetrainSuccess(null);

    const formData = new FormData();
    if (rawEml) {
      formData.append('raw_eml', rawEml);
    } else {
      formData.append('sender', sender);
      formData.append('subject', subject);
      formData.append('body', body);
    }

    try {
      const res = await fetch('/api/email/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setAnalysisResult(data);

      // Auto-target God's eye to origin IP
      if (onTargetSelected && data.parsed_metadata?.origin_geo) {
        onTargetSelected(data.parsed_metadata.origin_geo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetrainDynamic = async (label) => {
    if (!analysisResult) return;
    try {
      const res = await fetch('/api/email/retrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: analysisResult.parsed_metadata.subject,
          sender: analysisResult.parsed_metadata.sender,
          body: analysisResult.parsed_metadata.body,
          label: label,
          origin_ip: analysisResult.parsed_metadata.origin_ip,
          threat_type: "User Live Testing Feed"
        })
      });
      const data = await res.json();
      setRetrainSuccess(data);
      setDatasetMetrics(prev => ({
        ...prev,
        counts: { ...prev.counts, total: data.new_dataset_size },
        metrics: data.metrics
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: 100-Sample Baseline Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-3 rounded-lg border-l-4 border-cyan-400">
          <div className="text-slate-400 text-xs font-mono-cyber flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRAINED BASELINE</span>
          </div>
          <div className="text-xl font-bold text-white font-mono-cyber mt-1">
            {datasetMetrics?.counts?.total || 100} <span className="text-xs text-slate-400 font-normal">EMAILS</span>
          </div>
          <div className="text-[10px] text-cyan-300">50 Phishing // 50 Legitimate</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border-l-4 border-emerald-400">
          <div className="text-slate-400 text-xs font-mono-cyber flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>MODEL ACCURACY</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono-cyber mt-1">
            {datasetMetrics?.metrics?.accuracy || 100.0}%
          </div>
          <div className="text-[10px] text-slate-400">Random Forest Ensemble</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border-l-4 border-amber-400">
          <div className="text-slate-400 text-xs font-mono-cyber flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>PRECISION / RECALL</span>
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono-cyber mt-1">
            {datasetMetrics?.metrics?.precision || 100}% / {datasetMetrics?.metrics?.recall || 100}%
          </div>
          <div className="text-[10px] text-slate-400">F1 Score: {datasetMetrics?.metrics?.f1_score || 100}%</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border-l-4 border-purple-400">
          <div className="text-slate-400 text-xs font-mono-cyber flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-purple-400" />
            <span>GREYNOISE INTEL</span>
          </div>
          <div className="text-xl font-bold text-purple-300 font-mono-cyber mt-1">
            ACTIVE FEED
          </div>
          <div className="text-[10px] text-slate-400">IP Scanner & Tor Identification</div>
        </div>
      </div>

      {/* Main Grid: Input Form & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono-cyber text-sm font-semibold">
                <Mail className="w-4 h-4" />
                <span>EMAIL INGESTION CONSOLE</span>
              </div>
              <label className="cursor-pointer text-xs font-mono-cyber px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                UPLOAD .EML
                <input type="file" accept=".eml,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Presets */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-mono-cyber">QUICK ATTACK SCENARIOS:</label>
              <div className="flex flex-col gap-1.5">
                {PRESET_EMAILS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(p)}
                    className="text-left text-xs p-2 rounded bg-black/40 hover:bg-cyan-500/10 border border-slate-700/50 hover:border-cyan-400/40 text-slate-300 transition-all font-mono-cyber flex items-center justify-between"
                  >
                    <span className="truncate">{p.name}</span>
                    <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Form */}
            <div className="space-y-2 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 font-mono-cyber">SENDER ADDRESS / FROM:</label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-black/50 border border-slate-700 text-xs font-mono-cyber text-cyan-200 focus:border-cyan-400 outline-none"
                  placeholder="e.g. security-alert@micros0ft.com"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono-cyber">SUBJECT LINE:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-black/50 border border-slate-700 text-xs font-mono-cyber text-white focus:border-cyan-400 outline-none"
                  placeholder="e.g. URGENT: Verification Required"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono-cyber">BODY CONTENT / RFC PAYLOAD:</label>
                <textarea
                  rows={5}
                  value={rawEml ? rawEml.slice(0, 500) + '... (Raw .eml loaded)' : body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-black/50 border border-slate-700 text-xs font-mono-cyber text-slate-300 focus:border-cyan-400 outline-none"
                  placeholder="Paste email text or headers..."
                />
              </div>

              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="w-full mt-2 py-2.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono-cyber text-sm font-semibold tracking-wider transition-all flex items-center justify-center gap-2 glow-cyan disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>DEEP FORENSIC SCANNING...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-cyan-200" />
                    <span>EXECUTE KAVACH DEEP SCAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Results & Forensic Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div className={`p-4 rounded-xl border ${
                analysisResult.prediction.is_phishing 
                  ? 'glass-panel-danger border-red-500/50 glow-crimson' 
                  : 'glass-panel border-emerald-500/50 glow-emerald'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {analysisResult.prediction.is_phishing ? (
                      <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    )}
                    <div>
                      <div className="text-xs font-mono-cyber text-slate-400">ANALYSIS VERDICT</div>
                      <div className={`text-xl font-bold font-mono-cyber ${
                        analysisResult.prediction.is_phishing ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {analysisResult.prediction.prediction} DETECTED
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono-cyber">
                    <div className="text-xs text-slate-400">CONFIDENCE</div>
                    <div className="text-2xl font-bold text-white">
                      {analysisResult.prediction.confidence}%
                    </div>
                  </div>
                </div>

                {/* Risk & Trust Gauges */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-mono-cyber">
                  <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">TRUST SCORE</span>
                    <strong className={analysisResult.prediction.trust_score > 60 ? 'text-emerald-400' : 'text-red-400'}>
                      {analysisResult.prediction.trust_score}%
                    </strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">URGENCY COERCION</span>
                    <strong className="text-amber-400">
                      {analysisResult.prediction.urgency_score}%
                    </strong>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">AUTHORITY CLAIM</span>
                    <strong className="text-purple-400">
                      {analysisResult.prediction.authority_score}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Authentication & SPF/DKIM/DMARC */}
              <div className="glass-panel p-4 rounded-xl space-y-2">
                <div className="text-xs font-mono-cyber text-cyan-400 flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>AUTHENTICATION & REPUTATION HEADERS</span>
                  </span>
                  <span className="text-slate-400">RFC 5322 Standards</span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono-cyber text-xs">
                  <div className="p-2 rounded bg-black/40 border border-slate-800 flex items-center justify-between">
                    <span>SPF:</span>
                    <span className={`font-bold ${
                      analysisResult.parsed_metadata.spf_status === 'PASS' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {analysisResult.parsed_metadata.spf_status}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800 flex items-center justify-between">
                    <span>DKIM:</span>
                    <span className={`font-bold ${
                      analysisResult.parsed_metadata.dkim_status === 'PASS' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {analysisResult.parsed_metadata.dkim_status}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800 flex items-center justify-between">
                    <span>DMARC:</span>
                    <span className={`font-bold ${
                      analysisResult.parsed_metadata.dmarc_status === 'PASS' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {analysisResult.parsed_metadata.dmarc_status}
                    </span>
                  </div>
                </div>

                {/* GreyNoise Threat Intel */}
                {analysisResult.parsed_metadata.threat_intel && (
                  <div className="mt-2 p-2.5 rounded bg-black/50 border border-purple-500/30 text-xs font-mono-cyber">
                    <div className="text-purple-300 font-bold flex items-center justify-between">
                      <span>GREYNOISE INTEL: {analysisResult.parsed_metadata.threat_intel.actor}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-500/40">
                        {analysisResult.parsed_metadata.threat_intel.classification}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-1">
                      TAGS: {analysisResult.parsed_metadata.threat_intel.tags?.join(', ') || 'NONE'}
                    </div>
                  </div>
                )}
              </div>

              {/* Forensic Hop Traceroute (Mapped into God's Eye) */}
              <div className="glass-panel p-4 rounded-xl space-y-2">
                <div className="text-xs font-mono-cyber text-cyan-400 flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    <span>RECEIVED HOP TRACEROUTE (GEOSPATIAL ORIGIN)</span>
                  </span>
                  <span className="text-slate-400">{analysisResult.parsed_metadata.hops?.length || 1} Hops</span>
                </div>

                <div className="space-y-1.5">
                  {analysisResult.parsed_metadata.hops?.map((hop, hidx) => (
                    <div 
                      key={hidx} 
                      className="p-2 rounded bg-black/40 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between text-xs font-mono-cyber"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 flex items-center justify-center text-[10px] font-bold border border-cyan-500/40">
                          {hop.hop_index}
                        </span>
                        <div>
                          <div className="text-white font-semibold flex items-center gap-1.5">
                            <span>{hop.ip}</span>
                            <span className="text-slate-400 text-[10px]">({hop.geo?.city}, {hop.geo?.country})</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{hop.geo?.org}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onTargetSelected && onTargetSelected(hop.geo)}
                        className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-[10px] border border-cyan-500/40 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span>LOCK GOD'S EYE</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Retrain / User Testing Lab */}
              <div className="glass-panel p-4 rounded-xl space-y-3 border-l-4 border-amber-400">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-mono-cyber text-xs font-bold">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>DYNAMIC MODEL RETRAINING LAB</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono-cyber">Live Incremental Learning</span>
                </div>

                <p className="text-xs text-slate-300">
                  Did the AI classify this test email correctly? Feed this sample back into the 100-baseline dataset to retrain the Random Forest model dynamically:
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRetrainDynamic(1)}
                    className="flex-1 py-1.5 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono-cyber transition-all"
                  >
                    + ADD AS KNOWN PHISHING & RETRAIN
                  </button>
                  <button
                    onClick={() => handleRetrainDynamic(0)}
                    className="flex-1 py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-mono-cyber transition-all"
                  >
                    + ADD AS LEGITIMATE & RETRAIN
                  </button>
                </div>

                {retrainSuccess && (
                  <div className="p-2.5 rounded bg-amber-950/50 border border-amber-500/40 text-xs font-mono-cyber text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{retrainSuccess.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      New Dataset Size: <strong>{retrainSuccess.new_dataset_size}</strong> emails | 
                      Accuracy: <strong>{retrainSuccess.updated_accuracy}%</strong> 
                      (Delta: {retrainSuccess.accuracy_delta >= 0 ? `+${retrainSuccess.accuracy_delta}%` : `${retrainSuccess.accuracy_delta}%`})
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-xl text-center space-y-3">
              <Terminal className="w-10 h-10 text-cyan-400/40 mx-auto animate-pulse" />
              <div className="text-cyan-300 font-mono-cyber text-sm font-semibold">
                WAITING FOR EMAIL TELEMETRY
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select a preset scenario on the left or upload an .eml file to launch deep multi-layer header inspection, hop geocoding, and Scikit-Learn inference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
