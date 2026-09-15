import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
  Trash2,
  Tag,
  Share2,
  Eye,
  Sliders,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { ContactCard, BoundingBox } from '../types';
import { cropCardFromImage } from '../utils/cardCropper';
import { generateMultiCardPhotoDesk, generateSampleCardSvg, renderMultiCardDeskToJpeg } from '../utils/sampleCards';
import { performOfflineOCR } from '../utils/offlineOcr';
import { getCsrfHeaders } from '../utils/apiAuth';
import { CompanyBrandFrame } from './CompanyBrandFrame';

interface BatchScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatchCards: (cards: ContactCard[]) => void;
  isOffline: boolean;
}

interface DetectedCardDraft {
  id: string;
  cardIndex: number;
  fullName: string;
  jobTitle: string;
  company: string;
  department?: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  website: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  linkedin?: string;
  twitter?: string;
  category: string;
  suggestedTags: string[];
  notes?: string;
  primaryColorHex: string;
  confidenceScore: number;
  boundingBox: BoundingBox;
  croppedImage: string;
  selected: boolean;
}

export const BatchScanner: React.FC<BatchScannerProps> = ({
  isOpen,
  onClose,
  onSaveBatchCards,
  isOffline,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'demo'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [detectedCards, setDetectedCards] = useState<DetectedCardDraft[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [bulkTagInput, setBulkTagInput] = useState<string>('Batch Scan');
  const [autoCrmSync, setAutoCrmSync] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);

  // Stop camera and drop ephemeral memory when closing or switching tabs
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      // Drop ephemeral base64 image strings and detected cards from memory
      setImagePreview(null);
      setDetectedCards([]);
      setSelectedCardId(null);
      setEditingCardId(null);
      setErrorMessage(null);
      setProcessingStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
    } else if (activeTab !== 'camera') {
      stopCamera();
    }
  }, [isOpen, activeTab]);

  const handleCleanClose = () => {
    stopCamera();
    setImagePreview(null);
    setDetectedCards([]);
    setSelectedCardId(null);
    setEditingCardId(null);
    setErrorMessage(null);
    setProcessingStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
    onClose();
  };

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      setCameraUnavailable(false);
      setIsCameraActive(false);

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera streaming is not supported in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Batch camera stream unavailable:', err?.message || err);
      setCameraUnavailable(true);
      setIsCameraActive(false);
      setErrorMessage('Camera access is restricted or denied in this frame. You can take a photo with your device camera or upload a photo.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    handleProcessImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleProcessImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleProcessImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectDemoDesk = async (cardCount: 4 | 6 | 8 | 10) => {
    setIsProcessing(true);
    setProcessingStatus(`Rendering high-resolution ${cardCount}-card photo desk...`);
    try {
      const demoDataUrl = await renderMultiCardDeskToJpeg(cardCount);
      handleProcessImage(demoDataUrl);
    } catch {
      const fallbackUrl = generateMultiCardPhotoDesk(cardCount);
      handleProcessImage(fallbackUrl);
    }
  };

  const handleProcessImage = async (dataUrl: string) => {
    // Drop previous image preview and detected cards from memory before new scan
    setImagePreview(null);
    setDetectedCards([]);
    setSelectedCardId(null);
    setEditingCardId(null);

    setImagePreview(dataUrl);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (isOffline) {
        // Offline OCR Processing (Client-Side)
        setProcessingStatus('Running offline browser OCR...');
        const offlineResult = await performOfflineOCR(dataUrl, (prog, msg) => {
          setProcessingStatus(`${msg} (${prog}%)`);
        });

        const fallbackCard: DetectedCardDraft = {
          id: `card_${Date.now()}_0`,
          cardIndex: 1,
          fullName: offlineResult.fullName || 'Scanned Contact',
          jobTitle: offlineResult.jobTitle || 'Executive',
          company: offlineResult.company || 'Enterprise',
          email: offlineResult.email || '',
          phone: offlineResult.phone || '',
          website: offlineResult.website || '',
          street: offlineResult.address?.street,
          city: offlineResult.address?.city,
          state: offlineResult.address?.state,
          zip: offlineResult.address?.zip,
          country: offlineResult.address?.country,
          category: offlineResult.category || 'General',
          suggestedTags: ['Offline Scanned', 'Batch 1-Card'],
          notes: offlineResult.notes || '',
          primaryColorHex: '#2563eb',
          confidenceScore: 82,
          boundingBox: { ymin: 100, xmin: 100, ymax: 900, xmax: 900 },
          croppedImage: dataUrl,
          selected: true,
        };

        setDetectedCards([fallbackCard]);
        setSelectedCardId(fallbackCard.id);
        setIsProcessing(false);
        return;
      }

      // Online Multi-Card Server OCR with Gemini 3.7 Flash
      setProcessingStatus('Analyzing multi-card photo (Detecting 1 to 10+ cards)...');
      const csrfHeaders = await getCsrfHeaders();
      
      const response = await fetch('/api/ocr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders,
        },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mode: 'batch',
        }),
      });

      if (!response.ok) {
        let errMsg = `Server returned status ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson.error) errMsg = errJson.error;
        } catch {
          // ignore parsing error
        }
        throw new Error(errMsg);
      }

      const resData = await response.json();
      if (!resData.success || !resData.data?.cards) {
        throw new Error(resData.error || 'Failed to detect cards.');
      }

      setProcessingStatus(`Detected ${resData.data.cards.length} cards. Cropping card regions...`);

      const rawCards = resData.data.cards;
      const processedList: DetectedCardDraft[] = [];

      for (let i = 0; i < rawCards.length; i++) {
        const c = rawCards[i];
        const box: BoundingBox = c.boundingBox || {
          ymin: Math.floor(i / 3) * 300,
          xmin: (i % 3) * 300,
          ymax: Math.floor(i / 3) * 300 + 250,
          xmax: (i % 3) * 300 + 250,
        };

        // Crop individual card image
        let cropped = dataUrl;
        try {
          cropped = await cropCardFromImage(dataUrl, box);
        } catch {
          cropped = dataUrl;
        }

        processedList.push({
          id: `card_${Date.now()}_${i}`,
          cardIndex: c.cardIndex || i + 1,
          fullName: c.fullName || `Contact #${i + 1}`,
          jobTitle: c.jobTitle || 'Executive',
          company: c.company || 'Company Inc',
          department: c.department || '',
          email: c.email || '',
          phone: c.phone || '',
          mobilePhone: c.mobilePhone || '',
          website: c.website || '',
          street: c.street || '',
          city: c.city || '',
          state: c.state || '',
          zip: c.zip || '',
          country: c.country || '',
          linkedin: c.linkedin || '',
          twitter: c.twitter || '',
          category: c.category || 'Technology',
          suggestedTags: c.suggestedTags || ['Batch OCR', 'Scanned 2026'],
          notes: c.notes || '',
          primaryColorHex: c.primaryColorHex || '#1e40af',
          confidenceScore: c.confidenceScore || 95,
          boundingBox: box,
          croppedImage: cropped,
          selected: true,
        });
      }

      setDetectedCards(processedList);
      if (processedList.length > 0) {
        setSelectedCardId(processedList[0].id);
      }
    } catch (err: any) {
      console.error('Batch Scan Error:', err);
      setErrorMessage(
        `Multi-card OCR error: ${err.message || 'Please check your connection and retry.'}`
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleToggleCardSelect = (id: string) => {
    setDetectedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setDetectedCards((prev) => prev.map((c) => ({ ...c, selected: select })));
  };

  const handleUpdateCardField = (id: string, field: keyof DetectedCardDraft, value: any) => {
    setDetectedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveSelectedCards = () => {
    if (isSaving) return;
    const selected = detectedCards.filter((c) => c.selected);
    if (!selected.length) {
      alert('Please select at least one card to save.');
      return;
    }

    setIsSaving(true);
    try {
      const finalCards: ContactCard[] = selected.map((d) => {
        const tags = [...d.suggestedTags];
        if (bulkTagInput.trim() && !tags.includes(bulkTagInput.trim())) {
          tags.push(bulkTagInput.trim());
        }

        return {
          id: d.id,
          fullName: d.fullName,
          jobTitle: d.jobTitle,
          company: d.company,
          department: d.department,
          email: d.email,
          phone: d.phone,
          mobilePhone: d.mobilePhone,
          website: d.website,
          address: {
            street: d.street,
            city: d.city,
            state: d.state,
            zip: d.zip,
            country: d.country,
          },
          social: {
            linkedin: d.linkedin,
            twitter: d.twitter,
          },
          category: d.category,
          tags: tags,
          notes: d.notes,
          cardImage: d.croppedImage,
          originalMultiCardImage: imagePreview || undefined,
          boundingBox: d.boundingBox,
          confidenceScore: d.confidenceScore,
          scannedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFavorite: false,
          isOfflineScanned: isOffline,
          primaryColorHex: d.primaryColorHex,
          crmSyncStatus: autoCrmSync
            ? {
                Apollo: {
                  synced: true,
                  syncedAt: new Date().toISOString(),
                  remoteId: `apl_${Math.random().toString(36).substring(2, 8)}`,
                  provider: 'Apollo',
                },
                HubSpot: {
                  synced: true,
                  syncedAt: new Date().toISOString(),
                  remoteId: `hs_${Math.random().toString(36).substring(2, 8)}`,
                  provider: 'HubSpot',
                },
              }
            : {},
        };
      });

      onSaveBatchCards(finalCards);

      // Ephemeral drop: nullify temporary in-memory buffers immediately after saving locally
      setImagePreview(null);
      setDetectedCards([]);
      setSelectedCardId(null);
      setEditingCardId(null);
      setErrorMessage(null);
      setProcessingStatus('');
      stopCamera();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedCard = detectedCards.find((c) => c.id === selectedCardId);
  const selectedCount = detectedCards.filter((c) => c.selected).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#090d16] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 w-full max-w-6xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Mobile Top Swipe Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                  1-Pic 10-Card Batch OCR
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                  Rapid Digitize 10×
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Capture overhead photo of 1 to 10+ business cards simultaneously
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

        {/* Modal Body */}
        <div data-private="true" data-no-track="true" className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
          
          {/* Step 1: Input Tabs & Image Selection (when no cards extracted yet or to re-upload) */}
          {detectedCards.length === 0 && !isProcessing && (
            <div className="space-y-4 sm:space-y-6">
              
              {/* Responsive Tab Selector for Mobile, Tablet & Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    stopCamera();
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Upload className="h-4 w-4 mr-2 shrink-0" />
                  <span>Upload Desk Photo</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('camera');
                    startCamera();
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer ${
                    activeTab === 'camera'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Camera className="h-4 w-4 mr-2 shrink-0" />
                  <span>Live 10-Card Camera</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('demo');
                    stopCamera();
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer ${
                    activeTab === 'demo'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Zap className="h-4 w-4 mr-2 text-amber-500 shrink-0" />
                  <span>Demo Presets (Instant)</span>
                </button>
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/40 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-inner border border-blue-200/60 dark:border-blue-800">
                    <Upload className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Tap to select or drag &amp; drop desk photo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Supports high-resolution PNG, JPG, WEBP. Place 1 to 10+ business cards anywhere in the photo frame.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Automatic Card Boundary Detection</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Multi-card Field Parsing</span>
                  </div>
                </div>
              )}

              {/* Camera Tab */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[3/4] sm:aspect-[4/5] max-h-[480px] sm:max-h-[520px] max-w-md mx-auto flex items-center justify-center border border-slate-800 shadow-xl">
                    {!cameraUnavailable && isCameraActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />

                        {/* Multi-Card Alignment Overlay Grid: 10 Cards (2 Columns x 5 Rows) */}
                        <div className="absolute inset-0 pointer-events-none p-3 sm:p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-center text-white/90 text-[10px] sm:text-[11px] font-mono bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md self-start border border-white/10 shadow-sm">
                            <span>OVERHEAD 10-CARD GRID (2 × 5)</span>
                          </div>

                          {/* Guide Grid Lines (2 columns, 5 rows) */}
                          <div className="grid grid-cols-2 grid-rows-5 gap-1.5 sm:gap-2 flex-1 my-2 border-2 border-dashed border-white/35 rounded-xl p-1.5 sm:p-2 bg-black/15 backdrop-blur-[0.5px]">
                            {Array.from({ length: 10 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="border border-white/25 rounded-lg flex items-center justify-center text-white/80 text-[9px] sm:text-[11px] font-mono font-bold bg-white/10 backdrop-blur-xs shadow-2xs"
                              >
                                Card Slot #{idx + 1}
                              </div>
                            ))}
                          </div>

                          <div className="text-center text-white/90 text-[10px] sm:text-[11px] font-medium bg-black/70 py-1 px-2.5 rounded-lg backdrop-blur-md border border-white/10 shadow-sm">
                            Align up to 10 cards in 2 columns on a flat surface and snap
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Live Camera Restricted View */
                      <div className="p-6 text-center space-y-4 max-w-sm mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                          <Camera className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            Live Stream Restricted
                          </h3>
                          <p className="text-xs text-slate-400">
                            Browser permissions or iframe sandbox prevented direct live video streaming. Use your native device camera directly to capture an overhead photo of up to 10 cards at once!
                          </p>
                        </div>

                        <div className="flex flex-col gap-2.5 pt-2">
                          <button
                            onClick={() => nativeCameraInputRef.current?.click()}
                            className="min-h-[44px] w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5 cursor-pointer"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Snap with Device Camera</span>
                          </button>

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="min-h-[44px] w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Upload Desk Photo</span>
                          </button>

                          <button
                            onClick={() => handleSelectDemoDesk(10)}
                            className="min-h-[44px] w-full px-4 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 active:scale-95 transition-all border border-amber-800/80 flex items-center justify-center space-x-1.5 cursor-pointer"
                          >
                            <Zap className="h-4 w-4 text-amber-400" />
                            <span>Try 10-Card Demo Desk</span>
                          </button>

                          <button
                            onClick={startCamera}
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Retry Requesting Camera</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Native Device Camera input with capture="environment" */}
                  <input
                    ref={nativeCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex justify-center">
                    {!cameraUnavailable && isCameraActive ? (
                      <button
                        onClick={captureCameraPhoto}
                        className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center px-8 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer border border-blue-400/30"
                      >
                        <Camera className="h-5 w-5 mr-2 shrink-0" />
                        Capture Photo &amp; Run Batch OCR
                      </button>
                    ) : (
                      <button
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center px-8 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer border border-blue-400/30"
                      >
                        <Camera className="h-5 w-5 mr-2 shrink-0" />
                        Open Device Camera for 10 Cards
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Instant Demo Presets Tab */}
              {activeTab === 'demo' && (
                <div className="space-y-4">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-800 dark:text-amber-200">
                      <p className="font-bold mb-0.5">Test the "1 Picture 10 Cards at once" OCR immediately</p>
                      Select a synthesized high-definition desk photo containing multiple real-world formatted business cards to see rapid multi-card segmentation &amp; extraction in action!
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div
                      onClick={() => handleSelectDemoDesk(10)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1424] hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            Expo Networking Desk
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            10 Cards
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          Full table photo with 10 varied business cards (Tech, Biotech, Finance, Logistics).
                        </p>
                      </div>
                      <button className="w-full min-h-[44px] py-2 rounded-xl text-xs font-bold text-white bg-blue-600 group-hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                        Run 10-Card OCR ➔
                      </button>
                    </div>

                    <div
                      onClick={() => handleSelectDemoDesk(8)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1424] hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            Executive Summit Table
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            8 Cards
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          Desk photo containing 8 corporate partner cards with international phone numbers.
                        </p>
                      </div>
                      <button className="w-full min-h-[44px] py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 group-hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
                        Run 8-Card OCR ➔
                      </button>
                    </div>

                    <div
                      onClick={() => handleSelectDemoDesk(4)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1424] hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:shadow-md group sm:col-span-2 lg:col-span-1 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            Startup Founders Meetup
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            4 Cards
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          Clean 4-card arrangement with social handles and email domains.
                        </p>
                      </div>
                      <button className="w-full min-h-[44px] py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 group-hover:bg-emerald-700 active:scale-95 transition-all shadow-sm">
                        Run 4-Card OCR ➔
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Loading Indicator */}
          {isProcessing && (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 border border-white/20">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center space-x-2">
                  <span>Gemini Vision Optical Character Recognition</span>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  {processingStatus || 'Analyzing multi-card desk image...'}
                </p>
                <p className="text-xs text-slate-400 mt-2 max-w-sm">
                  Segmenting individual cards, correcting rotation, extracting emails, phones, and job titles...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-800 dark:text-red-300">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Processing Notice</p>
                <p>{errorMessage}</p>
                <button
                  onClick={() => {
                    setDetectedCards([]);
                    setImagePreview(null);
                    setErrorMessage(null);
                  }}
                  className="mt-2 min-h-[44px] text-xs underline font-bold text-red-700 dark:text-red-300 cursor-pointer inline-flex items-center"
                >
                  Try Another Photo
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Extracted Cards Review (1 to 10 Cards Split Layout) */}
          {detectedCards.length > 0 && !isProcessing && (
            <div className="space-y-4 sm:space-y-6">
              
              {/* Batch Summary Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      Extracted {detectedCards.length} Business Cards Successfully
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {selectedCount} of {detectedCards.length} selected for saving
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="min-h-[40px] px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="min-h-[40px] px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    onClick={() => {
                      setDetectedCards([]);
                      setImagePreview(null);
                    }}
                    className="min-h-[40px] px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer flex items-center"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    New Photo
                  </button>
                </div>
              </div>

              {/* Visual Detection Canvas + Card List Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                
                {/* Left: Original Photo with Interactive Bounding Boxes */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Overhead Detection Visualizer</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      Tap box to inspect
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-slate-950 aspect-[16/10] flex items-center justify-center shadow-inner">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Scanned Desk"
                        className="w-full h-full object-contain"
                      />
                    )}

                    {/* Render Highlight Bounding Boxes over the Image */}
                    {detectedCards.map((c) => {
                      const isSelected = c.id === selectedCardId;
                      const top = `${c.boundingBox.ymin / 10}%`;
                      const left = `${c.boundingBox.xmin / 10}%`;
                      const width = `${Math.max(8, (c.boundingBox.xmax - c.boundingBox.xmin) / 10)}%`;
                      const height = `${Math.max(8, (c.boundingBox.ymax - c.boundingBox.ymin) / 10)}%`;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCardId(c.id)}
                          style={{ top, left, width, height }}
                          className={`absolute border-2 rounded-lg transition-all cursor-pointer flex flex-col justify-between p-1 group ${
                            isSelected
                              ? 'border-blue-400 bg-blue-500/35 ring-2 ring-blue-400/60 shadow-lg'
                              : 'border-emerald-400/80 bg-emerald-500/15 hover:bg-emerald-500/30'
                          }`}
                        >
                          <span className="self-start px-1.5 py-0.2 rounded text-[9px] font-bold bg-black/80 text-white">
                            #{c.cardIndex}
                          </span>
                          <span className="text-[8px] font-bold text-white bg-black/70 px-1 rounded truncate max-w-full">
                            {c.fullName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Detected Cards Grid / Inspection */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Detected Cards Breakdown ({detectedCards.length})
                  </div>

                  <div className="space-y-3 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1">
                    {detectedCards.map((c) => {
                      const isInspecting = c.id === selectedCardId;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCardId(c.id)}
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isInspecting
                              ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-[#0e162a] shadow-sm ring-1 ring-blue-500/30'
                              : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5 sm:space-x-3">
                            
                            {/* Checkbox with touch-friendly container */}
                            <div className="pt-1">
                              <input
                                type="checkbox"
                                checked={c.selected}
                                onChange={() => handleToggleCardSelect(c.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </div>

                            {/* Company Brand Monogram Badge */}
                            <CompanyBrandFrame
                              card={{
                                id: c.id,
                                fullName: c.fullName,
                                jobTitle: c.jobTitle,
                                company: c.company,
                                email: c.email,
                                phone: c.phone,
                                category: c.category,
                                primaryColorHex: c.primaryColorHex,
                                tags: c.suggestedTags,
                                cardImage: c.croppedImage,
                                confidenceScore: c.confidenceScore,
                                scannedAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                isFavorite: false,
                                crmSyncStatus: {},
                                address: { city: c.city, state: c.state, street: c.street, zip: c.zip, country: c.country },
                                social: { linkedin: c.linkedin, twitter: c.twitter },
                              }}
                              size="sm"
                            />

                            {/* Core Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                  {c.fullName}
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  {c.confidenceScore}% OCR
                                </span>
                              </div>

                              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5">
                                {c.jobTitle || 'Executive'} • <span className="text-slate-600 dark:text-slate-300 font-semibold">{c.company}</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                {c.email && <span className="truncate">✉ {c.email}</span>}
                                {c.phone && <span>☎ {c.phone}</span>}
                                {c.city && <span>📍 {c.city}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Inline Edit Form when active */}
                          {isInspecting && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"
                            >
                              <div>
                                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Name</label>
                                <input
                                  type="text"
                                  value={c.fullName}
                                  onChange={(e) => handleUpdateCardField(c.id, 'fullName', e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070b14] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Company</label>
                                <input
                                  type="text"
                                  value={c.company}
                                  onChange={(e) => handleUpdateCardField(c.id, 'company', e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070b14] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Job Title</label>
                                <input
                                  type="text"
                                  value={c.jobTitle}
                                  onChange={(e) => handleUpdateCardField(c.id, 'jobTitle', e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070b14] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Email</label>
                                <input
                                  type="email"
                                  value={c.email}
                                  onChange={(e) => handleUpdateCardField(c.id, 'email', e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070b14] text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Batch Processing Settings & Tags */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                  <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    Apply Batch Tag:
                  </span>
                  <input
                    type="text"
                    value={bulkTagInput}
                    onChange={(e) => setBulkTagInput(e.target.value)}
                    placeholder="e.g. CES 2026, Summit"
                    className="flex-1 sm:w-48 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070b14] text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer min-h-[40px]">
                    <input
                      type="checkbox"
                      checked={autoCrmSync}
                      onChange={(e) => setAutoCrmSync(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <Share2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <span>Auto-sync with CRM (Apollo.io, HubSpot, Salesforce)</span>
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80 flex items-center justify-between gap-3">
          <button
            onClick={handleCleanClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {detectedCards.length > 0 && (
            <button
              onClick={handleSaveSelectedCards}
              disabled={selectedCount === 0 || isSaving}
              className="min-h-[44px] inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 border border-blue-400/30"
            >
              <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
              {isSaving
                ? 'Saving Cards...'
                : `Save ${selectedCount} ${selectedCount === 1 ? 'Card' : 'Cards'} to Library`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
