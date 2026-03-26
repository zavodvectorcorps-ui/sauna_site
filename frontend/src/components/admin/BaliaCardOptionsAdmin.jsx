import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaCardOptionsAdmin = ({ authHeader, showMessage }) => {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({ enabled_categories: [] });
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/balia/calculator/prices`).then(r => r.json()).catch(() => ({ categories: [] })),
      fetch(`${API}/api/balia/card-options-settings`).then(r => r.json()).catch(() => ({ enabled_categories: [] })),
    ]).then(([apiData, settingsData]) => {
      setCategories(apiData.categories || []);
      setSettings(settingsData);
      setLoading(false);
    });
  }, []);

  const toggleCategory = (catId) => {
    const enabled = settings.enabled_categories || [];
    setSettings({
      ...settings,
      enabled_categories: enabled.includes(catId)
        ? enabled.filter(id => id !== catId)
        : [...enabled, catId],
    });
  };

  const handleSave = async () => {
    try {
      await fetchWithAuth(`${API}/api/balia/card-options-settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings),
      });
      showMessage('success', 'Настройки опций карточки сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  // Filter out color categories and categories without meaningful options
  const meaningfulCategories = categories.filter(c =>
    c.id && c.name &&
    !['fiberglass_color', 'acrylic_color', 'bowl_material'].includes(c.id) &&
    c.options?.length > 0
  );

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Опции в карточке товара</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 text-sm hover:bg-[#B09060]">
          <Save size={16} /> Сохранить
        </button>
      </div>
      <p className="text-sm text-[#8C8C8C] mb-6">
        Выберите категории опций из API конфигуратора, которые будут отображаться в карточке товара на сайте. 
        Клиент сможет выбрать опции прямо в карточке и видеть итоговую стоимость.
      </p>

      <div className="space-y-3">
        {meaningfulCategories.map(cat => {
          const isEnabled = (settings.enabled_categories || []).includes(cat.id);
          return (
            <div
              key={cat.id}
              className={`border p-4 transition-colors ${isEnabled ? 'border-[#C6A87C] bg-[#C6A87C]/5' : 'border-black/5'}`}
              data-testid={`admin-balia-card-option-${cat.id}`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleCategory(cat.id)}
                  className="accent-[#C6A87C] mt-0.5"
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">{cat.name}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cat.options?.map(opt => (
                      <span key={opt.id} className="text-[10px] px-2 py-0.5 bg-black/5 text-[#595959]">
                        {opt.name}{opt.price > 0 ? ` (+${opt.price} PLN)` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {meaningfulCategories.length === 0 && (
        <div className="text-center py-12 text-[#8C8C8C]">
          <p>Не удалось загрузить категории из API конфигуратора</p>
        </div>
      )}
    </div>
  );
};
