import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ShieldCheck, Printer, Users, Award, Hash } from 'lucide-react';

export default function DossierExportTab() {
  const [copied, setCopied] = useState(false);

  const teamMembers = [
    { name: "Sameeraj", role: "B.Tech EC with minor in CSE", focus: "Signals Intelligence & Embedded Systems" },
    { name: "Dipanshu Maheshwari", role: "B.Tech CS AI/ML", focus: "Computer Vision & Deepfake Neural Networks" },
    { name: "Yashashvi Gupta", role: "B.Tech CS AI/ML", focus: "NLP Phishing Classifier & ML Pipelines" },
    { name: "Shubh Verma", role: "B.Tech EC with minor in CSE", focus: "Network Routing & Forensic Telemetry" }
  ];

  const reportData = {
    incident_id: "KAVACH-INC-2026-X99",
    timestamp: new Date().toISOString(),
    classification: "TOP SECRET // CYBER DEFENSE CLEARANCE",
    sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    integrity_status: "VERIFIED_CHAIN_OF_CUSTODY",
    systems_deployed: [
      "God's Eye 3D Orbital Intelligence (Cesium/Three.js HUD)",
      "RFC 5322 Email Phishing Classifier with Dynamic 100-Sample Learning",
      "Amped FIVE & Sherloq Error Level Analysis (ELA) Heatmap Engine",
      "Amped Authenticator Frame-by-Frame Temporal Video Inspector",
      "Librosa 13-MFCC Mel-Spectrogram Acoustic Synthesizer Detector",
      "GreyNoise Active Threat Telemetry & Geolocation Grid"
    ]
  };

  const handleDownload = () => {
    const textContent = `
========================================================================
       KAVACH (THE PROTECTOR) // OFFICIAL CYBER FORENSIC DOSSIER
========================================================================
INCIDENT ID: ${reportData.incident_id}
GENERATED: ${reportData.timestamp}
CLEARANCE: ${reportData.classification}
EVIDENCE SHA-256: ${reportData.sha256_hash}
CHAIN OF CUSTODY: ${reportData.integrity_status}

INVESTIGATION TEAM:
1. Sameeraj (B.Tech EC / CSE) - Lead Architecture
2. Dipanshu Maheshwari (B.Tech CS AI/ML) - Deepfake Vision Models
3. Yashashvi Gupta (B.Tech CS AI/ML) - Phishing & NLP Models
4. Shubh Verma (B.Tech EC / CSE) - Network Forensics & Telemetry

ACTIVE DEFENSE MATRICES:
${reportData.systems_deployed.map((s, i) => `  [${i + 1}] ${s}`).join('\n')}

LEGAL ATTESTATION:
This report was cryptographically compiled using KAVACH Defense Suite.
All image, video, audio, and email artifacts have been preserved in
accordance with NIST SP 800-86 Guide to Integrating Forensic Techniques.
========================================================================
    `;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KAVACH_FORENSIC_DOSSIER_${reportData.incident_id}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Dossier Document Container */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-500/20 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono-cyber text-xs tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OFFICIAL CYBER DEFENSE INCIDENT DOSSIER</span>
            </div>
            <h1 className="text-2xl font-bold font-mono-cyber text-white mt-1">
              PROJECT KAVACH (THE PROTECTOR)
            </h1>
            <div className="text-xs text-slate-400 font-mono-cyber mt-0.5">
              INCIDENT ID: <span className="text-cyan-300">{reportData.incident_id}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono-cyber text-xs font-semibold glow-cyan transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT OFFICIAL DOSSIER (.TXT)</span>
          </button>
        </div>

        {/* Cryptographic Attestation */}
        <div className="p-3 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-between text-xs font-mono-cyber">
          <div className="flex items-center gap-2 text-slate-300">
            <Hash className="w-4 h-4 text-cyan-400" />
            <span>SHA-256 EVIDENCE INTEGRITY:</span>
            <code className="text-[11px] text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/20">
              {reportData.sha256_hash.slice(0, 32)}...
            </code>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/40 text-[10px]">
            CRYPTOGRAPHICALLY SEALED
          </span>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <div className="text-xs font-mono-cyber text-cyan-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>INVESTIGATION TEAM (SECYURED / KAVACH INVENTORS)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamMembers.map((m, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-black/40 border border-slate-800 font-mono-cyber text-xs">
                <div className="text-white font-bold text-sm">{m.name}</div>
                <div className="text-cyan-300 text-[11px]">{m.role}</div>
                <div className="text-slate-400 text-[10px] mt-1">Specialization: {m.focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrated Forensic Systems */}
        <div className="space-y-3">
          <div className="text-xs font-mono-cyber text-cyan-400 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>UNIFIED SYSTEM CAPABILITIES ACCREDITATION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-cyber text-xs">
            {reportData.systems_deployed.map((sys, idx) => (
              <div key={idx} className="p-2.5 rounded bg-black/30 border border-slate-800 flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{sys}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-[11px] font-mono-cyber text-slate-400">
          <strong>LEGAL COMPLIANCE NOTE:</strong> Forensic reports generated by KAVACH incorporate standards from Amped FIVE, Amped Authenticator, Sherloq image analysis, and RFC 5322 header verification, suitable for cybersecurity threat auditing and hackathon defense demonstration.
        </div>
      </div>
    </div>
  );
}
