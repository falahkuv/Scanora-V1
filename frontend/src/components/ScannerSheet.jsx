import { useState, useEffect, useRef } from 'react';
import { X, Zap, Image as ImageIcon, ChevronUp, ChevronDown, Check } from 'lucide-react';
import api from '../api';

const ScannerSheet = ({ isOpen, onClose }) => {
  const [scanState, setScanState] = useState('camera'); // 'camera' | 'scanning' | 'half-result' | 'full-result'
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Camera error:", err);
      setErrorMsg("Kamera tidak dapat diakses. Mohon periksa izin browser.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Manage camera lifecycle
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

  const handleCapture = async () => {
    if (!videoRef.current) return;
    
    setScanState('scanning');
    
    // Capture image from video
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Stop camera as we don't need it while showing results
    stopCamera();

    canvas.toBlob(async (blob) => {
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
          setErrorMsg(response.data.message || "Gagal memindai");
          setScanState('half-result'); // Still show bottom sheet but with error
        }
      } catch (err) {
        console.error("API error:", err);
        setErrorMsg("Koneksi ke AI gagal. Pastikan server FastAPI menyala.");
        setScanState('half-result');
      }
    }, 'image/jpeg', 0.8);
  };

  const handleSaveToInventory = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);
    
    try {
      await api.post('/inventory', {
        fruit_type: result.fruit_type,
        condition: result.condition,
        scan_id: result.scan_id,
        // Set reminder to 3 days from now by default
        reminder_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
      onClose(); // Close scanner on success
    } catch (err) {
      console.error("Failed to save", err);
      alert("Gagal menyimpan ke inventori.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Helpers for UI
  const getFruitEmoji = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('pisang')) return '🍌';
    if (t.includes('apel')) return '🍎';
    if (t.includes('jeruk')) return '🍊';
    return '🍎';
  };

  const getConditionColor = (condition) => {
    const c = condition?.toLowerCase() || '';
    if (c === 'ripe') return { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' };
    if (c === 'rotten') return { text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' };
    return { text: 'text-gray-700', bg: 'bg-gray-50', dot: 'bg-gray-500' };
  };

  const condColor = getConditionColor(result?.condition);
  // Calculate percentage for circular gauge (0 to 283 stroke-dashoffset)
  // Max freshness is 1.0 (0 offset), Min is 0.0 (283 offset)
  const score = result?.freshness_score ?? 0;
  const dashOffset = 283 - (score * 283);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black max-w-md mx-auto overflow-hidden">
      {/* Camera Viewport */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`object-cover w-full h-full ${scanState !== 'camera' && scanState !== 'scanning' ? 'hidden' : ''}`} 
          />
          
          {scanState === 'camera' && !errorMsg && (
            <div className="absolute w-64 h-64 border-2 border-white/30 rounded-3xl z-10 pointer-events-none">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-3xl"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-3xl"></div>
            </div>
          )}
          
          {scanState === 'scanning' && (
            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-scanora-green border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-medium animate-pulse">Menganalisis dengan AI...</p>
            </div>
          )}

          {errorMsg && scanState === 'camera' && (
            <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-6 text-center">
              <p className="text-white">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-30">
          <button onClick={onClose} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <X size={20} />
          </button>
        </div>

        {/* Bottom Camera Controls */}
        {(scanState === 'camera' || scanState === 'scanning') && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8 px-8 z-30">
            <div className="w-12 h-12"></div> {/* Spacer */}
            <button 
              onClick={handleCapture}
              disabled={scanState === 'scanning' || !!errorMsg}
              className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center disabled:opacity-50"
            >
              <div className="w-16 h-16 bg-white rounded-full transition-transform active:scale-95"></div>
            </button>
            <div className="w-12 h-12"></div> {/* Spacer */}
          </div>
        )}
      </div>

      {/* Bottom Sheet Results */}
      <div className={`bg-white rounded-t-3xl transition-all duration-300 ease-in-out absolute bottom-0 left-0 right-0 max-w-md mx-auto flex flex-col z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] ${
        scanState === 'half-result' ? 'h-[45%]' : 
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
              <p className="text-gray-500 text-sm">{errorMsg}</p>
              <button onClick={() => setScanState('camera')} className="mt-6 px-6 py-2 bg-gray-100 rounded-full text-gray-700 font-medium">Coba Lagi</button>
            </div>
          ) : result ? (
            <>
              {/* Half View Content */}
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-24 h-24 mb-4 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke={condColor.dot.replace('bg-', '') === 'amber-500' ? '#f59e0b' : condColor.dot.replace('bg-', '') === 'red-500' ? '#ef4444' : '#10b981'} 
                      strokeWidth="8" 
                      strokeDasharray="283" 
                      strokeDashoffset={dashOffset} 
                      className="transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-3xl">
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
                    className="mt-6 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-scanora-green transition-colors"
                  >
                    Lihat Detail <ChevronUp size={16} />
                  </button>
                )}
              </div>

              {/* Full View Content */}
              <div className={`mt-8 transition-opacity duration-300 ${scanState === 'full-result' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    💡 Informasi AI
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    AI kami mendeteksi ini adalah <strong>{result.fruit_type}</strong> dengan kondisi <strong>{result.condition}</strong>. 
                    Skor kesegarannya adalah {Math.round(result.freshness_score * 100)}%.
                    {result.condition === 'ripe' && ' Cocok untuk segera dikonsumsi atau diolah hari ini!'}
                    {result.condition === 'rotten' && ' Sayangnya buah ini sudah tidak layak konsumsi.'}
                    {result.condition === 'unripe' && ' Simpan dalam suhu ruangan agar cepat matang.'}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setScanState('half-result')}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 active:bg-gray-200 transition-colors"
                  >
                    Tutup <ChevronDown size={18} />
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
