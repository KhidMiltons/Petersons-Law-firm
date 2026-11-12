import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Check,
  FlipHorizontal,
  Upload,
  AlertCircle,
  ShieldCheck,
  SwitchCamera,
} from 'lucide-react';
import { Advocate } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface ProfilePhotoCaptureModalProps {
  advocate: Advocate;
  currentPhotoUrl?: string;
  onSavePhoto: (advocateId: string, dataUrl: string) => void;
  onClose: () => void;
}

export const ProfilePhotoCaptureModal: React.FC<ProfilePhotoCaptureModalProps> = ({
  advocate,
  currentPhotoUrl,
  onSavePhoto,
  onClose,
}) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraState, setCameraState] = useState<'starting' | 'live' | 'captured' | 'error'>('starting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mirrored, setMirrored] = useState<boolean>(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      stopStream();
      setCameraState('starting');
      setErrorMessage('');
      setCapturedDataUrl(null);

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraState('error');
        setErrorMessage(
          language === 'sw'
            ? 'Kivinjari hiki hakina uwezo wa kufikia kamera moja kwa moja. Unaweza kupakia picha kutoka kwenye kifaa chako.'
            : 'Camera access is not supported in this browser context. You may upload a headshot image below.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 720 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (navigator.mediaDevices.enumerateDevices) {
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter((d) => d.kind === 'videoinput');
            setHasMultipleCameras(videoInputs.length > 1);
          } catch {
            // Ignore enumerateDevices errors
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            // Autoplay will resume via onLoadedMetadata
          });
        }
        setCameraState('live');
      } catch (err) {
        stopStream();
        setCameraState('error');
        const errName = err instanceof DOMException ? err.name : '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setErrorMessage(
            language === 'sw'
              ? 'Ruhusa ya kamera imekataliwa. Tafadhali ruhusu kamera kwenye mipangilio ya kivinjari kisha ujaribu tena, au pakia picha.'
              : 'Camera permission was denied. Please enable camera access in your browser permissions and retry, or upload an image file below.'
          );
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setErrorMessage(
            language === 'sw'
              ? 'Hakuna kamera iliyopatikana kwenye kifaa hiki. Unaweza kupakia picha ya wasifu hapa chini.'
              : 'No active camera device was detected. You can upload a headshot portrait directly from your device below.'
          );
        } else {
          setErrorMessage(
            language === 'sw'
              ? 'Imeshindwa kuwasha kamera. Tafadhali jaribu tena au pakia picha kutoka kwenye kifaa chako.'
              : 'Unable to initialize camera feed. Retry camera access or upload a portrait image below.'
          );
        }
      }
    },
    [language, stopStream]
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
    };
  }, [facingMode, startCamera, stopStream]);

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 640;
    const size = Math.min(vw, vh);
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (mirrored && facingMode === 'user') {
      ctx.translate(outputSize, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, size, size, 0, 0, outputSize, outputSize);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedDataUrl(dataUrl);
    setCameraState('captured');
    stopStream();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const outputSize = 512;
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopStream();
        setCapturedDataUrl(dataUrl);
        setCameraState('captured');
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmSave = () => {
    if (!capturedDataUrl) return;
    stopStream();
    onSavePhoto(advocate.id, capturedDataUrl);
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-photo-heading"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0D131F] border border-[#DFD4C1] dark:border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-6 py-4 bg-[#F6F1E6] dark:bg-[#121927] border-b border-[#E4DCCF] dark:border-[#222E46] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#8C6B32] dark:text-[#C5A880] shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] block">
                {language === 'sw' ? 'Studio ya Picha ya Ofisi' : 'Chambers Portrait Studio'}
              </span>
              <h3
                id="capture-photo-heading"
                className="text-base font-cinzel font-bold text-[#121A28] dark:text-white truncate"
              >
                {advocate.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close camera modal"
            className="p-2 text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white rounded-lg hover:bg-[#E8E0D1] dark:hover:bg-[#1A2538] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Preview Viewport */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="text-xs text-[#4A576D] dark:text-[#9BA5B7] flex items-center justify-between gap-2 flex-wrap">
            <span>{advocate.title}</span>
            <span className="font-mono text-[11px] text-[#8C6B32] dark:text-[#C5A880]">
              {advocate.rollNumber}
            </span>
          </div>

          {/* 1:1 Portrait Frame */}
          <div className="relative mx-auto w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-[#0A0E17] border-2 border-[#C5A880]/40 shadow-inner flex items-center justify-center">
            {cameraState === 'starting' && (
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <div className="w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-[#E4C999]">
                  {language === 'sw' ? 'Inawasha kamera...' : 'Initializing camera feed...'}
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                cameraState === 'live' ? 'block' : 'hidden'
              } ${mirrored && facingMode === 'user' ? '-scale-x-100' : ''}`}
            />

            {cameraState === 'live' && (
              <>
                {/* Subtle circular portrait framing guide */}
                <div
                  className="pointer-events-none absolute inset-4 rounded-full border border-dashed border-[#C5A880]/55 shadow-[0_0_0_9999px_rgba(8,11,17,0.35)]"
                  aria-hidden="true"
                />
                <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-black/70 border border-[#C5A880]/40 text-[10px] font-mono text-[#E4C999] tracking-wider uppercase whitespace-nowrap">
                  {language === 'sw' ? 'Weka uso katikati' : 'Align Headshot Center'}
                </span>
              </>
            )}

            {cameraState === 'captured' && capturedDataUrl && (
              <img
                src={capturedDataUrl}
                alt={`Captured headshot preview for ${advocate.name}`}
                className="w-full h-full object-cover"
              />
            )}

            {cameraState === 'error' && (
              <div className="p-6 text-center space-y-3">
                {currentPhotoUrl ? (
                  <img
                    src={currentPhotoUrl}
                    alt={advocate.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto border border-[#C5A880]/50 opacity-75"
                  />
                ) : (
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                )}
                <p className="text-xs text-[#CBD5E1] leading-relaxed">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Offscreen canvas used for square cropping */}
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

          {/* Camera Toolbar Controls */}
          {cameraState === 'live' && (
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setMirrored((prev) => !prev)}
                className="px-3 py-2 rounded-xl bg-[#F5EFE4] dark:bg-[#141C2B] border border-[#E4DCCF] dark:border-[#233148] text-xs font-medium text-[#4A576D] dark:text-[#BAC5D6] hover:border-[#C5A880] flex items-center gap-1.5 cursor-pointer"
                title="Mirror camera preview horizontally"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                <span>{language === 'sw' ? 'Geuza' : 'Mirror'}</span>
              </button>

              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={() =>
                    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                  }
                  className="px-3 py-2 rounded-xl bg-[#F5EFE4] dark:bg-[#141C2B] border border-[#E4DCCF] dark:border-[#233148] text-xs font-medium text-[#4A576D] dark:text-[#BAC5D6] hover:border-[#C5A880] flex items-center gap-1.5 cursor-pointer"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                  <span>{language === 'sw' ? 'Badili Kamera' : 'Switch Camera'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCapturePhoto}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#B89047] text-[#080B11] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C5A880]/20 hover:brightness-110 flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'sw' ? 'Piga Picha' : 'Capture Photo'}</span>
              </button>
            </div>
          )}

          {cameraState === 'captured' && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2.5 rounded-xl bg-[#F5EFE4] dark:bg-[#141C2B] border border-[#E4DCCF] dark:border-[#233148] text-xs font-semibold text-[#121A28] dark:text-white hover:border-[#C5A880] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                <span>{language === 'sw' ? 'Piga Tena' : 'Retake Photo'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#B89047] text-[#080B11] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C5A880]/20 hover:brightness-110 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'sw' ? 'Hifadhi Picha' : 'Save Headshot'}</span>
              </button>
            </div>
          )}

          {cameraState === 'error' && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2.5 rounded-xl bg-[#F5EFE4] dark:bg-[#141C2B] border border-[#C5A880]/40 text-xs font-semibold text-[#8C6B32] dark:text-[#E4C999] hover:bg-[#C5A880] hover:text-[#0A0E17] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Jaribu Kamera Tena' : 'Retry Camera'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#0A0E17] text-xs font-bold uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Pakia Picha' : 'Upload Portrait File'}</span>
              </button>
            </div>
          )}

          {/* Subtle alternative file upload always accessible for desktop flexibility */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="pt-3 border-t border-[#E4DCCF] dark:border-[#1E2638] flex items-center justify-between gap-2 text-[11px] text-[#5C6A80] dark:text-[#8C98AE]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] shrink-0" />
              <span>
                {language === 'sw'
                  ? 'Picha huhifadhiwa kwenye kivinjari chako pekee.'
                  : 'Captured headshots are stored locally on your device.'}
              </span>
            </div>

            {cameraState !== 'error' && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-medium text-[#8C6B32] dark:text-[#C5A880] hover:underline whitespace-nowrap cursor-pointer"
              >
                {language === 'sw' ? 'Au pakia picha' : 'Or upload file'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
