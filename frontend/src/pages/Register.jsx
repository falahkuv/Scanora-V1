import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';
import { supabase } from '../lib/supabaseClient';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordMinLength = 8;
  const isPasswordValid = password.length >= passwordMinLength;
  const showPasswordHint = passwordTouched && password.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    // Client-side validation before hitting server
    if (!isPasswordValid) {
      setPasswordTouched(true);
      setErrorMessage(`Password minimal ${passwordMinLength} karakter. Saat ini hanya ${password.length} karakter.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const token = response.data?.data?.token;
      if (!token) throw new Error('Token tidak ditemukan');
      localStorage.removeItem('skip_silent_auth');
      localStorage.setItem('token', token);
      if (response.data?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      navigate('/');
    } catch (error) {
      // Parse express-validator array errors if present
      const serverErrors = error.response?.data?.data?.errors;
      if (serverErrors?.length) {
        setErrorMessage(serverErrors.map(e => e.msg).join(' • '));
      } else {
        const msg = error.response?.data?.message || '';
        if (msg.toLowerCase().includes('email already in use') || msg.toLowerCase().includes('already')) {
          setErrorMessage('Email ini sudah terdaftar. Coba masuk atau gunakan email lain.');
        } else if (!navigator.onLine) {
          setErrorMessage('Tidak ada koneksi internet. Periksa jaringanmu dan coba lagi.');
        } else if (!error.response) {
          setErrorMessage('Tidak dapat terhubung ke server. Coba beberapa saat lagi.');
        } else {
          setErrorMessage(msg || 'Registrasi gagal. Coba lagi.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: { prompt: 'select_account' }
      },
    });
    if (error) {
      setErrorMessage('Daftar dengan Google gagal. Coba lagi.');
      setIsGoogleLoading(false);
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
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Daftar Akun</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Yuk daftar dan mulai pantau buah kamu!</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Panggilan</label>
            <input
              type="text"
              placeholder="Sobat Scanora"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-scanora-green transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="sobat@scanora.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-scanora-green transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                onBlur={() => setPasswordTouched(true)}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors
                  ${showPasswordHint
                    ? isPasswordValid
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-red-400 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-scanora-green'
                  }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Real-time password hint */}
            {showPasswordHint && (
              <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium transition-all ${isPasswordValid ? 'text-green-600' : 'text-red-500'}`}>
                {isPasswordValid
                  ? <><CheckCircle size={13} /> Password sudah cukup kuat</>
                  : <><XCircle size={13} /> Minimal {passwordMinLength} karakter ({password.length}/{passwordMinLength})</>
                }
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="text-sm text-red-main bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <XCircle size={16} className="flex-shrink-0 mt-0.5 text-red-main" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-scanora-green hover:bg-scanora-dark text-white rounded-xl font-bold shadow-lg shadow-scanora-green/30 transition-all active:scale-95 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Memproses...' : 'Buat Akun'}
          </button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Atau</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="w-full py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex justify-center items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isGoogleLoading ? 'Menghubungkan...' : 'Daftar dengan Google'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Sudah punya akun? <Link to="/login" className="text-scanora-green font-bold">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
