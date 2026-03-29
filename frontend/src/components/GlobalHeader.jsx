import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV = [
  { path: '/sauny', label: 'Sauny', color: '#C6A87C' },
  { path: '/balie', label: 'Balie', color: '#D4AF37' },
  { path: '/blog', label: 'Blog', color: '#ffffff' },
  { path: '/b2b', label: 'B2B', color: '#34D399', accent: true },
];

export const GlobalHeader = ({ light = false }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const bg = light
    ? 'bg-white/95 backdrop-blur-md border-b border-black/5'
    : 'bg-[#0C0C0C]/90 backdrop-blur-md border-b border-white/5';

  const textPrimary = light ? 'text-[#1A1A1A]' : 'text-white';

  return (
    <header className={`sticky top-0 z-50 ${bg}`} data-testid="global-header">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors ${light ? 'text-[#8C8C8C] hover:text-[#1A1A1A]' : 'text-white/40 hover:text-white'}`}
            data-testid="global-header-back"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center"
            data-testid="global-header-logo"
          >
            <span className={`font-['Montserrat'] text-lg font-bold tracking-[0.15em] uppercase ${textPrimary}`}>
              WM<span className="text-[#C6A87C]"> Group</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <nav className="hidden sm:flex items-center gap-5">
            {NAV.map(({ path, label, color, accent }) => {
              const active = pathname === path || pathname.startsWith(path + '/');
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  data-testid={`global-nav-${path.slice(1)}`}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? accent ? 'text-[#34D399]' : `text-[${color}]`
                      : light
                        ? accent ? 'text-[#059669] hover:text-[#34D399] font-semibold' : 'text-[#595959] hover:text-[#C6A87C]'
                        : accent ? 'text-[#34D399] hover:text-[#6EE7B7] font-semibold' : 'text-white/50 hover:text-white'
                  }`}
                  style={active ? { color } : accent ? {} : undefined}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <LanguageSwitcher variant={light ? 'light' : 'dark'} />

          <a
            href="tel:+48732099201"
            className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors ${
              light ? 'text-[#1A1A1A] hover:text-[#C6A87C]' : 'text-white/70 hover:text-[#C6A87C]'
            }`}
            data-testid="global-header-phone"
          >
            <Phone size={14} className="text-[#C6A87C]" />
            +48 732 099 201
          </a>
        </div>
      </div>
    </header>
  );
};
