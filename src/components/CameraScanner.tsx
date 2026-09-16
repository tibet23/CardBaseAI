import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  RotateCcw,
  Sparkles,
  Upload,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sun,
  Contrast,
  FlipHorizontal,
  FileText,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { ContactCard } from '../types';
import { performOfflineOCR } from '../utils/offlineOcr';
import { getCsrfHeaders } from '../utils/apiAuth';
import { generateSampleCardSvg } from '../utils/sampleCards';
import { CompanyBrandFrame } from './CompanyBrandFrame';
import { BrandLogo } from './BrandLogo';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (card: ContactCard) => void;
  isOffline: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  isOpen,
  onClose,
  onSaveCard,
  isOffline,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedFront, setCapturedFront] = useState<string | null>(null);
  const [capturedBack, setCapturedBack] = useState<string | null>(null);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [extractedDraft, setExtractedDraft] = useState<Partial<ContactCard> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [highContrast, setHighContrast] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn('Torch constraint toggle not supported:', err);
    }
  };

  // Ephemeral memory drop when modal closes
  useEffect(() => {
    if (!isOpen) {
      abortControllerRef.current?.abort();
      stopCamera();
      setCapturedFront(null);
      setCapturedBack(null);
      setExtractedDraft(null);
      setErrorMessage(null);
      setStatusMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !capturedFront) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedFront]);

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      setCameraUnavailable(false);
      
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera streaming is not supported on this browser or context.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      // Inspect track capabilities for flashlight/torch support on mobile cameras
      const track = mediaStream.getVideoTracks()[0];
      if (track && typeof (track as any).getCapabilities === 'function') {
        const caps = (track as any).getCapabilities();
        setHasTorch(Boolean(caps?.torch));
      }
    } catch (err: any) {
      console.warn('Live camera streaming unavailable:', err?.message || err);
      setCameraUnavailable(true);
      setErrorMessage(
        'Live camera stream is restricted in this window or permission was not granted. You can use your device camera directly or upload a photo.'
      );
    }
  };

  const stopCamera = () => {
    setIsTorchOn(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCleanClose = () => {
    abortControllerRef.current?.abort();
    stopCamera();
    setCapturedFront(null);
    setCapturedBack(null);
    setExtractedDraft(null);
    setErrorMessage(null);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
    onClose();
  };

  const handleLoadSampleCard = () => {
    abortControllerRef.current?.abort();
    // Drop previous scan data from memory before starting new scan
    setCapturedFront(null);
    setCapturedBack(null);
    setExtractedDraft(null);

    const sampleCard = generateSampleCardSvg(
      'Elena Rostova',
      'VP of Product Engineering',
      'Apex AI Systems',
      'elena.rostova@apexai.io',
      '+1 (415) 890-2341',
      'https://apexai.io',
      '#0284c7',
      '#38bdf8'
    );
    setCapturedFront(sampleCard);
    processCardOCR(sampleCard);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Check video readiness to prevent zero-dimension canvas draw exceptions (Bug 11)
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage('Camera feed is still initializing. Please wait a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (highContrast) {
      ctx.filter = 'contrast(1.4) brightness(1.1)';
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Tactile haptic feedback for phone shutter tap
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([20, 30]); } catch {}
    }

    if (currentSide === 'front') {
      // Overwrite previous scan memory
      setCapturedFront(null);
      setExtractedDraft(null);
      setCapturedFront(dataUrl);
      processCardOCR(dataUrl);
    } else {
      setCapturedBack(dataUrl);
    }
  };

  const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB limit (Bug 3)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage('Image file is too large (max 12MB). Please select a compressed photo.');
      return;
    }

    // Overwrite previous scan memory before loading new file
    setCapturedFront(null);
    setCapturedBack(null);
    setExtractedDraft(null);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected image file.');
    };
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Downscale if dimension is excessively large (> 2048px) to prevent OOM
      const img = new Image();
      img.onerror = () => {
        setCapturedFront(dataUrl);
        processCardOCR(dataUrl);
      };
      img.onload = () => {
        const maxDim = 2048;
        if (img.width > maxDim || img.height > maxDim) {
          const scale = Math.min(maxDim / img.width, maxDim / img.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const optimized = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedFront(optimized);
            processCardOCR(optimized);
            return;
          }
        }
        setCapturedFront(dataUrl);
        processCardOCR(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const processCardOCR = async (frontImage: string) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (isOffline) {
        setStatusMessage('Scanning card offline in browser...');
        const offlineData = await performOfflineOCR(frontImage, (prog, msg) => {
          setStatusMessage(`${msg} (${prog}%)`);
        });
        setExtractedDraft(offlineData);
      } else {
        setStatusMessage('Extracting contact details via Gemini AI OCR...');
        const csrfHeaders = await getCsrfHeaders();
        const response = await fetch('/api/ocr/scan', {
          signal: controller.signal,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders,
          },
          body: JSON.stringify({
            imageBase64: frontImage,
            mode: 'single',
          }),
        });

        // Bug 9: Validate HTTP response status before JSON parse
        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          let errMsg = `Server returned status ${response.status}`;
          try {
            const errJson = JSON.parse(errText);
            if (errJson.error) errMsg = errJson.error;
          } catch {
            if (errText) errMsg = errText.slice(0, 100);
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        if (!data.success || !data.data?.cards?.[0]) {
          throw new Error(data.error || 'Could not parse card.');
        }

        const card = data.data.cards[0];
        setExtractedDraft({
          fullName: card.fullName || 'Scanned Contact',
          jobTitle: card.jobTitle || '',
          company: card.company || '',
          department: card.department || '',
          email: card.email || '',
          phone: card.phone || '',
          mobilePhone: card.mobilePhone || '',
          website: card.website || '',
          address: {
            street: card.street,
            city: card.city,
            state: card.state,
            zip: card.zip,
            country: card.country,
          },
          social: {
            linkedin: card.linkedin,
            twitter: card.twitter,
          },
          category: card.category || 'Technology',
          tags: card.suggestedTags || ['Camera Scanned'],
          notes: card.notes || '',
          primaryColorHex: card.primaryColorHex || '#1e40af',
          confidenceScore: card.confidenceScore || 96,
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Cancelled request, ignore
      console.error('OCR processing error:', err);
      setErrorMessage(err.message || 'OCR extraction encountered an error.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleSave = () => {
    if (!capturedFront || !extractedDraft) return;

    const newCard: ContactCard = {
      id: `card_${Date.now()}`,
      fullName: extractedDraft.fullName || 'Contact',
      jobTitle: extractedDraft.jobTitle || '',
      company: extractedDraft.company || '',
      department: extractedDraft.department || '',
      email: extractedDraft.email || '',
      phone: extractedDraft.phone || '',
      mobilePhone: extractedDraft.mobilePhone || '',
      website: extractedDraft.website || '',
      address: extractedDraft.address || {},
      social: extractedDraft.social || {},
      category: extractedDraft.category || 'General',
      tags: extractedDraft.tags || ['Camera Scanned'],
      notes: extractedDraft.notes || '',
      cardImage: capturedFront,
      cardBackImage: capturedBack || undefined,
      confidenceScore: extractedDraft.confidenceScore || 95,
      scannedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isOfflineScanned: isOffline,
      primaryColorHex: extractedDraft.primaryColorHex || '#2563eb',
      crmSyncStatus: {},
    };

    onSaveCard(newCard);

    // Ephemeral drop: nullify temporary in-memory buffers immediately
    setCapturedFront(null);
    setCapturedBack(null);
    setExtractedDraft(null);
    setErrorMessage(null);
    stopCamera();
    onClose();
  };

  const handleReset = () => {
    // Explicitly overwrite old buffers with null
    setCapturedFront(null);
    setCapturedBack(null);
    setExtractedDraft(null);
    setErrorMessage(null);
    setStatusMessage('');
    setCurrentSide('front');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#090d16] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Mobile Top Swipe Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <BrandLogo size="md" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-1.5 sm:gap-2">
                <span>Live Camera Card Scanner</span>
                {isOffline && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                    Offline OCR
                  </span>
                )}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Align business card within the golden reticle frame for automatic high-resolution extraction
              </p>
            </div>
          </div>
          <button
            onClick={handleCleanClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div data-private="true" data-no-track="true" className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
          
          {/* Active View: Live Camera Viewfinder or Extracted Result */}
          {!capturedFront ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] max-h-[460px] flex items-center justify-center border border-slate-800 shadow-inner">
                
                {/* Live Video Element if available */}
                {!cameraUnavailable ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${highContrast ? 'contrast-125 brightness-110' : ''}`}
                    />

                    {/* Golden Ratio Alignment Reticle */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 sm:p-8">
                      <div className="relative w-full max-w-[480px] aspect-[1.75/1] border-2 border-blue-400/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex flex-col justify-between p-3">
                        
                        {/* Reticle Corner Marks */}
                        <div className="flex justify-between">
                          <div className="w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                          <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                        </div>

                        <div className="text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-black/70 text-white backdrop-blur-sm uppercase">
                            Align Business Card Here
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <div className="w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                          <div className="w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
                        </div>
                      </div>
                    </div>

                    {/* Top Controls Overlay */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2">
                      <button
                        onClick={() => setHighContrast(!highContrast)}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl backdrop-blur-md transition-colors text-white ${
                          highContrast ? 'bg-amber-500' : 'bg-black/50 hover:bg-black/70'
                        }`}
                        title="Toggle High Contrast Filter for glossy or dark cards"
                      >
                        <Contrast className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() =>
                          setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
                        }
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-colors"
                        title="Flip camera"
                      >
                        <FlipHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Camera Restricted / Fallback View */
                  <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                      <Camera className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        Live Stream Restricted in this Frame
                      </h3>
                      <p className="text-xs text-slate-400">
                        Browser iframe permissions or device settings blocked direct stream access. You can snap a photo with your native device camera, upload an image, or try a sample card.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Snap Device Photo</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload File</span>
                      </button>

                      <button
                        onClick={handleLoadSampleCard}
                        className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 active:scale-95 transition-all border border-amber-800/80 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Try Sample Card</span>
                      </button>

                      <button
                        onClick={startCamera}
                        className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Retry requesting live camera access"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Retry</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Shutter & Controls Dock */}
              <div className="pt-2 space-y-3">
                {/* Mobile Ergonomic Shutter Bar */}
                <div className="flex sm:hidden items-center justify-around py-2 px-4 bg-slate-100/80 dark:bg-[#070b14] rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  {/* Left: Torch/Flashlight or Upload */}
                  {hasTorch ? (
                    <button
                      onClick={toggleTorch}
                      className={`min-h-[46px] min-w-[46px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isTorchOn
                          ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/30 scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                      title={isTorchOn ? 'Turn Flash Off' : 'Turn Flash On'}
                    >
                      <Zap className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Flash</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[46px] min-w-[46px] rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center transition-colors cursor-pointer"
                      title="Upload Image"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Upload</span>
                    </button>
                  )}

                  {/* Center: Large Thumb Shutter Button */}
                  <button
                    onClick={!cameraUnavailable ? handleCapture : () => nativeCameraInputRef.current?.click()}
                    className="w-18 h-18 rounded-full border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-200/60 dark:bg-slate-800/60 active:scale-90 transition-transform cursor-pointer p-1 shadow-xl"
                    aria-label="Snap photo"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <Camera className="h-7 w-7 stroke-[2.2]" />
                    </div>
                  </button>

                  {/* Right: Camera Flip */}
                  <button
                    onClick={() =>
                      setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
                    }
                    className="min-h-[46px] min-w-[46px] rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center transition-colors cursor-pointer"
                    title="Flip camera"
                  >
                    <FlipHorizontal className="h-5 w-5" />
                    <span className="text-[9px] font-bold mt-0.5">Flip</span>
                  </button>
                </div>

                {/* Desktop & Tablet Control Bar */}
                <div className="hidden sm:flex flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {hasTorch && (
                      <button
                        onClick={toggleTorch}
                        className={`min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center cursor-pointer transition-colors ${
                          isTorchOn
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Zap className="h-4 w-4 mr-1.5 shrink-0" />
                        {isTorchOn ? 'Torch On' : 'Torch Off'}
                      </button>
                    )}

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[44px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center cursor-pointer px-2"
                    >
                      <Upload className="h-4 w-4 mr-1.5 shrink-0" />
                      Upload image file
                    </button>

                    <button
                      onClick={handleLoadSampleCard}
                      className="min-h-[44px] text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center cursor-pointer px-2"
                    >
                      <Sparkles className="h-4 w-4 mr-1.5 shrink-0" />
                      Load demo card
                    </button>
                  </div>

                  <div>
                    {!cameraUnavailable ? (
                      <button
                        onClick={handleCapture}
                        className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center px-8 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer border border-blue-400/30"
                      >
                        <Camera className="h-5 w-5 mr-2 shrink-0" />
                        Scan Front of Card
                      </button>
                    ) : (
                      <button
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center px-8 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer border border-blue-400/30"
                      >
                        <Camera className="h-5 w-5 mr-2 shrink-0" />
                        Open Device Camera
                      </button>
                    )}
                  </div>
                </div>

                {/* Secondary Quick Links on Mobile */}
                <div className="flex sm:hidden items-center justify-center space-x-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                  <button
                    onClick={handleLoadSampleCard}
                    className="flex items-center space-x-1 hover:text-amber-500 cursor-pointer min-h-[36px]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Demo Card</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer min-h-[36px]"
                  >
                    <Camera className="h-3.5 w-3.5 text-blue-500" />
                    <span>Native Camera</span>
                  </button>
                </div>

                {/* Hidden Native File Inputs */}
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Extracted Preview & Form */
            <div className="space-y-6">
              
              {/* Processing Loader */}
              {isProcessing && (
                <div className="p-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center space-x-3 text-blue-700 dark:text-blue-300">
                  <Sparkles className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-semibold">{statusMessage || 'Extracting contact details...'}</span>
                </div>
              )}

              {/* Error Box */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form & Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Card Snapshots / Generated Brand Emblem */}
                <div className="md:col-span-5 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                      <span>Brand Identity Preview</span>
                      <button
                        onClick={handleReset}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Retake
                      </button>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                      <CompanyBrandFrame
                        card={{
                          id: 'preview',
                          fullName: extractedDraft?.fullName || 'Contact Name',
                          jobTitle: extractedDraft?.jobTitle || '',
                          company: extractedDraft?.company || 'Company',
                          email: extractedDraft?.email || '',
                          phone: extractedDraft?.phone || '',
                          category: extractedDraft?.category || 'General',
                          primaryColorHex: extractedDraft?.primaryColorHex,
                          tags: extractedDraft?.tags || [],
                          cardImage: capturedFront || '',
                          confidenceScore: extractedDraft?.confidenceScore || 90,
                          scannedAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          isFavorite: false,
                          crmSyncStatus: {},
                          address: extractedDraft?.address || {},
                          social: extractedDraft?.social || {},
                        }}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Optional Card Back Side */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                      <span>Card Back Side (Optional)</span>
                      {capturedBack && (
                        <button
                          onClick={() => setCapturedBack(null)}
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {capturedBack ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[1.75/1]">
                        <img
                          src={capturedBack}
                          alt="Card Back"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl aspect-[1.75/1] flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const r = new FileReader();
                            r.onload = (ev) => setCapturedBack(ev.target?.result as string);
                            r.readAsDataURL(f);
                          }}
                          className="hidden"
                        />
                        <Layers className="h-6 w-6 text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Add Card Back Photo
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Handwritten notes, map, QR)
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Right Form Fields */}
                <div className="md:col-span-7 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Extracted Contact Data</span>
                    {extractedDraft?.confidenceScore && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {extractedDraft.confidenceScore}% Confidence
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={extractedDraft?.fullName || ''}
                        onChange={(e) =>
                          setExtractedDraft((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={extractedDraft?.jobTitle || ''}
                          onChange={(e) =>
                            setExtractedDraft((prev) => ({ ...prev, jobTitle: e.target.value }))
                          }
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Company *
                        </label>
                        <input
                          type="text"
                          value={extractedDraft?.company || ''}
                          onChange={(e) =>
                            setExtractedDraft((prev) => ({ ...prev, company: e.target.value }))
                          }
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={extractedDraft?.email || ''}
                          onChange={(e) =>
                            setExtractedDraft((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={extractedDraft?.phone || ''}
                          onChange={(e) =>
                            setExtractedDraft((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={extractedDraft?.website || ''}
                        onChange={(e) =>
                          setExtractedDraft((prev) => ({ ...prev, website: e.target.value }))
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={handleCleanClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {capturedFront && extractedDraft && (
            <button
              onClick={handleSave}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Contact to Library
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
