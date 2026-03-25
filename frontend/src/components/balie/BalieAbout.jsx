import { motion } from 'framer-motion';
import { Heart, Award, Users, MapPin } from 'lucide-react';

export const BalieAbout = () => (
  <section className="py-20 bg-[#0A0D12]" data-testid="balie-about">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold tracking-[0.15em] uppercase">O nas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
            WM-Balia — <span className="text-[#D4AF37]">Pasja do Relaksu</span>
          </h2>
          <div className="space-y-4 text-white/50 text-sm leading-relaxed">
            <p>
              Jesteśmy polskim producentem premium balii i jacuzzi drewnianych z siedzibą w Warszawie. 
              Tworzymy produkty, które łączą tradycyjne rzemiosło z nowoczesnym designem.
            </p>
            <p>
              Każda nasza balia powstaje ręcznie z najwyższej jakości drewna — modrzewia syberyjskiego 
              i świerku skandynawskiego. Dbamy o każdy detal, bo wierzymy, że Twój odpoczynek 
              zasługuje na najwyższą jakość.
            </p>
            <p>
              Oferujemy pełen serwis: od doradztwa przy wyborze modelu, przez produkcję na zamówienie, 
              aż po dostawę i montaż. Gwarancja 2 lata na każdy produkt.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { icon: Users, val: '500+', label: 'Zadowolonych klientów' },
            { icon: Award, val: '2 lata', label: 'Gwarancji na każdy produkt' },
            { icon: Heart, val: '100%', label: 'Eko materiały' },
            { icon: MapPin, val: 'Warszawa', label: 'Siedziba firmy' },
          ].map((s, i) => (
            <div key={i} className="bg-[#1A1E27] border border-white/5 p-5 text-center hover:border-[#D4AF37]/20 transition-colors">
              <s.icon size={24} className="text-[#D4AF37] mx-auto mb-3" />
              <div className="text-xl font-bold text-white mb-1">{s.val}</div>
              <div className="text-white/40 text-xs">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);
