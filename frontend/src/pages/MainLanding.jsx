import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Droplets } from 'lucide-react';

const MainLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col" data-testid="main-landing">
      {/* Header */}
      <header className="py-6 px-6 text-center">
        <h1 className="text-xl font-bold tracking-[0.3em] text-white uppercase">WM Group</h1>
        <p className="text-white/30 text-xs tracking-widest mt-1">SAUNY &bull; BALIE &bull; SPA</p>
      </header>

      {/* Main content - two cards */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
          {/* Sauny card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/sauny')}
            className="group relative overflow-hidden cursor-pointer min-h-[400px] md:min-h-[500px] flex flex-col justify-end"
            data-testid="card-sauny"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10" />
            <img
              src="https://images.unsplash.com/photo-1759302354886-f2c37dd3dd8c?auto=format&fit=crop&w=800&q=80"
              alt="Sauny"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="relative z-20 p-8">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={18} className="text-[#C6A87C]" />
                <span className="text-[#C6A87C] text-xs font-semibold tracking-[0.2em] uppercase">WM-Sauna</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Sauny ogrodowe</h2>
              <p className="text-white/60 text-sm mb-6 max-w-sm">
                Gotowe, zmontowane sauny beczki, kwadro i wiking. Skandynawskie drewno klasy A+. Dostawa w 5–10 dni.
              </p>
              <div className="flex items-center gap-2 text-white font-medium group-hover:text-[#C6A87C] transition-colors">
                Zobacz sauny <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>

          {/* Balie card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => navigate('/balie')}
            className="group relative overflow-hidden cursor-pointer min-h-[400px] md:min-h-[500px] flex flex-col justify-end"
            data-testid="card-balie"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10" />
            <img
              src="https://images.unsplash.com/photo-1668461363398-1fd41bf2ca79?auto=format&fit=crop&w=800&q=80"
              alt="Balie"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="relative z-20 p-8">
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={18} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs font-semibold tracking-[0.2em] uppercase">WM-Balia</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Balie i jacuzzi</h2>
              <p className="text-white/60 text-sm mb-6 max-w-sm">
                Ręcznie robione drewniane balie, jacuzzi i akcesoria SPA. Naturalne drewno, najwyższa jakość.
              </p>
              <div className="flex items-center gap-2 text-white font-medium group-hover:text-[#D4AF37] transition-colors">
                Zobacz balie <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-white/5">
        <p className="text-white/20 text-xs">© 2025 WM Group. Sauny i balie premium.</p>
      </footer>
    </div>
  );
};

export default MainLanding;
