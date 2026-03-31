import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const FloatingContact = () => {
  const [open, setOpen] = useState(false);
  const { siteSettings } = useSettings();
  const phone = siteSettings?.phone || '+48 732 099 201';
  const phoneClean = phone.replace(/\s/g, '');

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end gap-3" data-testid="floating-contact">
      <AnimatePresence>
        {open && (
          <>
            <motion.a
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              href={`https://wa.me/${phoneClean.replace('+', '')}?text=${encodeURIComponent('Dzień dobry! Chciałbym zapytać o saunę.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white pl-4 pr-5 py-3 shadow-lg hover:bg-[#1fba57] transition-colors"
              data-testid="floating-whatsapp"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium whitespace-nowrap">WhatsApp</span>
            </motion.a>
            <motion.a
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              href={`tel:${phoneClean}`}
              className="flex items-center gap-3 bg-[#1A1A1A] text-white pl-4 pr-5 py-3 shadow-lg hover:bg-[#333] transition-colors"
              data-testid="floating-phone"
            >
              <Phone size={20} />
              <span className="text-sm font-medium whitespace-nowrap">{phone}</span>
            </motion.a>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 flex items-center justify-center shadow-xl transition-colors ${
          open ? 'bg-[#1A1A1A] hover:bg-[#333]' : 'bg-[#C6A87C] hover:bg-[#B09060]'
        }`}
        whileTap={{ scale: 0.9 }}
        data-testid="floating-contact-toggle"
      >
        {open ? <X size={24} className="text-white" /> : <Phone size={24} className="text-white" />}
      </motion.button>
    </div>
  );
};
