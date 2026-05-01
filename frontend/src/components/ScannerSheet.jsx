import { useState, useEffect, useRef } from 'react';
import { X, Zap, ZapOff, Image as ImageIcon, ChevronUp, ChevronDown, Check } from 'lucide-react';
import api from '../api';

const ScannerSheet = ({ isOpen, onClose }) => {
  const [scanState, setScanState] = useState('camera');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);

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

    canvas.toBlob((blob) => processBlob(blob), 'image/jpeg', 0.8);
  };

  const handleGalleryChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      onClose();
    } catch (err) {
      console.error('Failed to save', err);
      alert('Gagal menyimpan ke inventori.');
    } finally {
      setIsSaving(false);
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
  const score = result?.freshness_score ?? 0;
  const dashOffset = 283 - (score * 283);

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
            className={`object-cover w-full h-full ${scanState !== 'camera' && scanState !== 'scanning' ? 'hidden' : ''}`}
          />

          {/* Viewfinder + Hint Label */}
          {scanState === 'camera' && !errorMsg && (
            <>
              <div className="absolute w-64 h-64 border-2 border-white/30 rounded-3xl z-10 pointer-events-none">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-3xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-3xl"></div>
              </div>
              {/* Hint label below viewfinder */}
              <div className="absolute z-10 pointer-events-none" style={{ top: 'calc(50% + 142px)' }}>
                <p className="text-white/80 text-xs font-medium bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
                  Arahkan ke buah: Apel, Jeruk, atau Pisang
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

        {/* Top Controls — pt-12 as notch-safe padding */}
        <div className="absolute top-0 left-0 right-0 px-6 pt-12 pb-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-30">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
          >
            <X size={20} />
          </button>

          {/* Flash button — only shown when flash is supported and camera is active */}
          {flashSupported && scanState === 'camera' && (
            <button
              onClick={toggleFlash}
              className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-colors ${isFlashOn ? 'bg-yellow-400 text-gray-900' : 'bg-black/40 text-white'
                }`}
            >
              {isFlashOn ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
            </button>
          )}
        </div>

        {/* Bottom Camera Controls */}
        {(scanState === 'camera' || scanState === 'scanning') && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-10 px-8 z-30">
            {/* Gallery Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanState === 'scanning'}
              className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-40 active:bg-white/20 transition-colors"
              title="Upload dari Galeri"
            >
              <ImageIcon size={22} />
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleCapture}
              disabled={scanState === 'scanning' || !!errorMsg}
              className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center disabled:opacity-40"
            >
              <div className="w-16 h-16 bg-white rounded-full transition-transform active:scale-90 shadow-lg"></div>
            </button>

            {/* Spacer to mirror gallery button */}
            <div className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Bottom Sheet Results */}
      <div className={`bg-white rounded-t-3xl transition-all duration-300 ease-in-out absolute bottom-0 left-0 right-0 max-w-md mx-auto flex flex-col z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] ${scanState === 'half-result' ? 'h-[45%]' :
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
                  onClick={() => { setErrorMsg(''); setScanState('camera'); startCamera(); }}
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
                    Skor kesegaran: <strong>{Math.round(result.freshness_score * 100)}%</strong>.
                    {result.condition === 'ripe' && ' Cocok untuk segera dikonsumsi atau diolah hari ini!'}
                    {result.condition === 'rotten' && ' Sayangnya buah ini sudah tidak layak konsumsi.'}
                    {result.condition === 'unripe' && ' Simpan dalam suhu ruangan agar cepat matang.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setScanState('half-result')}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 active:bg-gray-200 transition-colors"
                  >
                    <ChevronDown size={18} /> Tutup
                  </button>
                  <button
                    onClick={handleSaveToInventory}
                    disabled={isSaving}
                    className="flex-1 py-3.5 bg-scanora-green text-white font-semibold rounded-xl shadow-lg shadow-scanora-green/30 flex items-center justify-center gap-2 active:bg-scanora-dark transition-colors disabled:opacity-70"
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
