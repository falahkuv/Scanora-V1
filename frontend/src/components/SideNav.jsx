import { Home, Salad, Camera, User, History, ChartColumnBig } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SideNav = ({ onOpenScanner }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isActive = (path) => location.pathname === path;

  // Load user info
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const displayName = user.name || user.email?.split('@')[0] || 'Sobat Scanora';
  const email = user.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();
  const profileImage = user.profile_image || user.profileImage;

  const mainNavItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/inventory', icon: Salad, label: t('nav.inventory'), action: () => navigate('/inventory', { state: { tab: 'inventory' } }) },
    { path: '/history', icon: History, label: t('nav.history'), action: () => navigate('/inventory', { state: { tab: 'history' } }) },
    { path: '/stats', icon: ChartColumnBig, label: t('nav.stats') },
  ];

  const handleNavClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
  };

  // Fixed: Inventori is active ONLY when on /inventory and NOT in history tab
  // Riwayat is active ONLY when on /inventory AND in history tab
  const isItemActive = (item) => {
    if (item.path === '/history') {
      return location.pathname === '/inventory' && location.state?.tab === 'history';
    }
    if (item.path === '/inventory') {
      return location.pathname === '/inventory' && location.state?.tab !== 'history';
    }
    return location.pathname === item.path;
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col py-5 px-3 flex-shrink-0 shadow-sm transition-colors">

      {/* ── Logo ── */}
      <div className="flex justify-center px-4 mb-6">
        <img src="/LOGO_Scanora_Color_Long.png" alt="Scanora Logo" className="h-20 w-auto object-contain object-center drop-shadow-sm" />
      </div>

      {/* ── Scan Buah CTA (prominent, at the top) ── */}
      <button
        onClick={onOpenScanner}
        className="flex flex-col items-center justify-center gap-1.5 mb-6 py-4 bg-scanora-green text-white rounded-2xl font-bold text-sm hover:bg-scanora-dark active:scale-95 transition-all shadow-xl shadow-scanora-green/25 w-full cursor-pointer"
      >
        <Camera size={28} strokeWidth={2.5} />
        <span className="text-center leading-tight">{t('nav.scanFruit')}</span>
      </button>

      {/* ── Main Nav ── */}
      <nav className="flex flex-col gap-1">
        {mainNavItems.map((item) => {
          const { icon: Icon, label } = item;
          const active = isItemActive(item);
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-4 px-4 min-h-[56px] rounded-2xl text-sm font-semibold transition-all active:scale-95 text-left w-full cursor-pointer
                ${active
                  ? 'bg-scanora-green/10 text-scanora-green'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Profile (pinned to bottom) ── */}
      <div className="border-t border-gray-100 dark:border-gray-800 my-2 mx-2"></div>
      <button
        onClick={() => navigate('/profile')}
        className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all active:scale-95 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer
          ${isActive('/profile') ? 'bg-scanora-green/10' : ''}`}
      >
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-11 h-11 flex-shrink-0 flex items-center justify-center text-scanora-green font-bold text-sm overflow-hidden">
          {profileImage ? (
            <div
              className="w-full h-full rounded-full bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${profileImage})`, backgroundSize: '120%' }}
              role="img"
              aria-label="Profile"
            />
          ) : (
            <User size={20} className="text-scanora-green" />
          )}
        </div>
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <p className={`text-sm font-bold truncate leading-tight ${isActive('/profile') ? 'text-scanora-green' : 'text-gray-900 dark:text-white'}`}>
            {displayName}
          </p>
          {email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-tight mt-0.5">{email}</p>
          )}
        </div>
      </button>
    </aside>
  );
};

export default SideNav;
