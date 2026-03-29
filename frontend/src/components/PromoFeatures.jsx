import { useState, useEffect } from 'react';
import { Truck, TreePine, ShieldCheck, Headphones, Flame, Droplets, Wrench, Clock, Award, Star, Heart, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useAutoTranslate } from '../context/AutoTranslateContext';

const API = process.env.REACT_APP_BACKEND_URL;

const ICONS = { Truck, TreePine, ShieldCheck, Headphones, Flame, Droplets, Wrench, Clock, Award, Star, Heart, Zap };

export const PromoFeatures = () => {
  const [features, setFeatures] = useState([]);
  const { tr } = useAutoTranslate();

  useEffect(() => {
    fetch(`${API}/api/settings/promo-features`)
      .then(r => r.json())
      .then(d => { if (d?.items?.length) setFeatures(d.items); })
      .catch(() => {});
  }, []);

  const { scrollRef, currentIndex, scrollDir, onTouchStart, onTouchEnd } = useAutoScroll({ itemCount: features.length, intervalMs: 3500 });

  if (!features.length) return null;

  return (
    <section className="py-8 sm:py-10 bg-[#FAFAF7]" data-testid="promo-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden" data-testid="promo-features-mobile-scroll">
          <div
            ref={scrollRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scroll-pl-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {features.map((f, i) => {
              const Icon = ICONS[f.icon] || Star;
              return (
                <div key={f.id || i} className="w-[55vw] flex-shrink-0 snap-start text-center bg-white border border-black/5 shadow-sm p-5 rounded-lg" data-testid={`promo-feature-card-${i}`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#C6A87C]/10 mb-3">
                    <Icon size={22} className="text-[#C6A87C]" />
                  </div>
                  <h3 className="text-[#1A1A1A] font-semibold text-sm mb-1.5">{tr(f.title_pl)}</h3>
                  <p className="text-[#8C8C8C] text-xs leading-relaxed">{tr(f.desc_pl)}</p>
                </div>
              );
            })}
          </div>
          {features.length > 2 && (
            <div className="flex justify-center items-center gap-2 mt-2">
              <button onClick={() => scrollDir('left')} className="w-8 h-8 flex items-center justify-center bg-[#F2F2F0] hover:bg-[#C6A87C]/20 transition-colors" data-testid="promo-scroll-left">
                <ChevronLeft size={16} className="text-[#595959]" />
              </button>
              {features.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-[#C6A87C]' : 'bg-[#D4D4D4]'}`} />
              ))}
              <button onClick={() => scrollDir('right')} className="w-8 h-8 flex items-center justify-center bg-[#F2F2F0] hover:bg-[#C6A87C]/20 transition-colors" data-testid="promo-scroll-right">
                <ChevronRight size={16} className="text-[#595959]" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] || Star;
            return (
              <div key={f.id || i} className="text-center" data-testid={`promo-feature-card-${i}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#C6A87C]/10 mb-4">
                  <Icon size={24} className="text-[#C6A87C]" />
                </div>
                <h3 className="text-[#1A1A1A] font-semibold text-sm mb-2">{tr(f.title_pl)}</h3>
                <p className="text-[#8C8C8C] text-xs leading-relaxed">{tr(f.desc_pl)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
