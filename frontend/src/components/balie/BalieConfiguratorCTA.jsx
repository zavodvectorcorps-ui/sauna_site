import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, ArrowRight, Phone } from 'lucide-react';

export const BalieConfiguratorCTA = () => {
  const navigate = useNavigate();

  return (
    <section id="balie-konfigurator" className="relative py-20 bg-[#1A1E27] overflow-hidden" data-testid="balie-configurator-cta">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Droplets size={40} className="text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Zaprojektuj swoją <span className="text-[#D4AF37]">wymarzoną balię</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Wybierz model, rozmiar, kolor drewna, typ pieca i dodatkowe opcje. 
            Nasz konfigurator pozwala dopasować każdy detal do Twoich potrzeb.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/balie/konfigurator')}
              className="flex items-center gap-3 bg-[#D4AF37] text-[#0F1218] px-8 py-4 font-semibold hover:bg-[#C5A028] transition-colors" data-testid="balie-cta-configurator-btn">
              Otwórz konfigurator <ArrowRight size={18} />
            </button>
            <a href="tel:+48515995190" className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 font-medium hover:bg-white/5 transition-colors">
              <Phone size={18} /> Zadzwoń do doradcy
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
