import React from 'react';
import { BellRing, Check, Clock, X, Pill, Volume2 } from 'lucide-react';
import { playReminderChime } from '../utils/audioReminder';

interface AlarmModalProps {
  medicationName: string;
  dosage: string;
  instructions: string;
  onClose: () => void;
  onTakeDose: () => void;
  onSnooze: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  medicationName,
  dosage,
  instructions,
  onClose,
  onTakeDose,
  onSnooze,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Urgent/Medical Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs mx-auto flex items-center justify-center mb-3 ring-4 ring-white/10 animate-bounce">
            <BellRing className="w-8 h-8 text-amber-300" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-100 bg-teal-800/40 px-3 py-1 rounded-full">
            Medication Reminder Alert
          </span>
          <h2 className="text-2xl font-black mt-2">
            Time to Take Your Medicine
          </h2>
          <p className="text-xs text-teal-100 mt-1">
            Scheduled Dose: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center space-x-2 text-teal-800">
              <Pill className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">
                {medicationName}
              </h3>
            </div>
            <p className="text-sm font-semibold text-teal-700 mt-0.5">
              Dose: {dosage}
            </p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/70">
              💡 {instructions || 'Take with water according to your prescription directions.'}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => playReminderChime()}
              className="text-xs text-slate-500 hover:text-teal-700 flex items-center space-x-1 underline"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay Audio Chime</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onTakeDose}
              className="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Take Dose Now</span>
            </button>

            <button
              onClick={onSnooze}
              className="py-3 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Snooze 10 Mins</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
