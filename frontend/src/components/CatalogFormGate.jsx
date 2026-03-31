import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Send, Loader2, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent } from '../lib/analytics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const CatalogFormGate = ({ children, className, testId }) => {
  const { language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          message: language === 'EN' ? 'Catalog download request' : 'Zapytanie o katalog',
          type: 'catalog_request',
        }),
      });
    } catch {}
    // Use location.href instead of window.open — mobile browsers block popups from async callbacks
    window.location.href = `${BACKEND_URL}/api/catalog/download`;
    trackEvent('catalog_download', { name: formData.name });
    setShowForm(false);
    setSubmitting(false);
    setFormData({ name: '', phone: '', email: '' });
  };

  const labels = language === 'EN'
    ? { title: 'Get our catalog', subtitle: 'Leave your contact details to download', name: 'Name', phone: 'Phone', email: 'Email (optional)', submit: 'Download catalog' }
    : { title: 'Pobierz katalog', subtitle: 'Zostaw swoje dane kontaktowe, aby pobrać', name: 'Imię', phone: 'Telefon', email: 'Email (opcjonalnie)', submit: 'Pobierz katalog' };

  return (
    <>
      <button onClick={() => setShowForm(true)} className={className} data-testid={testId}>
        {children}
      </button>

      {createPortal(
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-6 max-w-sm w-full relative my-auto"
              >
              <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 text-[#8C8C8C] hover:text-[#1A1A1A]"><X size={18} /></button>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">{labels.title}</h3>
              <p className="text-sm text-[#595959] mb-4">{labels.subtitle}</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder={labels.name} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border border-black/10 text-sm" required />
                <input type="tel" placeholder={labels.phone} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2.5 border border-black/10 text-sm" required />
                <input type="email" placeholder={labels.email} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2.5 border border-black/10 text-sm" />
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-[#C6A87C] text-white py-3 text-sm font-semibold hover:bg-[#B09060] transition-colors disabled:opacity-50">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {labels.submit}
                </button>
                <p className="text-[9px] text-[#8C8C8C] leading-relaxed">
                  Dane będą przetwarzane w celu przesłania katalogu. Szczegóły w <a href="/privacy" className="text-[#C6A87C] hover:underline" target="_blank">Polityce prywatności</a>.
                </p>
              </form>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
