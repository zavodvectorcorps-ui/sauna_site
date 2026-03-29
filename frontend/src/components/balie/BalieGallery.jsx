import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Image } from 'lucide-react';
import { useAutoTranslate } from '../../context/AutoTranslateContext';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const { tr } = useAutoTranslate();

  useEffect(() => {
    fetch(`${API}/api/balia/gallery`).then(r => r.json()).then(data => {
      setImages(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openLightbox = (idx) => { setLightbox(idx); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setLightbox(null); document.body.style.overflow = ''; };
  const next = () => setLightbox(p => (p + 1) % images.length);
  const prev = () => setLightbox(p => p === 0 ? images.length - 1 : p - 1);

  useEffect(() => {
    if (lightbox === null) return;
    const h = (e) => { if (e.key === 'Escape') closeLightbox(); if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox, images.length]);

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={24} /></div>;
  if (images.length === 0) return null;

  return (
    <section className="py-20 bg-[#0F1218]" data-testid="balie-gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            <span className="text-[#D4AF37]">{tr('Galeria')}</span> {tr('Realizacji')}
          </h2>
          <p className="text-white/50 text-sm">{tr('Nasze balie w domach naszych klientów')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div key={img.id || idx} className="relative aspect-square overflow-hidden cursor-pointer group" onClick={() => openLightbox(idx)}>
              <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Image size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"><X size={20} /></button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white flex items-center justify-center hover:bg-white/20"><ChevronLeft size={24} /></button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white flex items-center justify-center hover:bg-white/20"><ChevronRight size={24} /></button>
          <img src={images[lightbox]?.url} alt="" className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </section>
  );
};
