import { useState } from 'react';
import { X, FileDown, Loader2, Check } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieCatalogGate = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type: 'balia_catalog_download',
          message: `Prosi o pobranie katalogu balii. Imie: ${form.name}, Tel: ${form.phone}, Email: ${form.email}`,
        }),
      });
      setDone(true);
      // Trigger download
      const link = document.createElement('a');
      link.href = `${API}/api/balia-catalog/download`;
      link.download = 'katalog-balie.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1E27] max-w-md w-full" onClick={e => e.stopPropagation()} data-testid="balie-catalog-gate">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileDown size={20} className="text-[#D4AF37]" /> Pobierz katalog
            </h3>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          {!done ? (
            <>
              <p className="text-white/40 text-sm mb-6">
                Wypelnij formularz, a katalog zostanie pobrany automatycznie. Nasz specjalista moze sie z Toba skontaktowac w sprawie indywidualnej oferty.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Imie i nazwisko *"
                  required
                  className="w-full p-3 bg-[#0F1218] border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#D4AF37] outline-none"
                  data-testid="catalog-gate-name"
                />
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Telefon *"
                  required
                  className="w-full p-3 bg-[#0F1218] border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#D4AF37] outline-none"
                  data-testid="catalog-gate-phone"
                />
                <input
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  type="email"
                  placeholder="E-mail *"
                  required
                  className="w-full p-3 bg-[#0F1218] border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#D4AF37] outline-none"
                  data-testid="catalog-gate-email"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="catalog-gate-submit"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                  Pobierz katalog
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-[#0F1218]" />
              </div>
              <h4 className="text-white text-xl font-bold mb-2">Gotowe!</h4>
              <p className="text-white/50 text-sm mb-6">
                Katalog zostal pobrany. Jesli pobieranie nie rozpoczelo sie automatycznie, kliknij ponizej.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href={`${API}/api/balia-catalog/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors flex items-center justify-center gap-2"
                  data-testid="catalog-gate-download-again"
                >
                  <FileDown size={16} /> Pobierz ponownie
                </a>
                <button onClick={onClose} className="py-2 text-white/40 text-sm hover:text-white/60">Zamknij</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
