import React from 'react';
import { 
  FileText, 
  Clock, 
  Scan, 
  Volume2, 
  BellRing,
  Sparkles,
  Bell
} from 'lucide-react';
import { PrescriptionScanResult } from '../types/prescription';
import { playReminderChime } from '../utils/audioReminder';

interface NavbarProps {
  currentTab: 'scanner' | 'summary' | 'reminders';
  onSelectTab: (tab: 'scanner' | 'summary' | 'reminders') => void;
  activePrescription: PrescriptionScanResult | null;
  onOpenSampleModal: () => void;
  onTriggerTestAlarm: () => void;
  remindersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activePrescription,
  onOpenSampleModal,
  onTriggerTestAlarm,
  remindersCount = 3,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with Safety & Medical System context */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">MediScan v2.4</span>
          <span className="hidden sm:inline text-slate-400">| Clinical Prescription Digitization &amp; Medication Adherence</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              playReminderChime();
              onTriggerTestAlarm();
            }}
            className="flex items-center space-x-1.5 text-amber-300 hover:text-amber-200 transition-colors font-medium cursor-pointer"
            title="Simulate a real medication reminder notification & chime"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Test Reminder Alarm</span>
          </button>
          <span className="hidden md:inline text-slate-400">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('scanner')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
              <span className="font-serif font-black text-xl">℞</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">MediScan</span>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                OCR • Medical Simplification • Reminders
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('scanner')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'scanner'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Scan className="w-4 h-4 text-teal-600" />
              <span>Scan &amp; OCR</span>
            </button>

            <button
              onClick={() => onSelectTab('summary')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'summary'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Prescription Summary</span>
              {activePrescription && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-blue-100 text-blue-700 rounded-full font-bold">
                  {activePrescription.medications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('reminders')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'reminders'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Medicine Reminders &amp; Tracker</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-teal-100 text-teal-800 rounded-full font-bold">
                {remindersCount}
              </span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSampleModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Sample Rx</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex overflow-x-auto space-x-1 py-2 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => onSelectTab('scanner')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 flex items-center space-x-1 ${
              currentTab === 'scanner' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan</span>
          </button>
          <button
            onClick={() => onSelectTab('summary')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 flex items-center space-x-1 ${
              currentTab === 'summary' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary ({activePrescription?.medications.length || 0})</span>
          </button>
          <button
            onClick={() => onSelectTab('reminders')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 flex items-center space-x-1 ${
              currentTab === 'reminders' ? 'bg-teal-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Reminders</span>
          </button>
        </div>
      </div>
    </header>
  );
};
