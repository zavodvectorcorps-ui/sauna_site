import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Loader2, Users, Droplets, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ProductCard = ({ product, onClick }) => (
  <div
    onClick={() => onClick(product)}
    className="bg-[#1A1E27] border border-white/5 overflow-hidden cursor-pointer group hover:border-[#D4AF37]/30 transition-all"
    data-testid={`balie-product-${product.id}`}
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      {product.tags?.length > 0 && (
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="bg-[#D4AF37] text-[#0F1218] text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">{tag}</span>
          ))}
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="text-white font-semibold text-lg mb-1">{product.name}</h3>
      <p className="text-[#D4AF37] font-bold mb-2">{product.price}</p>
      {product.description && <p className="text-white/40 text-sm line-clamp-2 mb-4">{product.description}</p>}
      <div className="flex items-center gap-2 text-white/60 text-sm group-hover:text-[#D4AF37] transition-colors">
        Szczegóły <ArrowRight size={14} />
      </div>
    </div>
  </div>
);

const ProductModal = ({ product, apiModel, onClose, onConfigure }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const images = [product.image, ...(product.gallery_images || [])].filter(Boolean);
  const specs = apiModel?.specs || {};

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4 pt-8" onClick={onClose}>
      <div className="bg-[#1A1E27] max-w-4xl w-full my-4" onClick={e => e.stopPropagation()} data-testid="balie-product-modal">
        <div className="relative aspect-[2/1] bg-[#0F1218]">
          <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIdx(p => p === 0 ? images.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white flex items-center justify-center hover:bg-[#D4AF37]"><ChevronLeft size={20} /></button>
              <button onClick={() => setImgIdx(p => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white flex items-center justify-center hover:bg-[#D4AF37]"><ChevronRight size={20} /></button>
            </>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 bg-black/50 text-white flex items-center justify-center hover:bg-red-500"><X size={20} /></button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{product.name}</h2>
              <p className="text-[#D4AF37] text-xl font-bold mt-1">{product.price}</p>
            </div>
          </div>

          {product.description && <p className="text-white/50 leading-relaxed mb-6">{product.description}</p>}

          {apiModel && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-[#0F1218] border border-white/5">
              {specs.outerDiameter && <div className="text-center"><Ruler size={16} className="mx-auto text-[#D4AF37] mb-1" /><div className="text-white/40 text-xs">Średnica</div><div className="text-white font-semibold">{specs.outerDiameter} cm</div></div>}
              {specs.depth && <div className="text-center"><Droplets size={16} className="mx-auto text-[#D4AF37] mb-1" /><div className="text-white/40 text-xs">Głębokość</div><div className="text-white font-semibold">{specs.depth} cm</div></div>}
              {specs.waterCapacity && <div className="text-center"><Droplets size={16} className="mx-auto text-[#D4AF37] mb-1" /><div className="text-white/40 text-xs">Pojemność</div><div className="text-white font-semibold">{specs.waterCapacity} L</div></div>}
              {specs.seats > 0 && <div className="text-center"><Users size={16} className="mx-auto text-[#D4AF37] mb-1" /><div className="text-white/40 text-xs">Miejsca</div><div className="text-white font-semibold">{specs.seats} osób</div></div>}
            </div>
          )}

          {apiModel?.availableHeaterTypes?.length > 0 && (
            <div className="mb-6">
              <span className="text-white/40 text-sm">Dostępne piece: </span>
              <span className="text-white text-sm">
                {apiModel.availableHeaterTypes.map(t => t === 'integrated' ? 'Zintegrowany' : 'Zewnętrzny').join(', ')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={onConfigure} className="py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors" data-testid="balie-modal-configure">
              Skonfiguruj ten model
            </button>
            <button onClick={onClose} className="py-3 border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BalieProducts = () => {
  const [products, setProducts] = useState([]);
  const [apiModels, setApiModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/balia/products`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/balia/calculator/prices`).then(r => r.json()).catch(() => ({ models: [] })),
    ]).then(([prods, api]) => {
      setProducts(prods);
      setApiModels(api.models || []);
      setLoading(false);
    });
  }, []);

  const getApiModel = (id) => apiModels.find(m => m.id === id);

  const handleConfigure = (product) => {
    setSelected(null);
    navigate(product.api_model_id ? `/balie/konfigurator?model=${product.api_model_id}` : '/balie/konfigurator');
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={32} /></div>;
  if (products.length === 0) return null;

  return (
    <section id="produkty" className="py-20 bg-[#0F1218]" data-testid="balie-products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Nasza <span className="text-[#D4AF37]">Kolekcja</span>
          </h2>
          <p className="text-white/50 text-sm">Wybierz idealną balię dla swojego ogrodu</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onClick={setSelected} />
          ))}
        </div>

        <div className="text-center mt-10">
          <button onClick={() => navigate('/balie/konfigurator')} className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37] font-medium hover:bg-[#D4AF37] hover:text-[#0F1218] transition-colors" data-testid="balie-go-configurator">
            Skonfiguruj własną balię
          </button>
        </div>
      </div>

      {selected && (
        <ProductModal
          product={selected}
          apiModel={getApiModel(selected.api_model_id)}
          onClose={() => setSelected(null)}
          onConfigure={() => handleConfigure(selected)}
        />
      )}
    </section>
  );
};
