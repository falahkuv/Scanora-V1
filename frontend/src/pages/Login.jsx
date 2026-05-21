import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.data?.token;
      if (!token) throw new Error('Token tidak ditemukan');
      localStorage.setItem('token', token);
      if (response.data?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      navigate('/');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login gagal. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-6 py-6 transition-colors">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-scanora-green/10 rounded-2xl flex items-center justify-center text-scanora-green">
            <Leaf size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Masuk</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Selamat datang kembali di Scanora!</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-scanora-green transition-colors"
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
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-sm text-scanora-green font-medium">Lupa Password?</button>
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-scanora-green hover:bg-scanora-dark text-white rounded-xl font-bold shadow-lg shadow-scanora-green/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
          </button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Atau</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex justify-center items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Lanjut dengan Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Belum punya akun? <Link to="/register" className="text-scanora-green font-bold">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
