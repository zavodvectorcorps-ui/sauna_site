import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const WhatsAppButton = () => {
  const [settings, setSettings] = useState(null);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/settings/whatsapp`)
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!settings?.enabled) return null;

  const phone = (settings.phone_number || '').replace(/[^0-9]/g, '');
  const message = encodeURIComponent(settings.default_message_pl || '');
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <AnimatePresence>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-6 left-6 z-50 group"
        data-testid="whatsapp-floating-btn"
      >
        <div className="relative">
          {pulse && (
            <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-30" />
          )}
          <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl group-hover:bg-[#1fba57] transition-colors duration-300 group-hover:scale-110">
            <MessageCircle size={28} className="text-white" />
          </div>
        </div>
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white text-[#1A1A1A] text-xs font-medium px-3 py-2 shadow-lg whitespace-nowrap rounded">
            Napisz do nas na WhatsApp
          </div>
        </div>
      </motion.a>
    </AnimatePresence>
  );
};
