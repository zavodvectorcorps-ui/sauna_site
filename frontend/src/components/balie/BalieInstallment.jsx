import { CreditCard, Calendar, Percent, Truck } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/utils';
import { useAutoTranslate } from '../../context/AutoTranslateContext';
import { useSettings } from '../../context/SettingsContext';

const ICONS = { CreditCard, Calendar, Percent, Truck };

const DEFAULT_ITEMS = [
  { icon: 'Calendar', title: 'Okres od 4 do 20 miesięcy', desc: 'Elastyczny czas spłaty' },
  { icon: 'Percent', title: '0% nadpłaty', desc: 'Bez ukrytych kosztów' },
  { icon: 'CreditCard', title: 'Rata od 300 zl/mc', desc: 'Przystepna rata' },
  { icon: 'Truck', title: 'Darmowa dostawa', desc: 'Na terenie całej Polski' },
];

export const BalieInstallment = ({ variant = 'full' }) => {
  const { tr } = useAutoTranslate();
  const { getSetting } = useSettings();
  const installData = getSetting('installment_settings');
  const data = getSetting('balie_installment');
  const logoUrl = installData?.balia_logo_url ? resolveMediaUrl(installData.balia_logo_url) : '';

  const items = data?.items?.length ? data.items : DEFAULT_ITEMS;
  const title = data?.title || 'Komfort dostępny od razu!';
  const subtitle = data?.subtitle || 'Kupuj na raty — wygodnie i bez dodatkowych kosztow';

  if (variant === 'compact') {
    return (
      <div className="bg-[#1A1E27] border border-[#D4AF37]/20 p-4" data-testid="balie-installment-compact">
        <div className="flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt="Partner" className="h-6 object-contain" data-testid="balie-installment-compact-logo" />}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CreditCard size={16} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm font-semibold">{items[2]?.title || 'Raty od 300 zl/mc'}</span>
            </div>
            <p className="text-white/40 text-xs">{items[0]?.title}, {items[1]?.title}, {items[3]?.title}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#0A0D12]" data-testid="balie-installment">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          {logoUrl && (
            <div className="mb-4" data-testid="balie-installment-logo">
              <img src={logoUrl} alt="Partner finansowy" className="h-12 mx-auto object-contain" />
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {title.includes(' ') ? <>{title.split(' ').slice(0, -1).join(' ')} <span className="text-[#D4AF37]">{title.split(' ').slice(-1)}</span></> : <span className="text-[#D4AF37]">{title}</span>}
          </h2>
          <p className="text-white/40 text-sm">{tr(subtitle)}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {items.map((item, i) => {
            const Icon = ICONS[item.icon] || CreditCard;
            return (
              <div key={i} className="bg-[#1A1E27] border border-[#D4AF37]/20 p-4 text-center hover:border-[#D4AF37]/50 transition-colors">
                <Icon size={24} className="text-[#D4AF37] mx-auto mb-2" />
                <h3 className="text-white font-semibold text-sm mb-1">{tr(item.title)}</h3>
                <p className="text-white/30 text-xs">{tr(item.desc)}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <a href="#kontakt-balie" className="inline-block px-8 py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors" data-testid="balie-installment-cta">
            {tr('Zapytaj o raty')}
          </a>
        </div>
      </div>
    </section>
  );
};
