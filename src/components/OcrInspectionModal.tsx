import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Gauge
} from 'lucide-react';
import { PrescriptionScanResult } from '../types/prescription';

interface OcrInspectionModalProps {
  prescription: PrescriptionScanResult;
  onClose: () => void;
  onUpdateRawText?: (updatedText: string) => void;
}

export const OcrInspectionModal: React.FC<OcrInspectionModalProps> = ({
  prescription,
  onClose,
  onUpdateRawText,
}) => {
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState(prescription.rawOcrText);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onUpdateRawText) {
      onUpdateRawText(editableText);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  OCR &amp; Raw Digital Text Extraction
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Digitized Verbatim
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Compare original prescription image with the digitized OCR output
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legibility & Metrics Bar */}
        <div className="bg-teal-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <Gauge className="w-4 h-4 text-teal-300" />
              <span>Legibility Score:</span>
              <span className="font-bold text-emerald-300">
                {prescription.metadata.clarityScore}%
              </span>
            </div>
            <div className="h-3 w-px bg-teal-700"></div>
            <div>
              <span className="text-teal-200">Handwriting Quality: </span>
              <span className="font-semibold text-white">
                {prescription.metadata.handwritingQuality}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-700 text-teal-100 flex items-center space-x-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Side-by-side Inspection Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1">
          {/* Left: Original Prescription Visual */}
          <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-900">
            <div className="bg-slate-800 px-3 py-2 text-xs text-slate-300 flex justify-between items-center">
              <span className="font-semibold">Original Prescription Source</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.2))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.2))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 text-[10px]"
                  title="Reset"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-slate-950 min-h-[360px]">
              {prescription.imageThumbnail ? (
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-w-full"
                >
                  <img
                    src={prescription.imageThumbnail}
                    alt="Original Prescription"
                    className="max-h-[500px] object-contain rounded shadow-lg mx-auto"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs">
                  <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <span>Image preview unavailable for text-only input</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Digitized OCR Output */}
          <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-100 px-3 py-2 text-xs text-slate-700 flex justify-between items-center border-b border-slate-200">
              <span className="font-semibold flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Extracted Digital OCR Transcription</span>
              </span>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 font-mono text-xs text-slate-800 bg-slate-50/50 overflow-y-auto leading-relaxed">
              {isEditing ? (
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full h-full min-h-[300px] p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-slate-800 selection:bg-teal-200">
                  {editableText}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
