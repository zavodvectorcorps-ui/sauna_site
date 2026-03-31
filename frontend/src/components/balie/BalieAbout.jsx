import { motion } from 'framer-motion';
import { Heart, Award, Users, MapPin } from 'lucide-react';
import { useAutoTranslate } from '../../context/AutoTranslateContext';
import { useSettings } from '../../context/SettingsContext';

const STAT_ICONS = { Users, Award, Heart, MapPin };

export const BalieAbout = () => {
  const { tr } = useAutoTranslate();
  const { getSetting } = useSettings();
  const data = getSetting('balie_about');

  if (!data) return null;

  return (
    <section className="py-20 bg-[#0A0D12]" data-testid="balie-about">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={16} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-semibold tracking-[0.15em] uppercase">{tr('O nas')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
              <span className="text-[#D4AF37]">{tr(data.title)}</span>
            </h2>
            <div className="space-y-4 text-white/50 text-sm leading-relaxed">
              {data.description?.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{tr(p)}</p>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {(data.stats || []).map((s, i) => {
              const Icon = STAT_ICONS[s.icon] || Heart;
              return (
                <div key={i} className="bg-[#1A1E27] border border-white/5 p-5 text-center hover:border-[#D4AF37]/20 transition-colors">
                  <Icon size={24} className="text-[#D4AF37] mx-auto mb-3" />
                  <div className="text-xl font-bold text-white mb-1">{s.value}</div>
                  <div className="text-white/40 text-xs">{tr(s.label)}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
