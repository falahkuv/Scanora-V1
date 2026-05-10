import { useState, useEffect, useRef } from 'react';
import { X, HelpCircle, ImageIcon, RefreshCw, Zap, ZapOff, CheckCircle, ChevronUp, ChevronDown, Check, Camera } from 'lucide-react';
import api from '../api';

const ScannerSheet = ({ isOpen, onClose }) => {
  const [scanState, setScanState] = useState('camera');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [touchStartLoc, setTouchStartLoc] = useState(null);
  const [touchEndLoc, setTouchEndLoc] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
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
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const processBlob = async (blob) => {
    setScanState('scanning');
    stopCamera();

    const formData = new FormData();
    formData.append('file', blob, 'scan.jpg');

    try {
      const response = await api.post('/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setResult(response.data.data);
        setScanState('half-result');
      } else {
        setErrorMsg(response.data.message || 'Gagal memindai');
        setScanState('half-result');
      }
    } catch (err) {
      console.error('API error:', err);
      setErrorMsg('Koneksi ke AI gagal. Pastikan server FastAPI menyala.');
      setScanState('half-result');
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
  };

  const handleSaveToInventory = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);

    try {
      await api.post('/inventory', {
        fruit_type: result.fruit_type,
        condition: result.condition,
        scan_id: result.scan_id,
        reminder_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
      setScanState('camera');
      setCapturedImage(null);
      setResult(null);
      startCamera();
      setToastMsg(`Berhasil disimpan: ${result.fruit_type.charAt(0).toUpperCase() + result.fruit_type.slice(1)} ${getFruitEmoji(result.fruit_type)}`);
      setTimeout(() => setToastMsg(''), 3000);
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
    if (distance > 50 && scanState === 'half-result') {
      setScanState('full-result');
    } else if (distance < -50 && scanState === 'full-result') {
      setScanState('half-result');
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
    if (c === 'ripe') return { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', stroke: '#f59e0b' };
    if (c === 'rotten') return { text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', stroke: '#ef4444' };
    return { text: 'text-gray-700', bg: 'bg-gray-50', dot: 'bg-gray-500', stroke: '#10b981' };
  };

  const condColor = getConditionColor(result?.condition);
  const scoreValue = typeof result?.freshness_score === 'number' ? result.freshness_score : 0;
  const scoreRatio = Math.max(0, Math.min(1, scoreValue / 100));
  const dashOffset = 283 - (scoreRatio * 283);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black max-w-md mx-auto overflow-hidden">
      {/* Hidden gallery file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryChange}
      />

      {/* Camera Viewport */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`object-cover w-full h-full ${scanState !== 'camera' && scanState !== 'scanning' ? 'hidden' : ''} ${capturedImage ? 'hidden' : ''}`}
          />
          {capturedImage && (
            <img src={capturedImage} alt="Captured" className="object-cover w-full h-full absolute inset-0 z-0" />
          )}

          {/* Viewfinder + Hint Label */}
          {scanState === 'camera' && !errorMsg && !capturedImage && (
            <>
              <div 
                className="absolute w-72 h-72 z-10 pointer-events-none rounded-[2.5rem]" 
                style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)' }}
              >
                <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.9))' }} viewBox="0 0 288 288" fill="none">
                  <path d="M 3 64 L 3 40 Q 3 3 40 3 L 64 3" stroke="white" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 285 64 L 285 40 Q 285 3 248 3 L 224 3" stroke="white" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 3 224 L 3 248 Q 3 285 40 285 L 64 285" stroke="white" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 285 224 L 285 248 Q 285 285 248 285 L 224 285" stroke="white" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
              {/* Hint label below viewfinder */}
              <div className="absolute z-10 pointer-events-none" style={{ top: 'calc(50% + 160px)' }}>
                <p className="text-white/90 text-xs font-medium bg-black/60 backdrop-blur-md px-5 py-2 rounded-full">
                  Arahkan ke buah
                </p>
              </div>
            </>
          )}

          {/* Scanning overlay */}
          {scanState === 'scanning' && (
            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-scanora-green border-t-transparent rounded-full animate-spin"></div>
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
             <img src="/logo.png?v=2" alt="Scanora" style={{ height: '64px' }} className="object-contain drop-shadow-md" />
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
              onClick={() => {}}
              disabled={scanState === 'scanning'}
              className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-black/60 active:scale-95 transition-all"
              title="Ganti Kamera"
            >
              <RefreshCw size={28} />
            </button>
          </div>
        )}

        {/* Toast Message */}
        {toastMsg && (
          <div className="absolute top-24 left-0 right-0 flex justify-center z-50 animate-bounce">
            <div className="bg-white text-gray-800 px-6 py-3 rounded-full text-sm font-semibold shadow-2xl flex items-center gap-2 border border-gray-100">
              <CheckCircle className="text-scanora-green" size={20} /> {toastMsg}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Results */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`bg-white rounded-t-3xl transition-all duration-300 ease-in-out absolute bottom-0 left-0 right-0 max-w-md mx-auto flex flex-col z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] ${scanState === 'half-result' ? 'h-[45%]' :
        scanState === 'full-result' ? 'h-[85%]' :
          'h-0 opacity-0 pointer-events-none'
        }`}>

        {/* Drag Handle */}
        <div
          className="w-full flex justify-center pt-3 pb-2 cursor-pointer"
          onClick={() => setScanState(prev => prev === 'half-result' ? 'full-result' : 'half-result')}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          {errorMsg && scanState !== 'camera' && scanState !== 'scanning' ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <X size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memindai</h2>
              <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setErrorMsg(''); setScanState('camera'); setCapturedImage(null); startCamera(); }}
                  className="px-5 py-2 bg-gray-100 rounded-full text-gray-700 font-medium text-sm"
                >
                  Coba Kamera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 bg-scanora-green text-white rounded-full font-medium text-sm flex items-center gap-1"
                >
                  <ImageIcon size={14} /> Galeri
                </button>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Half View */}
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-24 h-24 mb-4 relative">
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

                <h2 className="text-2xl font-bold text-gray-900 capitalize">{result.fruit_type}</h2>
                <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full font-semibold text-sm uppercase ${condColor.bg} ${condColor.text}`}>
                  <span className={`w-2 h-2 rounded-full ${condColor.dot}`}></span>
                  {result.condition}
                </div>

                {scanState === 'half-result' && (
                  <button
                    onClick={() => setScanState('full-result')}
                    className="mt-5 flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-scanora-green transition-colors"
                  >
                    Lihat Detail <ChevronUp size={16} />
                  </button>
                )}
              </div>

              {/* Full View */}
              <div className={`mt-6 transition-opacity duration-300 ${scanState === 'full-result' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2">💡 Informasi AI</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    AI kami mendeteksi <strong className="capitalize">{result.fruit_type}</strong> dengan kondisi <strong>{result.condition}</strong>.
                    Skor kesegaran: <strong>{Math.round(scoreValue)}%</strong>.
                    {result.condition === 'ripe' && ' Cocok untuk segera dikonsumsi atau diolah hari ini!'}
                    {result.condition === 'rotten' && ' Sayangnya buah ini sudah tidak layak konsumsi.'}
                    {result.condition === 'unripe' && ' Simpan dalam suhu ruangan agar cepat matang.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setScanState('half-result')}
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
  );
};

export default ScannerSheet;
