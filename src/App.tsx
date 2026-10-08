/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PrescriptionScannerView } from './components/PrescriptionScannerView';
import { PrescriptionSummaryView } from './components/PrescriptionSummaryView';
import { MedicineRemindersView } from './components/MedicineRemindersView';
import { OcrInspectionModal } from './components/OcrInspectionModal';
import { AlarmModal } from './components/AlarmModal';
import { SampleModal } from './components/SampleModal';

import { PrescriptionScanResult } from './types/prescription';
import { SAMPLE_PRESCRIPTIONS } from './data/samplePrescriptions';
import { 
  getSavedPrescriptions, 
  savePrescription, 
  getActivePrescription,
  getSavedReminders,
  setIntakeRecordStatus
} from './utils/storage';
import { playReminderChime } from './utils/audioReminder';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'scanner' | 'summary' | 'reminders'>('scanner');
  const [activePrescription, setActivePrescription] = useState<PrescriptionScanResult | null>(null);
  const [remindersCount, setRemindersCount] = useState<number>(3);

  // Modals & Overlays
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [alarmData, setAlarmData] = useState<{
    isOpen: boolean;
    medicationName: string;
    dosage: string;
    instructions: string;
  }>({
    isOpen: false,
    medicationName: 'Augmentin 625mg',
    dosage: '1 Tablet',
    instructions: 'Take after food with water',
  });

  // Initialize data on mount
  useEffect(() => {
    const active = getActivePrescription();
    if (active) {
      setActivePrescription(active);
    } else if (SAMPLE_PRESCRIPTIONS.length > 0) {
      const preset = SAMPLE_PRESCRIPTIONS[0].data;
      setActivePrescription(preset);
      savePrescription(preset);
    }
    const rems = getSavedReminders();
    setRemindersCount(rems.length);
  }, []);

  const handleScanComplete = (result: PrescriptionScanResult, imagePreview?: string) => {
    if (imagePreview && !result.imageThumbnail) {
      result.imageThumbnail = imagePreview;
    }
    savePrescription(result);
    setActivePrescription(result);
    setCurrentTab('summary');
  };

  const handleSelectSamplePreset = (presetId: string) => {
    const found = SAMPLE_PRESCRIPTIONS.find((p) => p.id === presetId);
    if (found) {
      const copy: PrescriptionScanResult = {
        ...found.data,
        imageThumbnail: found.imageUrl,
      };
      savePrescription(copy);
      setActivePrescription(copy);
      setCurrentTab('summary');
    }
  };

  const triggerTestAlarm = (medName?: string, dose?: string, inst?: string) => {
    playReminderChime();
    setAlarmData({
      isOpen: true,
      medicationName: medName || (activePrescription?.medications[0]?.medicineName || 'Augmentin 625mg'),
      dosage: dose || (activePrescription?.medications[0]?.dosage || '1 Tablet'),
      instructions: inst || (activePrescription?.medications[0]?.patientInstructions || 'Take after breakfast with water'),
    });
  };

  const handleNavigateToReminders = (presetMedName?: string, presetDosage?: string) => {
    setCurrentTab('reminders');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activePrescription={activePrescription}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onTriggerTestAlarm={() => triggerTestAlarm()}
        remindersCount={remindersCount}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {currentTab === 'scanner' && (
          <PrescriptionScannerView
            onScanComplete={handleScanComplete}
            onSelectSamplePreset={handleSelectSamplePreset}
          />
        )}

        {currentTab === 'summary' && activePrescription && (
          <PrescriptionSummaryView
            prescription={activePrescription}
            onOpenOcrInspect={() => setIsOcrModalOpen(true)}
            onNavigateToReminders={handleNavigateToReminders}
          />
        )}

        {currentTab === 'reminders' && (
          <MedicineRemindersView
            prescription={activePrescription}
            onOpenScanner={() => setCurrentTab('scanner')}
            onTriggerAlarmPreview={(medName, dose, inst) => triggerTestAlarm(medName, dose, inst)}
          />
        )}

        {currentTab === 'summary' && !activePrescription && (
          <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-800">No Prescription Selected</h2>
            <p className="text-sm text-slate-500">
              Please scan a new prescription or choose from our sample library.
            </p>
            <button
              onClick={() => setCurrentTab('scanner')}
              className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm"
            >
              Go to Prescription Scanner
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-teal-600 text-white font-serif font-black flex items-center justify-center text-xs">
              ℞
            </span>
            <span className="font-bold text-slate-800">MediScan</span>
            <span>— AI-Powered Medical Prescription Digitization &amp; Assistance</span>
          </div>
          <p className="text-slate-400">
            Compliant with clinical assistance guidelines. Always follow your licensed healthcare provider's instructions.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {isOcrModalOpen && activePrescription && (
        <OcrInspectionModal
          prescription={activePrescription}
          onClose={() => setIsOcrModalOpen(false)}
          onUpdateRawText={(newText) => {
            const updated = { ...activePrescription, rawOcrText: newText };
            savePrescription(updated);
            setActivePrescription(updated);
          }}
        />
      )}

      {isSampleModalOpen && (
        <SampleModal
          isOpen={isSampleModalOpen}
          onClose={() => setIsSampleModalOpen(false)}
          onSelectSample={handleSelectSamplePreset}
        />
      )}

      {alarmData.isOpen && (
        <AlarmModal
          medicationName={alarmData.medicationName}
          dosage={alarmData.dosage}
          instructions={alarmData.instructions}
          onClose={() => setAlarmData((prev) => ({ ...prev, isOpen: false }))}
          onTakeDose={() => {
            // Also log the dose intake in records
            const today = new Date().toISOString().split('T')[0];
            const currentSlot = `${new Date().getHours().toString().padStart(2, '0')}:00`;
            setIntakeRecordStatus(
              'alarm-quick',
              alarmData.medicationName,
              today,
              currentSlot,
              'after_meal',
              true
            );
            playReminderChime();
            setAlarmData((prev) => ({ ...prev, isOpen: false }));
          }}
          onSnooze={() => {
            setAlarmData((prev) => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </div>
  );
}
