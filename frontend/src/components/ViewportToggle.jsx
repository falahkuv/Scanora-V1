import { useState } from 'react';
import { Monitor, Tablet, Smartphone, Expand } from 'lucide-react';
import { useViewport } from '../context/ViewportContext';

const options = [
  { id: 'mobile',  label: 'Mobile',  icon: Smartphone },
  { id: 'tablet',  label: 'Tablet',  icon: Tablet },
  { id: 'full-screen', label: 'Full Screen', icon: Expand },
];

const ViewportToggle = () => {
  const { viewport, mode, setViewport } = useViewport();
  const [isOpen, setIsOpen] = useState(false);

  const ActiveIcon = options.find(o => o.id === mode)?.icon ?? Expand;

  // Stable position: always bottom-right
  const posClass = 'bottom-[5vh] right-[3vw]';

  return (
    <div className={`fixed ${posClass} z-[999] flex flex-col items-end gap-2.5`}>

      {/* Options — expand upward */}
      {isOpen && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
          />
          <div className="flex flex-col gap-2 items-end animate-slide-up">
            {[...options].reverse().map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setViewport(id); setIsOpen(false); }}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-base font-semibold shadow-xl transition-all active:scale-95 whitespace-nowrap
                  ${mode === id
                    ? 'bg-scanora-green text-white shadow-scanora-green/30'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'}`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* FAB trigger — bigger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title="Ganti Viewport"
        className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2
          ${isOpen
            ? 'bg-scanora-green text-white border-scanora-green shadow-scanora-green/30'
            : 'bg-white text-scanora-green border-gray-100 hover:bg-gray-50'}`}
      >
        <ActiveIcon size={26} />
      </button>
    </div>
  );
};

export default ViewportToggle;
