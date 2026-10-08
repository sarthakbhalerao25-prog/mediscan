import React from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SAMPLE_PRESCRIPTIONS } from '../data/samplePrescriptions';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (presetId: string) => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sample Prescription Gallery
              </h3>
              <p className="text-xs text-slate-500">
                Test MediScan immediately with verified real-world prescription slips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {SAMPLE_PRESCRIPTIONS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectSample(preset.id);
                onClose();
              }}
              className="border border-slate-200 hover:border-teal-500 rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white"
            >
              <img
                src={preset.imageUrl}
                alt={preset.title}
                className="w-20 h-24 object-cover rounded-xl border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-teal-400 transition-all"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {preset.category}
                  </span>
                  <span className="text-xs text-slate-400">• {preset.badge}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-teal-700 transition-colors">
                  {preset.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {preset.description}
                </p>
                <div className="mt-2 text-[11px] text-teal-600 font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Load and Explore Prescription</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
