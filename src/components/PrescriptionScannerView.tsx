import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  CameraOff,
  Sparkles, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  X, 
  RefreshCw,
  ShieldCheck,
  Zap,
  Info,
  Smartphone,
  RotateCcw,
  Sun
} from 'lucide-react';
import { SAMPLE_PRESCRIPTIONS } from '../data/samplePrescriptions';
import { PrescriptionScanResult } from '../types/prescription';
import { processAndCompressImage } from '../utils/imageUtils';

interface PrescriptionScannerViewProps {
  onScanComplete: (result: PrescriptionScanResult, imagePreview?: string) => void;
  onSelectSamplePreset: (presetId: string) => void;
}

export const PrescriptionScannerView: React.FC<PrescriptionScannerViewProps> = ({
  onScanComplete,
  onSelectSamplePreset,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'active' | 'dismissed' | 'unavailable'>('idle');
  const [cameraErrorDetails, setCameraErrorDetails] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [isTorchSupported, setIsTorchSupported] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatusText, setProcessingStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'camera' | 'text'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure stream is properly assigned to videoRef and played when component updates or camera starts
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      const video = videoRef.current;
      if (video.srcObject !== mediaStreamRef.current) {
        video.srcObject = mediaStreamRef.current;
      }
      video.play().catch((err) => {
        console.warn('Video auto-playback deferred until user interaction:', err);
      });
    }
  }, [isCameraActive, cameraStatus, activeInputMode, facingMode]);

  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setErrorMessage(null);
    setCameraErrorDetails(null);

    // Verify browser mediaDevices support
    if (!navigator?.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unavailable');
      setIsCameraActive(false);
      setCameraErrorDetails(
        'In-browser live video streaming is not supported by your current browser or permissions environment. You can tap "Take Photo with Phone Camera" below to use your native phone camera directly.'
      );
      return;
    }

    // Progressive constraint fallback list
    const constraintAttempts = [
      // 1. High-resolution with target facing mode
      {
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
      },
      // 2. Just ideal facing mode
      {
        video: {
          facingMode: { ideal: targetFacing },
        },
      },
      // 3. Exact target facing mode
      {
        video: {
          facingMode: targetFacing,
        },
      },
      // 4. Any video camera available
      {
        video: true,
      },
    ];

    let stream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintAttempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!stream) {
      setIsCameraActive(false);
      setCameraStatus('dismissed');

      let userMsg = 'Could not access the live camera viewfinder.';
      if (lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError') {
        userMsg =
          'Camera permission was denied in your browser settings. You can grant camera permission in your browser address bar, or use the Native Phone Camera button below.';
      } else if (lastError?.name === 'NotFoundError' || lastError?.name === 'DevicesNotFoundError') {
        userMsg = 'No camera device found on this phone/computer.';
      } else if (lastError?.name === 'NotReadableError' || lastError?.name === 'TrackStartError') {
        userMsg = 'Camera is currently locked or in use by another application.';
      }
      setCameraErrorDetails(userMsg);
      return;
    }

    mediaStreamRef.current = stream;
    setIsCameraActive(true);
    setCameraStatus('active');

    // Check torch / flashlight support
    try {
      const track = stream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const capabilities = (track as any).getCapabilities?.() || {};
        setIsTorchSupported(Boolean(capabilities.torch));
      } else {
        setIsTorchSupported(false);
      }
    } catch {
      setIsTorchSupported(false);
    }

    // Connect to video element if ready
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraStatus('idle');
    setTorchOn(false);
    setIsTorchSupported(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Flashlight toggle failed:', e);
      }
    }
  };

  const triggerNativePhoneCamera = () => {
    stopCamera();
    nativeCameraInputRef.current?.click();
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage('Camera video stream is still initializing. Please wait a second and tap capture again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCamera();

      // Optimize and compress for OCR and fast mobile transfer
      try {
        setIsCompressing(true);
        const compressed = await processAndCompressImage(rawDataUrl, 2048, 0.88);
        setPreviewUrl(compressed);
      } catch {
        setPreviewUrl(rawDataUrl);
      } finally {
        setIsCompressing(false);
      }
      setSelectedFile(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
    // Reset so same file or repeat snap can be selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsCompressing(true);

    try {
      // Compress large phone camera photos (e.g. 12MP-48MP) to crisp 2048px JPEG
      const compressedDataUrl = await processAndCompressImage(file, 2048, 0.88);
      setPreviewUrl(compressedDataUrl);
    } catch (err: any) {
      console.warn('Image processing fallback triggered:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRunScan = async () => {
    if (!previewUrl && !manualText.trim()) {
      setErrorMessage('Please upload a prescription image, capture a photo, or paste prescription text.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const statusMessages = [
      'Scanning prescription image quality and contrast...',
      'Transcribing handwritten doctor notes with OCR engine...',
      'Extracting medicines, dosages, and dosing frequencies...',
      'Converting clinical terms into plain language summary...',
      'Running drug safety checks and directions...',
      'Finalizing digitized prescription details...',
    ];

    let currentStatusIndex = 0;
    const interval = setInterval(() => {
      currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
      setProcessingStatusText(statusMessages[currentStatusIndex]);
    }, 1200);

    setProcessingStatusText(statusMessages[0]);

    try {
      const payload: any = {};
      if (previewUrl) {
        payload.imageBase64 = previewUrl;
        payload.mimeType = 'image/jpeg';
      } else {
        payload.textPrompt = manualText;
      }

      const response = await fetch('/api/scan-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const result: PrescriptionScanResult = await response.json();
      result.imageThumbnail = previewUrl || undefined;
      onScanComplete(result, previewUrl || undefined);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Scan failed:', err);
      setErrorMessage(
        err.message || 'Prescription scanning encountered an error. Please try again or test with a sample prescription.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatusText('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hidden file inputs: standard gallery upload & direct phone camera capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5 text-teal-600" />
          <span>Prescription Optical Scanning &amp; Analysis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          AI Prescription Digitization &amp; Assistance
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Upload handwritten doctor notes or clinic slips. MediScan uses multimodal OCR and clinical AI to extract medications, explain directions in plain English, and schedule alarms.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex space-x-1 border border-slate-200">
          <button
            onClick={() => {
              setActiveInputMode('upload');
              stopCamera();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeInputMode === 'upload'
                ? 'bg-white text-teal-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-teal-600" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => {
              setActiveInputMode('camera');
              startCamera('environment');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeInputMode === 'camera'
                ? 'bg-white text-teal-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Capture with Camera</span>
          </button>

          <button
            onClick={() => {
              setActiveInputMode('text');
              stopCamera();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeInputMode === 'text'
                ? 'bg-white text-teal-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Manual Text Rx</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Capture / Dropzone */}
        <div className="lg:col-span-7 space-y-4">
          {activeInputMode === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[320px] ${
                previewUrl
                  ? 'border-teal-400 bg-teal-50/20'
                  : 'border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/30'
              }`}
            >
              {previewUrl ? (
                <div className="relative w-full max-h-[380px] flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Prescription preview"
                    className="max-h-[300px] object-contain rounded-lg shadow-sm border border-slate-200"
                  />
                  <div className="mt-3 flex items-center space-x-3">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Prescription Loaded</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium underline cursor-pointer"
                    >
                      Remove &amp; Choose Another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-4 shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Upload Prescription Image
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">
                    Drag and drop your prescription photo here, or click to browse files (JPEG, PNG, WEBP).
                  </p>

                  {/* Phone Quick-Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-200 w-full max-w-xs flex flex-col items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerNativePhoneCamera();
                      }}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-teal-600" />
                      <span>Take Photo with Phone Camera</span>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center space-x-2 text-xs text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Private &amp; Secure processing</span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeInputMode === 'camera' && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 text-white relative min-h-[380px] flex flex-col items-center justify-center p-4">
              {/* Photo Captured State */}
              {previewUrl ? (
                <div className="w-full flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Captured Rx"
                    className="max-h-[320px] object-contain rounded-lg border border-slate-700 shadow-md"
                  />
                  <div className="mt-4 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        startCamera(facingMode);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                      <span>Retake Live Stream</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        triggerNativePhoneCamera();
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs text-white font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Snap with Phone Camera</span>
                    </button>
                  </div>
                </div>
              ) : cameraStatus === 'dismissed' || cameraStatus === 'unavailable' ? (
                /* Camera Error / Permission Fallback State */
                <div className="text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4 py-6 px-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-300 flex items-center justify-center border border-slate-700 shadow-sm">
                    <CameraOff className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Live Video Stream Unavailable
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {cameraErrorDetails ||
                        'Direct in-browser video streaming is currently unavailable. No problem! You can use your phone camera app directly with full autofocus, flash, and high clarity.'}
                    </p>
                  </div>

                  {/* Primary Mobile Action: Open Phone Camera Directly */}
                  <div className="w-full pt-1 space-y-2.5">
                    <button
                      type="button"
                      onClick={triggerNativePhoneCamera}
                      className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
                    >
                      <Smartphone className="w-5 h-5 text-slate-950" />
                      <span>Take Photo with Phone Camera</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          stopCamera();
                          setActiveInputMode('upload');
                          fileInputRef.current?.click();
                        }}
                        className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-400" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startCamera(facingMode)}
                        className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Retry Live Stream</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Live Camera Stream Viewfinder */
                <div className="w-full flex flex-col items-center">
                  {/* Top Toolbar: Switch Camera & Torch */}
                  <div className="w-full max-w-md flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Live Viewfinder ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      {isTorchSupported && (
                        <button
                          type="button"
                          onClick={toggleTorch}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                            torchOn
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title="Toggle Flashlight / Torch"
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span className="text-[10px]">{torchOn ? 'Torch On' : 'Torch'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Switch between front and back camera"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-[10px]">Flip Camera</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Viewport Container */}
                  <div className="relative w-full max-w-md aspect-4/3 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        videoRef.current?.play().catch(() => {});
                      }}
                      className="w-full h-full object-cover"
                    />

                    {/* Targeting reticle */}
                    <div className="absolute inset-4 border-2 border-dashed border-teal-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                      <span className="text-[11px] text-teal-300 font-mono bg-slate-900/85 px-2.5 py-1 rounded shadow-sm border border-teal-500/30">
                        Align Prescription Doctor Slip
                      </span>
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Prescription</span>
                    </button>

                    <button
                      type="button"
                      onClick={triggerNativePhoneCamera}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
                      title="Use phone native camera app with autofocus and flash"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Use Phone Camera App</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setActiveInputMode('upload');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-slate-400 text-xs hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeInputMode === 'text' && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                Paste Prescription Text or Doctor's Message
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Example:
Rx:
1. Tab Augmentin 625mg 1 tab BID after food x 7 days
2. Tab Levocetirizine 5mg 1 tab hs at night x 5 days
3. Syr Ascoril-D 10ml TID x 5 days
Doctor: Dr. Vance, Metro Clinic"
                rows={8}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
              <p className="text-xs text-slate-500">
                Tip: You can paste typed WhatsApp doctor prescriptions, discharge summaries, or clinical emails.
              </p>
            </div>
          )}

          {/* Image Compression Indicator */}
          {isCompressing && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center space-x-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Optimizing photo resolution for optical character recognition...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Processing Notice</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Scan Action Button */}
          <button
            onClick={handleRunScan}
            disabled={isProcessing || isCompressing || (!previewUrl && !manualText.trim())}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-md ${
              isProcessing || isCompressing || (!previewUrl && !manualText.trim())
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white shadow-teal-700/20 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Digitizing Prescription with OCR &amp; AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-teal-200" />
                <span>Start OCR Scan &amp; AI Analysis</span>
              </>
            )}
          </button>

          {/* Processing Progress Status */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 animate-pulse space-y-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span className="text-xs font-bold uppercase tracking-wide text-teal-800">
                  Multimodal Processing in Progress
                </span>
              </div>
              <p className="text-xs font-mono text-teal-950 font-medium">
                {processingStatusText}
              </p>
              {/* Progress bar line */}
              <div className="w-full bg-teal-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full w-4/5 animate-[pulse_1s_infinite]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Instant Realistic Preset Prescriptions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Quick-Test Prescriptions
                </h3>
              </div>
              <span className="text-[11px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                Instant 1-Click
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Don't have a prescription on this device? Load one of our verified clinical prescription mockups to test the digitization workflow immediately:
            </p>

            <div className="space-y-3">
              {SAMPLE_PRESCRIPTIONS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onSelectSamplePreset(sample.id)}
                  className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-3.5 transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-16 h-20 object-cover rounded-md border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-teal-400 transition-all"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {sample.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sample.data.medications.length} meds
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 truncate group-hover:text-teal-700 transition-colors">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {sample.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-600">
                          {sample.badge}
                        </span>
                        <span className="text-xs font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                          <span>Load Sample</span>
                          <span>&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Capabilities info box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>How MediScan Works</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Decodes Medical Shorthand:</strong> Translates Latin abbreviations (BID, TID, OD, hs, ac, pc) into standard daily times.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Plain English Explanations:</strong> Clarifies why each medicine is given and what to expect.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                <span>
                  <strong>Reminders &amp; Adherence Tracking:</strong> Set meal-timed medicine reminders and track daily intake with one tap.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
