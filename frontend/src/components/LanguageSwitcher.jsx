import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'cs', label: 'CS' },
];

export const LanguageSwitcher = ({ variant = 'dark', className = '' }) => {
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGS.find((l) => l.code === language) || LANGS[0];

  const isDark = variant === 'dark';
  const btnClass = isDark
    ? 'text-white/60 hover:text-white border-white/10 hover:border-white/20'
    : 'text-[#595959] hover:text-[#1A1A1A] border-black/10 hover:border-black/20';
  const dropBg = isDark
    ? 'bg-[#1A1A1A] border-white/10'
    : 'bg-white border-black/10';
  const itemClass = isDark
    ? 'text-white/50 hover:text-white'
    : 'text-[#595959] hover:text-[#1A1A1A]';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        data-testid="lang-switcher-btn"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${btnClass}`}
      >
        <Globe size={13} className="text-[#C6A87C]" />
        {current.label}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-1 rounded-md overflow-hidden min-w-[80px] z-50 border shadow-lg ${dropBg}`}>
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => { changeLanguage(code); setOpen(false); }}
              data-testid={`lang-option-${code}`}
              className={`w-full px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                language === code
                  ? 'text-[#C6A87C] bg-[#C6A87C]/10'
                  : itemClass
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
