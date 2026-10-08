import React, { useState } from 'react';
import { 
  FileText, 
  Pill, 
  Clock, 
  Calendar, 
  User, 
  Stethoscope, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Printer, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle, 
  HelpCircle,
  FileCheck2,
  Sparkles,
  ShieldAlert,
  Search
} from 'lucide-react';
import { PrescriptionScanResult, MedicationItem } from '../types/prescription';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speech';

interface PrescriptionSummaryViewProps {
  prescription: PrescriptionScanResult;
  onOpenOcrInspect: () => void;
  onNavigateToReminders?: (presetMedName?: string, presetDosage?: string) => void;
}

export const PrescriptionSummaryView: React.FC<PrescriptionSummaryViewProps> = ({
  prescription,
  onOpenOcrInspect,
  onNavigateToReminders,
}) => {
  const [speakingMedId, setSpeakingMedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleReadAloud = (med: MedicationItem) => {
    if (speakingMedId === med.id) {
      stopSpeaking();
      setSpeakingMedId(null);
      return;
    }

    setSpeakingMedId(med.id);
    const textToSpeak = `${med.medicineName}, dosage ${med.dosage}. Frequency: ${med.frequency}, ${med.timing}. Purpose: ${med.purposeExplanation}. Instructions: ${med.patientInstructions}`;

    speakText(textToSpeak, () => {
      setSpeakingMedId(null);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredMeds = prescription.medications.filter(
    (m) =>
      m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 print:p-0 print:space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Verified Digitization
            </span>
            <span className="text-xs text-slate-400">
              Scanned on {new Date(prescription.scannedAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Prescription Summary &amp; Patient Guide
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToReminders && (
            <button
              onClick={() => onNavigateToReminders()}
              className="px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Reminders &amp; Adherence</span>
            </button>
          )}

          <button
            onClick={onOpenOcrInspect}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>View Raw OCR</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Clinical Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 opacity-60"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Doctor & Clinic */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 flex items-center space-x-1">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Prescribing Physician</span>
            </span>
            <p className="text-base font-bold text-slate-900">
              {prescription.metadata.doctorName || 'Attending Physician'}
            </p>
            <p className="text-xs text-slate-600">
              {prescription.metadata.specialtyOrClinic || 'Outpatient Clinic'}
            </p>
            {prescription.metadata.date && (
              <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                <Calendar className="w-3 h-3" />
                <span>Date: {prescription.metadata.date}</span>
              </p>
            )}
          </div>

          {/* Patient Details */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1">
              <User className="w-3.5 h-3.5" />
              <span>Patient Information</span>
            </span>
            <p className="text-base font-bold text-slate-900">
              {prescription.metadata.patientName || 'Patient (Self)'}
            </p>
            <p className="text-xs text-slate-600">
              {prescription.metadata.patientAgeOrGender || 'Adult'}
            </p>
            {prescription.metadata.diagnosisOrCondition && (
              <div className="mt-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Diagnosis: </span>
                <span className="text-xs font-semibold text-slate-800">
                  {prescription.metadata.diagnosisOrCondition}
                </span>
              </div>
            )}
          </div>

          {/* Overall Advice & Quality Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                OCR Legibility Score
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-teal-50 text-teal-700 rounded-md border border-teal-200">
                {prescription.metadata.clarityScore}% Match
              </span>
            </div>
            {prescription.metadata.generalDoctorAdvice && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <strong className="text-slate-900 block mb-0.5">Doctor's Clinical Advice:</strong>
                {prescription.metadata.generalDoctorAdvice}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Plain English Simplification Card */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-4xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Medical Simplification (Plain English)
              </span>
            </div>
            <p className="text-base leading-relaxed text-slate-100 font-medium">
              "{prescription.simplifiedSummary}"
            </p>
          </div>
        </div>
      </div>

      {/* Safety Alerts (if any) */}
      {prescription.safetyAlerts && prescription.safetyAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Critical Medication Safety Alerts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prescription.safetyAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  alert.severity === 'high'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : alert.severity === 'medium'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alert.severity === 'high'
                      ? 'text-rose-600'
                      : alert.severity === 'medium'
                      ? 'text-amber-600'
                      : 'text-blue-600'
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">{alert.title}</span>
                    {alert.relatedMedication && (
                      <span className="text-[10px] font-semibold bg-white/70 px-1.5 py-0.2 rounded border border-current">
                        {alert.relatedMedication}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <span>Prescribed Medications ({prescription.medications.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Each medication with dosing schedules, meal instructions, and warnings
            </p>
          </div>

          {/* Search filter */}
          <div className="relative w-full sm:w-64 print:hidden">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicine or generic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Medication Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeds.map((med, index) => {
            const isSpeakingThis = speakingMedId === med.id;

            return (
              <div
                key={med.id || index}
                className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-5 shadow-xs transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Form tag, category, audio speak */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                        {med.form}
                      </span>
                      {med.category && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          • {med.category}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleReadAloud(med)}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                        isSpeakingThis
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                      title={isSpeakingThis ? 'Stop speaking' : 'Read instructions aloud'}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                          <span className="text-[10px]">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Read Aloud</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Medicine Name & Dosage */}
                  <div className="mt-2">
                    <div className="flex items-baseline space-x-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {med.medicineName}
                      </h3>
                      <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-2 py-0.2 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    {med.genericName && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Generic: {med.genericName}
                      </p>
                    )}
                  </div>

                  {/* Dosing & Timing Badges */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Frequency:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {med.frequency}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Food / Timing:
                      </span>
                      <span className="font-semibold text-teal-800">
                        {med.timing}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Dosing Pill indicators */}
                  {med.scheduledTimes && med.scheduledTimes.length > 0 && (
                    <div className="mt-2.5 flex items-center space-x-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-400">Times:</span>
                      {med.scheduledTimes.map((time, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-mono font-semibold"
                        >
                          ⏰ {time}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400">
                        ({med.duration})
                      </span>
                    </div>
                  )}

                  {/* Plain Language Purpose */}
                  <div className="mt-3 p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs">
                    <span className="font-bold text-teal-900 block mb-0.5">
                      Why you are taking this:
                    </span>
                    <p className="text-teal-800 leading-relaxed">
                      {med.purposeExplanation}
                    </p>
                  </div>

                  {/* Patient Directions */}
                  <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-700 block">
                      Instructions:
                    </span>
                    <p className="leading-relaxed">
                      {med.patientInstructions}
                    </p>
                  </div>

                  {/* Warnings & Side Effects tags */}
                  {med.warningsAndPrecautions && med.warningsAndPrecautions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-rose-600 block">
                        Warnings &amp; Precautions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {med.warningsAndPrecautions.map((warn, wIdx) => (
                          <span
                            key={wIdx}
                            className="text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md"
                          >
                            ⚠️ {warn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom info footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] font-medium">Duration: {med.duration}</span>
                  {onNavigateToReminders ? (
                    <button
                      onClick={() => onNavigateToReminders(med.medicineName, med.dosage)}
                      className="text-teal-700 hover:text-teal-900 font-semibold text-[11px] bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Clock className="w-3 h-3 text-teal-600" />
                      <span>Configure Reminder</span>
                    </button>
                  ) : (
                    <span className="text-teal-700 font-semibold text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Active Prescription
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
