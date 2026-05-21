import { Home, Salad, Camera, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const SideNav = ({ onOpenScanner }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  // Load user info
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const displayName = user.name || user.email?.split('@')[0] || 'Sobat Scanora';
  const email = user.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  const mainNavItems = [
    { path: '/', icon: Home, label: 'Beranda' },
    { path: '/inventory', icon: Salad, label: 'Inventori' },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col py-5 px-3 flex-shrink-0 shadow-sm">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2 px-4 mb-6">
        <span className="text-2xl">🍊</span>
        <span className="text-xl font-extrabold tracking-tight text-gray-900">
          Scan<span className="text-scanora-green">ORA</span>
        </span>
      </div>

      {/* ── Scan Buah CTA (prominent, at the top) ── */}
      <button
        onClick={onOpenScanner}
        className="flex flex-col items-center justify-center gap-1.5 mb-6 py-4 bg-scanora-green text-white rounded-2xl font-bold text-sm hover:bg-scanora-dark active:scale-95 transition-all shadow-xl shadow-scanora-green/25 w-full"
      >
        <Camera size={28} strokeWidth={2.5} />
        <span className="text-center leading-tight">Scan Buah</span>
      </button>

      {/* ── Main Nav ── */}
      <nav className="flex flex-col gap-1">
        {mainNavItems.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-3 px-4 min-h-[56px] rounded-2xl text-sm font-semibold transition-all active:scale-95 text-left w-full
              ${isActive(path)
                ? 'bg-scanora-green/10 text-scanora-green'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <Icon size={22} strokeWidth={isActive(path) ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Profile (pinned to bottom) ── */}
      <div className="border-t border-gray-100 my-2 mx-2"></div>
      <button
        onClick={() => navigate('/profile')}
        className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all active:scale-95 w-full text-left hover:bg-gray-50
          ${isActive('/profile') ? 'bg-scanora-green/10' : ''}`}
      >
        <div className="w-11 h-11 rounded-full bg-scanora-green/10 flex items-center justify-center text-scanora-green font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isActive('/profile') ? 'text-scanora-green' : 'text-gray-800'}`}>
            {displayName}
          </p>
          {email && (
            <p className="text-xs text-gray-400 truncate">{email}</p>
          )}
        </div>
      </button>
    </aside>
  );
};

export default SideNav;
