import { useState, useEffect, useCallback } from 'react';
import { Save, Upload, Trash2, Plus, Image, GripVertical } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const defaultCards = [
  { icon: 'Bath', title: 'Balia do schładzania w prezencie', subtitle: 'przy saunie od 3 metrów', value: '3 980', desc: 'Idealna do schładzania po seansie w saunie. Dodajemy przy zamówieniu sauny od 3 metrów.', image: '' },
  { icon: 'Lightbulb', title: 'Oświetlenie LED wewnątrz sauny', subtitle: 'bez dopłaty', value: '1 160', desc: 'Oświetlenie LED w łaźni i przebieralni. Lepsza atmosfera i komfort wieczorem.', image: '' },
  { icon: 'DoorOpen', title: 'Drzwi ze szkła hartowanego', subtitle: 'w standardzie', value: '530', desc: 'Szklane drzwi hartowane 8mm w standardzie. Więcej światła i nowoczesny wygląd.', image: '' },
];

const ICON_OPTIONS = ['Bath', 'Lightbulb', 'DoorOpen', 'Gift'];

export const SpecialOfferAdmin = ({ authHeader, showMessage }) => {
  const [cards, setCards] = useState(defaultCards);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    fetch(`${API}/api/settings/special-offer`)
      .then(r => r.json())
      .then(d => { if (d.cards?.length > 0) setCards(d.cards); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file, index) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      updateCard(index, 'image', data.url.startsWith('http') ? data.url : `${API}${data.url}`);
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const saveCards = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/special-offer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'special_offer_settings', cards }),
      });
      showMessage('success', 'Карточки спецпредложения сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const updateCard = (index, field, value) => {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addCard = () => {
    setCards(prev => [...prev, { icon: 'Gift', title: '', subtitle: '', value: '', desc: '', image: '' }]);
  };

  const removeCard = (index) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Спецпредложение (Specjalna oferta)</h2>
          <p className="text-sm text-[#8C8C8C] mt-1">Карточки подарков на главной странице саун. Можно добавить фотографии.</p>
        </div>
        <button onClick={saveCards} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="special-offer-save-btn">
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="space-y-6">
        {cards.map((card, index) => (
          <div key={index} className="border border-black/5 p-5" data-testid={`special-offer-admin-card-${index}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-[#8C8C8C]" />
                <h3 className="font-semibold text-sm">Карточка {index + 1}</h3>
              </div>
              <button onClick={() => removeCard(index)} className="text-red-400 hover:text-red-600 p-1" data-testid={`special-offer-remove-${index}`}>
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок</label>
                <input type="text" value={card.title} onChange={e => updateCard(index, 'title', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок</label>
                <input type="text" value={card.subtitle} onChange={e => updateCard(index, 'subtitle', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[#8C8C8C] mb-1">Стоимость (PLN)</label>
                <input type="text" value={card.value} onChange={e => updateCard(index, 'value', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[#8C8C8C] mb-1">Иконка (если нет фото)</label>
                <select value={card.icon} onChange={e => updateCard(index, 'icon', e.target.value)} className="w-full p-2 border border-black/10 text-sm">
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#8C8C8C] mb-1">Описание</label>
              <textarea value={card.desc} onChange={e => updateCard(index, 'desc', e.target.value)} className="w-full p-2 border border-black/10 text-sm h-16 resize-none" />
            </div>

            <div>
              <label className="block text-xs text-[#8C8C8C] mb-1">Фотография</label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  placeholder="URL фото"
                  value={card.image}
                  onChange={e => updateCard(index, 'image', e.target.value)}
                  className="flex-1 p-2 border border-black/10 text-sm"
                  data-testid={`special-offer-image-url-${index}`}
                />
                <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer hover:bg-black flex-shrink-0">
                  <Upload size={14} /> Загрузить
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], index)} />
                </label>
                {card.image && (
                  <button onClick={() => updateCard(index, 'image', '')} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {card.image ? (
                <div className="mt-3 p-3 bg-[#F9F9F7] border border-black/5">
                  <img src={card.image} alt="Preview" className="h-24 object-contain" />
                </div>
              ) : (
                <div className="mt-3 p-3 bg-[#F9F9F7] border border-black/5 text-center">
                  <Image size={24} className="mx-auto text-[#8C8C8C] mb-1" />
                  <p className="text-[10px] text-[#8C8C8C]">Будет отображаться иконка</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addCard}
        className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-[#C6A87C]/40 text-[#C6A87C] text-sm hover:bg-[#C6A87C]/5 w-full justify-center"
        data-testid="special-offer-add-card"
      >
        <Plus size={16} /> Добавить карточку
      </button>
    </div>
  );
};
