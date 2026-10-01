import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  SwitchCamera, 
  Zap, 
  CheckCircle, 
  FileImage, 
  ShieldAlert, 
  Loader2, 
  Video, 
  ShieldX,
  Play
} from 'lucide-react';
import { WasteAnalysisResult, UserProfile } from '../types';
import { ClassificationResult } from './ClassificationResult';
import { useLanguage } from '../i18n/LanguageContext';

interface ScanWasteProps {
  onScanCompleted: (record: any) => void;
  onNavigateHistory: () => void;
  initialPreset?: string | null;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onNavigateMap?: (category?: string) => void;
}

type CameraState = 'initial' | 'loading' | 'ready' | 'permission_denied' | 'error' | 'captured';

export const ScanWaste: React.FC<ScanWasteProps> = ({ 
  onScanCompleted, 
  onNavigateHistory,
  initialPreset,
  currentUser,
  onOpenAuthModal,
  onNavigateMap
}) => {
  const { t, language, isRTL, translateCategory, translateDynamicText } = useLanguage();
  const [activeMode, setActiveMode] = useState<'upload' | 'camera'>('upload');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleTag, setSampleTag] = useState<string | undefined>(undefined);
  
  // Real Camera States
  const [cameraState, setCameraState] = useState<CameraState>('initial');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<WasteAnalysisResult | null>(null);
  const [lastSavedRecordId, setLastSavedRecordId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded Presets definition covering all key material streams
  const presetSamples = [
    {
      id: 'plastic',
      name: 'Plastic Bottle',
      category: 'plastic',
      icon: '♻️',
      url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'paper',
      name: 'Cardboard Box',
      category: 'paper',
      icon: '📄',
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'metal',
      name: 'Soda Can',
      category: 'metal',
      icon: '🔩',
      url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'organic',
      name: 'Banana Peel',
      category: 'organic',
      icon: '🍃',
      url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'glass',
      name: 'Glass Jar',
      category: 'glass',
      icon: '🍾',
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'e_waste',
      name: 'Old Phone (E-Waste)',
      category: 'e_waste',
      icon: '🔌',
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'textile',
      name: 'T-Shirt (Textile)',
      category: 'textile',
      icon: '👕',
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'battery',
      name: 'AA Battery',
      category: 'battery',
      icon: '🔋',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'hazardous',
      name: 'Paint Can (Hazardous)',
      category: 'hazardous',
      icon: '⚠️',
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'poor_quality',
      name: 'Blurry Photo (Quality Check)',
      category: 'poor_quality',
      icon: '⚠️',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'non_waste',
      name: 'Pet Cat (Non-Waste Test)',
      category: 'non_waste',
      icon: '🚫',
      url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=700&q=80',
    },
  ];

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop error
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, []);

  // Handle preset selection
  const handlePresetSelect = (preset: typeof presetSamples[0]) => {
    stopCamera();
    setCameraState('initial');
    setActiveMode('upload');
    setImageSrc(preset.url);
    setSelectedFile(null);
    setSampleTag(preset.id);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  useEffect(() => {
    if (initialPreset) {
      const match = presetSamples.find(p => p.id === initialPreset);
      if (match) {
        handlePresetSelect(match);
      }
    }
  }, [initialPreset]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Real Camera Management
  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setCameraState('loading');
    setIsCameraReady(false);

    // Verify secure context (HTTPS or localhost)
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (typeof window !== 'undefined' && !window.isSecureContext && !isLocal) {
      const secureMsg = 'Camera access requires a secure connection. Please use HTTPS or localhost.';
      setCameraError(secureMsg);
      setCameraState('error');
      console.error('Camera initialization failed:', secureMsg);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const unsupportedMsg = 'Camera access is not supported by your current browser. Please upload an image file instead.';
      setCameraError(unsupportedMsg);
      setCameraState('error');
      console.error('Camera initialization failed:', unsupportedMsg);
      return;
    }

    console.log('Requesting camera permission...');

    try {
      let stream: MediaStream;

      try {
        // Preferred constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (idealErr) {
        console.warn('Ideal constraints failed, attempting fallback to video: true', idealErr);
        // Fallback constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      console.log('Camera permission granted.');
      console.log('Camera stream received.');
      streamRef.current = stream;

      // Verify that the video track is live
      const videoTracks = stream.getVideoTracks();
      if (!videoTracks || videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
        throw new Error('No live video track available in camera stream.');
      }

      setCameraState('ready');

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Camera stream attached.');
        try {
          await videoRef.current.play();
          console.log('Video playback started.');
        } catch (playErr) {
          console.warn('Auto play waiting for metadata:', playErr);
        }
      }
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      let userFriendlyError = 'Unable to access the camera. Please try again.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userFriendlyError = 'Camera permission was denied. Please allow camera access in your browser settings and try again.';
        setCameraState('permission_denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userFriendlyError = 'No camera was found on this device.';
        setCameraState('error');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userFriendlyError = 'The camera is currently being used by another application. Close other camera-using applications and try again.';
        setCameraState('error');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        userFriendlyError = 'The requested camera configuration is unavailable. Trying another camera configuration...';
        setCameraState('error');
      } else if (err.name === 'SecurityError') {
        userFriendlyError = 'Camera access is blocked by the browser or device security settings.';
        setCameraState('error');
      } else {
        setCameraState('error');
      }

      setCameraError(userFriendlyError);
    }
  };

  // Ensure stream stays bound to video ref when state is ready
  useEffect(() => {
    if (cameraState === 'ready' && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        console.log('Camera stream attached via sync effect.');
        videoRef.current.play().then(() => {
          console.log('Video playback started.');
        }).catch(err => {
          console.warn('Playback error in sync effect:', err);
        });
      }
    }
  }, [cameraState]);

  // Video loaded metadata handler
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight, readyState } = videoRef.current;
      console.log(`Camera dimensions: ${videoWidth}x${videoHeight} (readyState: ${readyState})`);
      if (videoWidth > 0 && videoHeight > 0) {
        setIsCameraReady(true);
      }
    }
  };

  // Capture real frame from video using canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Camera video frame not fully ready yet.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageSrc(dataUrl);
      setSelectedFile(null);
      setSampleTag(undefined);
      setCameraState('captured');
      stopCamera();
    }
  };

  // Flip camera between front and back
  const switchCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraState === 'ready' || cameraState === 'loading') {
      await startCamera(nextMode);
    }
  };

  // File Upload Handlers
  const handleFileChange = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image file is too large (max 20MB). Please select a smaller photo.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setSampleTag(undefined);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Convert image URL to base64 if needed
  const prepareBase64 = async (src: string): Promise<string> => {
    if (src.startsWith('data:')) {
      return src;
    }
    const response = await fetch(src);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Run Waste Analysis
  const runAnalysis = async () => {
    if (!imageSrc) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(1);

    const stepTimer1 = setTimeout(() => setAnalysisStep(2), 500);
    const stepTimer2 = setTimeout(() => setAnalysisStep(3), 1100);

    try {
      const base64Data = await prepareBase64(imageSrc);

      const token = localStorage.getItem('smartwaste-auth-token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/analyze-waste', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          image: base64Data,
          sampleTag,
          userId: currentUser?.id,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze waste image');
      }

      setAnalysisResult(data.result);
      if (data.savedRecord) {
        setLastSavedRecordId(data.savedRecord.id);
        onScanCompleted(data.savedRecord);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Something went wrong while analyzing the image. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
    }
  };

  // Reset scan
  const handleReset = () => {
    setImageSrc(null);
    setSelectedFile(null);
    setSampleTag(undefined);
    setAnalysisResult(null);
    setLastSavedRecordId(null);
    setErrorMsg(null);
    setCameraState('initial');
    stopCamera();
  };

  // Render Result Screen if analysis is done
  if (analysisResult && imageSrc) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ClassificationResult
          result={analysisResult}
          imageSrc={imageSrc}
          scanRecordId={lastSavedRecordId}
          onReset={handleReset}
          onViewHistory={onNavigateHistory}
          onNavigateMap={onNavigateMap}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Title & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('scan.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('scan.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          {t('scan.subtitle')}
        </p>

        {currentUser ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('scan.scanningAs', { name: currentUser.name })}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <span>{t('common.guest')}.</span>
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t('scan.signInPrompt')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs (Only when not viewing an image) */}
      {!imageSrc && (
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setActiveMode('upload');
                stopCamera();
                setCameraState('initial');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{t('scan.optionUpload')}</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('camera');
                if (cameraState === 'initial' || cameraState === 'error') {
                  startCamera();
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeMode === 'camera'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{t('scan.optionCamera')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Error Banner if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold">Notice:</strong> {errorMsg}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* OPTION 2: LIVE CAMERA INTERFACE */}
        {!imageSrc && activeMode === 'camera' && (
          <div className="space-y-6">
            
            {/* Viewfinder Container */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-4/3 max-h-[500px] w-full flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
              
              {/* REAL LIVE VIDEO ELEMENT - Always Mounted so srcObject can bind cleanly */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoLoadedMetadata}
                onCanPlay={handleVideoLoadedMetadata}
                className={`w-full h-full object-cover block relative z-0 ${
                  cameraState === 'ready' ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Viewfinder Overlay Frame (Visible when ready) */}
              {cameraState === 'ready' && (
                <div className="absolute inset-4 sm:inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none z-10 flex flex-col justify-between p-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono font-bold bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
                      {t('scan.liveCamera')}
                    </span>
                    <button
                      type="button"
                      onClick={switchCameraFacing}
                      className="pointer-events-auto p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 transition cursor-pointer"
                      title={t('scan.flipCamera')}
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-semibold text-white bg-slate-950/70 border border-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
                      {t('scan.positionItem')}
                    </span>
                  </div>
                </div>
              )}

              {/* State UI Overlays for Loading, Permission, or Initial */}
              {cameraState === 'loading' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-3 bg-slate-950/90 text-white p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">{t('scan.startingCamera')}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {t('scan.requestingPermission')}
                    </p>
                  </div>
                </div>
              )}

              {cameraState === 'permission_denied' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 bg-slate-950/95 text-white p-6 text-center max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base">{t('scan.permissionRequired')}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {cameraError || t('scan.permissionDenied')}
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    {t('scan.tryAgain')}
                  </button>
                </div>
              )}

              {cameraState === 'error' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 bg-slate-950/95 text-white p-6 text-center max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base">{t('scan.cameraUnavailable')}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {cameraError || t('scan.cameraErrorMsg')}
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    {t('scan.retryCamera')}
                  </button>
                </div>
              )}

              {cameraState === 'initial' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 bg-slate-950 text-white p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base">{t('scan.cameraNotStarted')}</h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                      {t('scan.cameraNotStartedMsg')}
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera()}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t('scan.enableCamera')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera Control Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {cameraState === 'ready' && (
                <button
                  onClick={capturePhoto}
                  disabled={!isCameraReady}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>{isCameraReady ? t('scan.captureWaste') : t('scan.startingCamera')}</span>
                </button>
              )}

              {cameraState === 'loading' && (
                <button
                  disabled
                  className="flex-1 py-4 px-6 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('scan.startingCamera')}</span>
                </button>
              )}

              {(cameraState === 'permission_denied' || cameraState === 'error') && (
                <button
                  onClick={() => startCamera()}
                  className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('scan.retryCamera')}</span>
                </button>
              )}

              {cameraState === 'initial' && (
                <button
                  onClick={() => startCamera()}
                  className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('scan.enableCamera')}</span>
                </button>
              )}

              <button
                onClick={() => {
                  stopCamera();
                  setActiveMode('upload');
                }}
                className="py-4 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {t('scan.switchToFile')}
              </button>
            </div>
          </div>
        )}

        {/* OPTION 1: FILE UPLOAD INTERFACE */}
        {!imageSrc && activeMode === 'upload' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm border border-emerald-200 dark:border-emerald-800">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('scan.uploadTitle')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm">
                {t('scan.dragDrop')}
              </p>

              <div className="mt-5 flex items-center gap-2.5">
                <span className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 transition">
                  {t('scan.browse')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMode('camera');
                    startCamera();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('scan.useCamera')}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-5 uppercase tracking-wider font-semibold">
                {t('scan.formats')}
              </p>
            </div>
          </div>
        )}

        {/* IMAGE PREVIEW & ANALYZE STAGE (AFTER CAPTURE OR UPLOAD) */}
        {imageSrc && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('scan.targetImage')}
                </span>
                {cameraState === 'captured' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {t('scan.capturedViaCamera')}
                  </span>
                )}
                {sampleTag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                    {t('scan.demoPreset')}
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('scan.removeRetake')}</span>
              </button>
            </div>

            {/* Preview Display */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-16/10 max-h-[420px] flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
              <img
                src={imageSrc}
                alt="Target waste"
                className="w-full h-full object-contain"
              />

              {/* Scanning Laser Animation during Analysis */}
              {isAnalyzing && (
                <>
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px]" />
                  <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10B981] animate-scanline" />
                  
                  <div className="absolute inset-8 border border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                        MULTIMODAL TENSOR INGESTION
                      </span>
                      <span className="text-[11px] font-mono text-emerald-300 animate-pulse">
                        PROCESSING...
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Step Progress Feedback */}
            {isAnalyzing && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>
                      {analysisStep === 1 && t('scan.step1')}
                      {analysisStep === 2 && t('scan.step2')}
                      {analysisStep >= 3 && t('scan.step3')}
                    </span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {t('scan.stepCount', { step: analysisStep })}
                  </span>
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900/60 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(analysisStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t('scan.analyzingWaste')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{t('scan.analyzeWaste')}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="py-4 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50 cursor-pointer"
              >
                {t('scan.retakePhoto')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Test Demo Presets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {t('scan.samplePresets')}
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('scan.sampleSubtitle')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {presetSamples.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`p-3 rounded-2xl border bg-white dark:bg-slate-900 text-left transition hover:shadow-md cursor-pointer flex flex-col justify-between space-y-2 group ${
                sampleTag === preset.id
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
              }`}
            >
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 text-sm bg-white/90 dark:bg-slate-900/90 rounded px-1 shadow-xs">
                  {preset.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {translateDynamicText(preset.name) || preset.name}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">
                  {translateCategory(preset.category)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
