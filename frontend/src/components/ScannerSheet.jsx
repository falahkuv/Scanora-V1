import { useState, useEffect, useRef } from 'react';
import { X, HelpCircle, ImageIcon, RefreshCw, Zap, ZapOff, CheckCircle, CircleX, ChevronDown, Check, Camera } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import api from '../api';
import { getCachedSuggestion, saveSuggestionToCache } from '../lib/aiSuggestionCache';

const ScannerSheet = ({ isOpen, onClose }) => {
  const [scanState, setScanState] = useState('camera');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: 'success', show: false });
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const closeCard = () => {
    setScanState('closing');
    setTimeout(() => {
      setScanState('camera');
      setResult(null);
      setCapturedImage(null);
      setAiSuggestion('');
      setIsLoadingTips(false);
      startCamera();
    }, 300);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  const [facingMode, setFacingMode] = useState('environment');

  const [touchStartLoc, setTouchStartLoc] = useState(null);
  const [touchEndLoc, setTouchEndLoc] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;

      // Check flash/torch support
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      if (capabilities?.torch) {
        setFlashSupported(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setErrorMsg('Kamera tidak dapat diakses. Coba upload foto dari galeri.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsFlashOn(false);
    setFlashSupported(false);
  };

  const toggleFlash = async () => {
    if (!streamRef.current || !flashSupported) return;
    const track = streamRef.current.getVideoTracks()[0];
    const newFlashState = !isFlashOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: newFlashState }] });
      setIsFlashOn(newFlashState);
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScanState('camera');
      setResult(null);
      setErrorMsg('');
      setCapturedImage(null);
      setAiSuggestion('');
      setIsLoadingTips(false);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const processBlob = async (blob) => {
    setScanState('scanning');
    setErrorMsg(''); // Fix: Clear previous errors when starting a new scan
    stopCamera();

    try {
      const options = {
        maxSizeMB: 0.2, // Compressed for faster upload speeds
        maxWidthOrHeight: 600,
        useWebWorker: true,
      };
      
      const fileToCompress = blob instanceof File ? blob : new File([blob], 'scan.jpg', { type: 'image/jpeg' });
      const compressedFile = await imageCompression(fileToCompress, options);

      const formData = new FormData();
      formData.append('file', compressedFile, 'scan.jpg');

      const response = await api.post('/scan', formData);

      if (response.data.success) {
        const data = response.data.data;
        const fruitType = data?.fruit_type?.toLowerCase() || '';
        const isValidFruit = ['apple', 'banana', 'orange', 'apel', 'pisang', 'jeruk'].includes(fruitType);
        if (!isValidFruit) {
          setResult(null);
          showToast('Objek tidak dikenali, silakan coba lagi.', 'error');
          setScanState('camera');
          setCapturedImage(null);
          startCamera();
          return;
        }
        setResult(data);
        setScanState('full-result');
      } else {
        setErrorMsg(response.data.message || 'Gagal memindai');
        setScanState('full-result');
      }
    } catch (err) {
      console.error('API or Compression error:', err);
      const apiMessage = err.response?.data?.message;
      
      if (apiMessage?.toLowerCase().includes("tidak dikenali")) {
        setResult(null);
        showToast('Objek tidak dikenali, silakan coba lagi.', 'error');
        setScanState('camera');
        setCapturedImage(null);
        startCamera();
      } else {
        setErrorMsg(apiMessage || 'Proses gagal. Pastikan server API menyala.');
        setScanState('full-result');
      }
    }
  };

  const fetchAiSuggestion = async (scanId, freshnessScore) => {
    // Optional: Check cache first even in ScannerSheet (though it's usually a new scan)
    const condition = result?.condition;
    const { suggestion, tierChanged } = getCachedSuggestion(scanId, freshnessScore, condition, undefined);
    if (suggestion && !tierChanged) {
      setAiSuggestion(suggestion);
      return;
    }

    setIsLoadingTips(true);
    setAiSuggestion('');
    try {
      const response = await api.post(`/scan/${scanId}/suggestion`, {
        freshness_score_latest: freshnessScore
      });
      if (response.data.success) {
        const newSuggestion = response.data.data.ai_suggestion;
        setAiSuggestion(newSuggestion);
        saveSuggestionToCache(scanId, newSuggestion, freshnessScore, condition, undefined);
      }
    } catch (err) {
      console.error('Failed to get AI suggestion', err);
      setAiSuggestion('Saran AI tidak tersedia saat ini.');
    } finally {
      setIsLoadingTips(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || scanState === 'scanning') return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setCapturedImage(url);
      processBlob(blob);
    }, 'image/jpeg', 0.8);
  };

  const handleGalleryChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedImage(url);
    processBlob(file);
    // Clear input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveToInventory = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);

    try {
      await api.post('/inventory', {
        fruit_type: result.fruit_type,
        condition: result.condition,
        scan_id: result.scan_id,
      });
      setScanState('camera');
      setCapturedImage(null);
      setResult(null);
      startCamera();
      showToast(`Berhasil disimpan: ${result.fruit_type.charAt(0).toUpperCase() + result.fruit_type.slice(1)} ${getFruitEmoji(result.fruit_type)}`, 'success');
      window.dispatchEvent(new Event('scanora:inventoryUpdated'));
    } catch (err) {
      console.error('Failed to save', err);
      alert('Gagal menyimpan ke inventori.');
    } finally {
      setIsSaving(false);
    }
  };

  const onTouchStart = (e) => {
    setTouchEndLoc(null);
    setTouchStartLoc(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => setTouchEndLoc(e.targetTouches[0].clientY);

  const onTouchEnd = () => {
    if (!touchStartLoc || !touchEndLoc) return;
    const distance = touchStartLoc - touchEndLoc;
    if (distance < -50 && scanState === 'full-result') {
      closeCard();
    }
  };

  if (!isOpen) return null;

  // Helpers
  const getFruitEmoji = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('pisang') || t.includes('banana')) return '🍌';
    if (t.includes('apel') || t.includes('apple')) return '🍎';
    if (t.includes('jeruk') || t.includes('orange')) return '🍊';
    return '🍎';
  };

  const getConditionColor = (condition) => {
    const c = condition?.toLowerCase() || '';
    if (c === 'ripe') return { text: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500', stroke: '#c25e00' };
    if (c === 'unripe') return { text: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500', stroke: '#22c55e' };
    if (c === 'rotten') return { text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', stroke: '#ef4444' };
    return { text: 'text-gray-700', bg: 'bg-gray-50', dot: 'bg-gray-500', stroke: '#9ca3af' };
  };

  const condColor = getConditionColor(result?.condition);
  const scoreValue = typeof result?.freshness_score === 'number' ? result.freshness_score : 0;
  const scoreRatio = Math.max(0, Math.min(1, scoreValue / 100));
  const dashOffset = 283 - (scoreRatio * 283);

  return (
    <div className="fixed inset-0 z-[999] flex justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col bg-black w-full lg:max-w-3xl h-full relative overflow-hidden shadow-2xl">
      {/* Hidden gallery file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryChange}
      />

      {/* Camera Viewport */}
      <div 
        className="flex-1 relative"
        onClick={() => {
          if (scanState === 'full-result') {
            closeCard();
          }
        }}
      >
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            className={`object-cover w-full h-full ${scanState !== 'camera' && scanState !== 'scanning' ? 'hidden' : ''} ${capturedImage ? 'hidden' : ''}`}
          />
          {capturedImage && (
            <img src={capturedImage} alt="Captured" className="object-cover w-full h-full absolute inset-0 z-0" />
          )}

          {/* Viewfinder + Hint Label */}
          {scanState === 'camera' && !errorMsg && !capturedImage && (
            <>
              {/* Dark overlay mask */}
              <div 
                className="absolute w-72 h-72 z-10 pointer-events-none rounded-[2.5rem]" 
                style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)', transform: 'translateY(-60px)' }}
              />
              {/* Glowing Outer Border */}
              <div className="absolute w-[304px] h-[304px] z-20 pointer-events-none" style={{ transform: 'translateY(-60px)' }}>
                <svg className="w-full h-full" style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,1)) drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} viewBox="0 0 304 304" fill="none">
                  <path d="M 8 72 L 8 44 Q 8 8 44 8 L 72 8" stroke="white" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 296 72 L 296 44 Q 296 8 260 8 L 232 8" stroke="white" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 8 232 L 8 260 Q 8 296 44 296 L 72 296" stroke="white" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 296 232 L 296 260 Q 296 296 260 296 L 232 296" stroke="white" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
              {/* Hint label below viewfinder */}
              <div className="absolute z-10 pointer-events-none" style={{ top: 'calc(50% + 100px)' }}>
                <p className="text-white/90 text-xs font-medium bg-black/60 backdrop-blur-md px-5 py-2 rounded-full">
                  Arahkan ke buah
                </p>
              </div>
            </>
          )}

          {/* Scanning overlay */}
          {scanState === 'scanning' && (
            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-16 h-16 text-scanora-green animate-spin" strokeWidth={1.5} />
              <p className="text-white font-medium animate-pulse">Menganalisis dengan AI...</p>
            </div>
          )}

          {/* Camera error fallback */}
          {errorMsg && scanState === 'camera' && (
            <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-8 text-center gap-4">
              <p className="text-white text-sm">{errorMsg}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium"
              >
                <ImageIcon size={16} /> Upload dari Galeri
              </button>
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 px-6 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-30">
          <button
            onClick={() => {
              if (scanState === 'half-result' || scanState === 'full-result' || scanState === 'scanning') {
                setScanState('camera');
                setResult(null);
                setCapturedImage(null);
                startCamera();
              } else {
                onClose();
              }
            }}
            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all"
          >
            <X size={24} />
          </button>

          <div className="flex items-center justify-center">
             <img src="/logo-long.png" alt="Scanora" className="h-20 object-contain drop-shadow-md" />
          </div>

          <button className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all">
            <HelpCircle size={24} />
          </button>
        </div>

        {/* Bottom Camera Controls */}
        {(scanState === 'camera' || scanState === 'scanning') && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-10 px-8 z-30">
            {/* Gallery Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanState === 'scanning'}
              className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-black/60 active:scale-95 transition-all"
              title="Pilih dari Galeri"
            >
              <ImageIcon size={28} />
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleCapture}
              disabled={scanState === 'scanning' || !!errorMsg}
              className="w-24 h-24 rounded-full border-4 border-white/50 flex items-center justify-center disabled:opacity-40"
            >
              <div className="w-20 h-20 bg-white rounded-full transition-transform active:scale-90 shadow-lg flex items-center justify-center">
                <Camera size={32} className="text-gray-400" />
              </div>
            </button>

            {/* Flip Camera Button */}
            <button
              onClick={() => {
                stopCamera();
                setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
              }}
              disabled={scanState === 'scanning'}
              className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-black/60 active:scale-95 transition-all"
              title="Ganti Kamera"
            >
              <RefreshCw size={28} />
            </button>
          </div>
        )}

        {/* Toast Message */}
        <div 
          className={`absolute left-0 right-0 flex justify-center z-50 transition-all duration-500 ease-in-out pointer-events-none ${
            toast.show 
              ? `opacity-100 ${toast.type === 'error' ? 'bottom-40 translate-y-0' : 'top-24 translate-y-0'}` 
              : `opacity-0 ${toast.type === 'error' ? 'bottom-40 translate-y-4' : 'top-24 -translate-y-4'}`
          }`}
        >
          {toast.msg && (
            <div className="bg-white text-gray-800 px-6 py-3 rounded-full text-sm font-semibold shadow-2xl flex items-center gap-2 border border-gray-100">
              {toast.type === 'success' ? <CheckCircle className="text-scanora-green" size={20} /> : <CircleX className="text-red-500" size={20} />} 
              {toast.msg}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet Results */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`bg-white rounded-t-3xl transition-all duration-300 ease-in-out absolute bottom-0 left-0 right-0 max-w-md mx-auto flex flex-col z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] ${
        scanState === 'full-result' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}>

        {/* Drag Handle */}
        <div
          className="w-full flex justify-center pt-4 pb-2 cursor-pointer"
          onClick={() => {
            if (scanState === 'full-result') closeCard();
          }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 flex-1 overflow-y-auto">
          {errorMsg && scanState !== 'camera' && scanState !== 'scanning' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <X size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memindai</h2>
              <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => { setErrorMsg(''); setScanState('camera'); setCapturedImage(null); startCamera(); }}
                  className="px-5 min-h-[44px] flex items-center justify-center bg-gray-100 rounded-full text-gray-700 font-medium text-sm"
                >
                  Coba Kamera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 min-h-[44px] bg-scanora-green text-white rounded-full font-medium text-sm flex items-center justify-center gap-1"
                >
                  <ImageIcon size={14} /> Galeri
                </button>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Top Row: Info and Icon */}
              <div className="flex items-center justify-between mt-2">
                {/* Left Col: Fruit Name & Ripeness */}
                <div className="flex flex-col text-left">
                  <h2 className="text-3xl font-bold text-gray-900 capitalize">{result.fruit_type}</h2>
                  <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full font-semibold w-fit text-sm uppercase ${condColor.bg} ${condColor.text}`}>
                    <span className={`w-2 h-2 rounded-full ${condColor.dot}`}></span>
                    {result.condition}
                  </div>
                </div>

                {/* Right Col: Freshness Score & Icon */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={condColor.stroke}
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">
                      {getFruitEmoji(result.fruit_type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full View */}
              <div className="mt-6">
                <div className="bg-green-50 rounded-2xl p-5 mb-6 border border-green-100">
                  <h3 className="font-semibold text-scanora-dark mb-3 flex items-center gap-2">💡 Saran AI Chef Scanora</h3>

                  {/* Belum diminta */}
                  {!aiSuggestion && !isLoadingTips && (
                    <button
                      onClick={() => fetchAiSuggestion(result.scan_id, result.freshness_score)}
                      className="w-full py-2.5 bg-white border border-green-200 text-green-700 font-semibold rounded-xl text-sm hover:bg-green-100 active:scale-95 transition-all"
                    >
                      Minta Saran AI ✨
                    </button>
                  )}

                  {/* Loading skeleton */}
                  {isLoadingTips && (
                    <div className="animate-pulse flex flex-col gap-2">
                      <div className="h-4 bg-green-200/50 rounded w-full" />
                      <div className="h-4 bg-green-200/50 rounded w-5/6" />
                      <div className="h-4 bg-green-200/50 rounded w-4/6" />
                    </div>
                  )}

                  {/* Hasil saran */}
                  {aiSuggestion && !isLoadingTips && (
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiSuggestion}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeCard}
                    className="flex-1 min-h-[44px] py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    <ChevronDown size={18} /> Tutup
                  </button>
                  <button
                    onClick={handleSaveToInventory}
                    disabled={isSaving}
                    className="flex-1 min-h-[44px] py-3.5 bg-scanora-green text-white font-semibold rounded-xl shadow-lg shadow-scanora-green/30 flex items-center justify-center gap-2 hover:bg-scanora-dark active:scale-95 transition-all disabled:opacity-70"
                  >
                    <Check size={18} />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ScannerSheet;
