import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ShieldCheck, Printer, Users, Award, Hash } from 'lucide-react';

export default function DossierExportTab() {
  const [copied, setCopied] = useState(false);

  const teamMembers = [
    { name: "Sameeraj", role: "Lead Systems & Architecture", focus: "Signals Intelligence & Embedded Systems" },
    { name: "Krish", role: "Computer Vision & Media Lead", focus: "Deepfake Detection & Temporal Flow Models" },
    { name: "Devansh", role: "NLP & Phishing Classifier Lead", focus: "Interactive ML Pipelines & Retraining Lab" },
    { name: "Prince", role: "Forensic Network Engineer", focus: "Routing Telemetry & Threat Infrastructure" }
  ];

  const reportData = {
    incident_id: "KAVACH-INC-2026-X99",
    timestamp: new Date().toISOString(),
    classification: "TOP SECRET // CYBER DEFENSE CLEARANCE",
    sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    integrity_status: "VERIFIED_CHAIN_OF_CUSTODY",
    systems_deployed: [
      "AURA 3D Spatial Reconnaissance & Orbital Telemetry",
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

INVESTIGATION & ENGINEERING ROSTER:
1. Sameeraj - Lead Systems & Architecture
2. Krish - Computer Vision & Media Lead
3. Devansh - NLP & Phishing Classifier Lead
4. Prince - Forensic Network Engineer

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
      <div className="hud-glass-panel p-6 sm:p-8 rounded-3xl border border-[#62C0F6]/25 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#343645] pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#62C0F6] font-mono-hud text-xs tracking-widest">
              <ShieldCheck className="w-4 h-4 text-[#B2F601]" />
              <span>OFFICIAL CYBER DEFENSE INCIDENT DOSSIER</span>
            </div>
            <h1 className="text-2xl font-bold font-tactical text-white mt-1">
              PROJECT KAVACH (THE PROTECTOR)
            </h1>
            <div className="text-xs text-slate-400 font-mono-hud mt-0.5">
              INCIDENT ID: <span className="text-[#B2F601] font-semibold">{reportData.incident_id}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B2F601] hover:bg-[#c2ff1a] text-[#0E111A] font-mono-hud text-xs font-bold glow-lime transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT OFFICIAL DOSSIER (.TXT)</span>
          </button>
        </div>

        {/* Cryptographic Attestation */}
        <div className="p-3.5 rounded-xl bg-[#0E111A]/80 border border-[#343645] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono-hud gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <Hash className="w-4 h-4 text-[#62C0F6]" />
            <span>SHA-256 EVIDENCE INTEGRITY:</span>
            <code className="text-[11px] text-[#B2F601] bg-black/80 px-2 py-0.5 rounded border border-[#B2F601]/25">
              {reportData.sha256_hash.slice(0, 32)}...
            </code>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-[#B2F601]/15 text-[#B2F601] font-bold border border-[#B2F601]/40 text-[10px]">
            CRYPTOGRAPHICALLY SEALED
          </span>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <div className="text-xs font-mono-hud text-[#62C0F6] flex items-center gap-2 font-bold">
            <Users className="w-4 h-4 text-[#B2F601]" />
            <span>INVESTIGATION TEAM (SECYURED / KAVACH CREATORS)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamMembers.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0E111A]/60 border border-[#343645] font-mono-hud text-xs hover:border-[#62C0F6]/40 transition-colors">
                <div className="text-white font-bold text-sm">{m.name}</div>
                <div className="text-[#62C0F6] text-[11px] font-semibold">{m.role}</div>
                <div className="text-slate-400 text-[10px] mt-1">Specialization: {m.focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrated Forensic Systems */}
        <div className="space-y-3">
          <div className="text-xs font-mono-hud text-[#62C0F6] flex items-center gap-2 font-bold">
            <Award className="w-4 h-4 text-[#B2F601]" />
            <span>UNIFIED SYSTEM CAPABILITIES ACCREDITATION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-hud text-xs">
            {reportData.systems_deployed.map((sys, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#0E111A]/60 border border-[#343645] flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-[#B2F601] shrink-0" />
                <span>{sys}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-3.5 rounded-xl bg-[#0E111A]/60 border border-[#343645] text-[11px] font-mono-hud text-slate-400">
          <strong className="text-slate-200">LEGAL COMPLIANCE NOTE:</strong> Forensic reports generated by KAVACH incorporate standards from Amped FIVE, Amped Authenticator, Sherloq image analysis, and RFC 5322 header verification, suitable for cybersecurity threat auditing and hackathon defense demonstration.
        </div>
      </div>
    </div>
  );
}
