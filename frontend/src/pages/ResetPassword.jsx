import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setIsReady(true);
      if (!data?.session) {
        setErrorMessage('Link reset tidak valid atau sudah kedaluwarsa.');
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Gagal mengubah password. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center px-6 py-6 transition-colors">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-scanora-green/10 rounded-2xl flex items-center justify-center overflow-hidden">
            <img src="/images/splashscreenicon.png" alt="Scanora" className="w-full h-full object-cover scale-125" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Buat Password Baru</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Masukkan password baru untuk akunmu.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-scanora-green transition-colors"
              required
              disabled={!isReady}
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-main bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isReady || !!errorMessage}
            className="w-full py-3.5 bg-scanora-green hover:bg-scanora-dark text-white rounded-xl font-bold shadow-lg shadow-scanora-green/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Memproses...' : 'Buat Password Baru'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex justify-center items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            Kembali ke Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
