import { useState, useEffect } from 'react';
import { Truck, TreePine, ShieldCheck, Headphones, Flame, Droplets, Wrench, Clock, Award, Star, Heart, Zap } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ICONS = { Truck, TreePine, ShieldCheck, Headphones, Flame, Droplets, Wrench, Clock, Award, Star, Heart, Zap };

export const PromoFeatures = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/settings/promo-features`)
      .then(r => r.json())
      .then(d => { if (d?.items?.length) setFeatures(d.items); })
      .catch(() => {});
  }, []);

  if (!features.length) return null;

  return (
    <section className="py-8 sm:py-10 bg-[#FAFAF7]" data-testid="promo-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] || Star;
            return (
              <div key={f.id || i} className="text-center" data-testid={`promo-feature-card-${i}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#C6A87C]/10 mb-4">
                  <Icon size={24} className="text-[#C6A87C]" />
                </div>
                <h3 className="text-[#1A1A1A] font-semibold text-sm mb-2">{f.title_pl}</h3>
                <p className="text-[#8C8C8C] text-xs leading-relaxed">{f.desc_pl}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
