import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Upload, ChevronDown, ChevronUp, X, Image } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';

const StockSaunaEditor = ({ sauna, onSave, onDelete, onImageUpload }) => {
  const [data, setData] = useState(sauna);
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-black/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-[#F2F2F0] overflow-hidden">
            {data.image ? <img src={data.image} alt={data.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#8C8C8C]"><Image size={24} /></div>}
          </div>
          <div>
            <h4 className="font-medium">{data.name}</h4>
            <p className="text-sm text-[#C6A87C]">{data.discount > 0 ? (<><span className="line-through text-[#8C8C8C] mr-2">{data.price?.toLocaleString()} PLN</span>{Math.round(data.price * (1 - data.discount / 100)).toLocaleString()} PLN</>) : <>{data.price?.toLocaleString()} PLN</>}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.active} onChange={(e) => { const n = { ...data, active: e.target.checked }; setData(n); onSave(n); }} className="accent-[#C6A87C]" />Активна</label>
          <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-[#F9F9F7]">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
          <button onClick={() => onSave(data)} className="p-2 text-[#C6A87C] hover:bg-[#F9F9F7]"><Save size={16} /></button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
        </div>
      </div>
      {expanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-black/5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-xs text-[#8C8C8C]">Название</label><input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            <div><label className="text-xs text-[#8C8C8C]">Цена (PLN)</label><input type="number" value={data.price} onChange={(e) => setData({ ...data, price: parseFloat(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm" /></div>
            <div><label className="text-xs text-[#8C8C8C]">Скидка (%)</label><input type="number" value={data.discount} onChange={(e) => setData({ ...data, discount: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm" min="0" max="100" /></div>
            <div><label className="text-xs text-[#8C8C8C]">Вместимость</label><input value={data.capacity} onChange={(e) => setData({ ...data, capacity: e.target.value })} className="w-full p-2 border border-black/10 text-sm" placeholder="2-4" /></div>
            <div><label className="text-xs text-[#8C8C8C]">Парилка (м²)</label><input value={data.steam_room_size} onChange={(e) => setData({ ...data, steam_room_size: e.target.value })} className="w-full p-2 border border-black/10 text-sm" placeholder="2.5" /></div>
          </div>
          <div>
            <label className="text-xs text-[#8C8C8C]">URL изображения</label>
            <div className="flex gap-2">
              <input value={data.image} onChange={(e) => setData({ ...data, image: e.target.value })} className="flex-1 p-2 border border-black/10 text-sm" />
              <label className="flex items-center gap-1 px-3 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer"><Upload size={14} /><input type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e.target.files[0], (url) => setData({ ...data, image: url }))} /></label>
            </div>
            {data.image && <img src={data.image} alt="Preview" className="mt-2 h-24 object-cover" />}
          </div>
        </div>
      )}
    </div>
  );
};

export const SaunaModelsStockAdmin = ({ authHeader, showMessage, activeSubTab }) => {
  const [modelsConfig, setModelsConfig] = useState(null);
  const [modelsSettings, setModelsSettings] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [stockSaunas, setStockSaunas] = useState([]);
  const [socialProofSettings, setSocialProofSettings] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mcRes, msRes, apiRes, ssRes, spRes] = await Promise.all([
        fetch(`${API}/api/settings/models`),
        fetch(`${API}/api/settings/models-content`),
        fetch(`${API}/api/sauna/prices`),
        fetchWithAuth(`${API}/api/admin/stock-saunas`),
        fetch(`${API}/api/settings/social-proof`),
      ]);
      setModelsConfig(await mcRes.json());
      setModelsSettings(await msRes.json());
      if (apiRes.ok) setApiData(await apiRes.json());
      setStockSaunas(await ssRes.json());
      setSocialProofSettings(await spRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetchWithAuth(`${API}/api/admin/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      callback(data.url.startsWith('http') ? data.url : `${API}${data.url}`);
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  // Models functions
  const saveModelsConfig = async () => {
    try { await fetchWithAuth(`${API}/api/admin/settings/models`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modelsConfig) }); showMessage('success', 'Конфигурация моделей сохранена'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };
  const saveModelsSettings = async () => {
    try { await fetchWithAuth(`${API}/api/admin/settings/models-content`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modelsSettings) }); showMessage('success', 'Тексты блока моделей сохранены'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };
  const toggleShowcaseModel = (modelId) => {
    const enabled = modelsConfig.enabled_models || [];
    setModelsConfig({ ...modelsConfig, enabled_models: enabled.includes(modelId) ? enabled.filter(id => id !== modelId) : [...enabled, modelId] });
  };

  // Stock functions
  const addStockSauna = async () => {
    const newSauna = { id: `sauna_${Date.now()}`, name: 'Новая сауна', image: '', price: 0, discount: 0, capacity: '2-4', steam_room_size: '', relax_room_size: '', features: [], active: true, sort_order: stockSaunas.length };
    try { await fetchWithAuth(`${API}/api/admin/stock-saunas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSauna) }); showMessage('success', 'Сауна добавлена'); fetchData(); } catch { showMessage('error', 'Ошибка добавления'); }
  };
  const saveStockSauna = async (sauna) => {
    try { await fetchWithAuth(`${API}/api/admin/stock-saunas/${sauna.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sauna) }); showMessage('success', 'Сауна сохранена'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };
  const deleteStockSauna = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту сауну?')) return;
    try { await fetchWithAuth(`${API}/api/admin/stock-saunas/${id}`, { method: 'DELETE' }); showMessage('success', 'Сауна удалена'); fetchData(); } catch { showMessage('error', 'Ошибка удаления'); }
  };
  const importModelToStock = async (model) => {
    const imageUrl = model.imageUrl?.startsWith('http') ? model.imageUrl : `${CALCULATOR_API_URL}${model.imageUrl}`;
    const newSauna = { id: `sauna_import_${Date.now()}`, name: model.name, image: imageUrl, price: model.basePrice, discount: model.discount || 0, capacity: model.capacity || '', steam_room_size: model.steamRoomSize || '', relax_room_size: model.relaxRoomSize || '', features: [], active: true, sort_order: stockSaunas.length };
    try { await fetchWithAuth(`${API}/api/admin/stock-saunas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSauna) }); showMessage('success', `Модель "${model.name}" добавлена в наличии`); setShowImportModal(false); fetchData(); } catch { showMessage('error', 'Ошибка импорта'); }
  };

  // Social proof
  const saveSocialProof = async () => {
    try { await fetchWithAuth(`${API}/api/admin/settings/social-proof`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(socialProofSettings) }); showMessage('success', 'Счётчики сохранены'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };
  const updateSocialItem = (index, field, value) => {
    const items = [...socialProofSettings.items];
    items[index] = { ...items[index], [field]: value };
    setSocialProofSettings({ ...socialProofSettings, items });
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  // Models showcase tab
  if (activeSubTab === 'models' && modelsConfig && modelsSettings) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Блок «Модели саун»</h2>
          <div className="flex gap-2">
            <button onClick={saveModelsSettings} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 hover:bg-black text-sm"><Save size={16} /> Тексты</button>
            <button onClick={saveModelsConfig} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060] text-sm"><Save size={16} /> Конфигурация</button>
          </div>
        </div>
        <div className="mb-6 p-4 bg-[#F9F9F7] border border-black/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={modelsConfig.show_section} onChange={(e) => setModelsConfig({ ...modelsConfig, show_section: e.target.checked })} className="w-5 h-5 accent-[#C6A87C]" />
            <div><span className="font-medium">Показывать блок «Модели саун» на сайте</span><p className="text-sm text-[#8C8C8C]">Если выключено, блок не отображается на главной странице</p></div>
          </label>
        </div>
        <div className="border border-black/5 p-6 mb-6">
          <h3 className="font-semibold mb-4">Тексты блока</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label><input type="text" value={modelsSettings.title_pl} onChange={(e) => setModelsSettings({ ...modelsSettings, title_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label><input type="text" value={modelsSettings.title_en} onChange={(e) => setModelsSettings({ ...modelsSettings, title_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label><textarea value={modelsSettings.subtitle_pl} onChange={(e) => setModelsSettings({ ...modelsSettings, subtitle_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label><textarea value={modelsSettings.subtitle_en} onChange={(e) => setModelsSettings({ ...modelsSettings, subtitle_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
          </div>
        </div>
        <div className="border border-black/5 p-6">
          <h3 className="font-semibold mb-2">Выбор моделей</h3>
          <p className="text-sm text-[#8C8C8C] mb-4">Отметьте модели для отображения. Если ничего не выбрано — показываются все.</p>
          {apiData ? (
            <div className="space-y-3">
              {apiData.models.filter(m => m.active).map((model) => {
                const imgUrl = model.imageUrl?.startsWith('http') ? model.imageUrl : `${CALCULATOR_API_URL}${model.imageUrl}`;
                const isEnabled = modelsConfig.enabled_models.length === 0 || modelsConfig.enabled_models.includes(model.id);
                const desc = modelsConfig.descriptions?.[model.id] || {};
                return (
                  <div key={model.id} className={`border transition-all ${isEnabled ? 'border-[#C6A87C] bg-[#C6A87C]/5' : 'border-black/10'}`}>
                    <label className="flex items-center gap-3 p-3 cursor-pointer">
                      <input type="checkbox" checked={isEnabled} onChange={() => toggleShowcaseModel(model.id)} className="accent-[#C6A87C] flex-shrink-0" />
                      <div className="w-14 h-14 bg-[#F2F2F0] overflow-hidden flex-shrink-0"><img src={imgUrl} alt={model.name} className="w-full h-full object-cover" loading="lazy" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{model.name}</p>
                        <p className="text-xs text-[#C6A87C]">{model.basePrice?.toLocaleString()} PLN • {model.variants?.length || 1} вариант(ов)</p>
                        {model.description && <p className="text-xs text-[#8C8C8C] truncate mt-0.5">API: {model.description}</p>}
                      </div>
                    </label>
                    {isEnabled && (
                      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                        <div><label className="block text-[10px] text-[#8C8C8C] mb-0.5">Описание (PL) — переопределяет API</label><textarea value={desc.description_pl || ''} onChange={(e) => setModelsConfig({ ...modelsConfig, descriptions: { ...modelsConfig.descriptions, [model.id]: { ...desc, description_pl: e.target.value } } })} placeholder={model.description || 'Описание из API не задано'} className="w-full p-1.5 border border-black/10 text-xs h-14 resize-none" /></div>
                        <div><label className="block text-[10px] text-[#8C8C8C] mb-0.5">Описание (EN)</label><textarea value={desc.description_en || ''} onChange={(e) => setModelsConfig({ ...modelsConfig, descriptions: { ...modelsConfig.descriptions, [model.id]: { ...desc, description_en: e.target.value } } })} placeholder="English description" className="w-full p-1.5 border border-black/10 text-xs h-14 resize-none" /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8C8C8C]"><p>Не удалось загрузить данные из API калькулятора.</p></div>
          )}
        </div>
      </div>
    );
  }

  // Stock saunas tab
  if (activeSubTab === 'stock_saunas') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Сауны в наличии</h2>
          <div className="flex gap-2">
            {apiData && <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 hover:bg-black text-sm"><Plus size={16} /> Из каталога</button>}
            <button onClick={addStockSauna} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060] text-sm"><Plus size={16} /> Добавить вручную</button>
          </div>
        </div>
        <p className="text-sm text-[#8C8C8C] mb-6">Управляйте карточками саун в блоке "В наличии".</p>
        {showImportModal && apiData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowImportModal(false)}>
            <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Импорт из каталога моделей</h3>
                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-[#F9F9F7]"><X size={20} /></button>
              </div>
              <p className="text-sm text-[#8C8C8C] mb-4">Выберите модель для добавления в раздел "В наличии"</p>
              <div className="space-y-2">
                {apiData.models.filter(m => m.active).map((model) => {
                  const imgUrl = model.imageUrl?.startsWith('http') ? model.imageUrl : `${CALCULATOR_API_URL}${model.imageUrl}`;
                  return (
                    <div key={model.id} className="flex items-center gap-4 p-3 border border-black/5 hover:border-[#C6A87C] transition-colors">
                      <div className="w-16 h-16 bg-[#F2F2F0] overflow-hidden flex-shrink-0"><img src={imgUrl} alt={model.name} className="w-full h-full object-cover" loading="lazy" /></div>
                      <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{model.name}</p><p className="text-xs text-[#8C8C8C]">{model.basePrice?.toLocaleString()} PLN{model.capacity && ` • ${model.capacity} os.`}</p></div>
                      <button onClick={() => importModelToStock(model)} className="flex-shrink-0 px-4 py-2 bg-[#C6A87C] text-white text-sm hover:bg-[#B09060] transition-colors">Добавить</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {stockSaunas.length === 0 ? (
          <div className="text-center py-12 text-[#8C8C8C] border border-dashed border-black/10"><p>Нет саун в наличии</p><p className="text-sm mt-2">Нажмите "Добавить сауну" чтобы создать первую карточку</p></div>
        ) : (
          <div className="space-y-4">{stockSaunas.map((sauna) => <StockSaunaEditor key={sauna.id} sauna={sauna} onSave={saveStockSauna} onDelete={() => deleteStockSauna(sauna.id)} onImageUpload={handleImageUpload} />)}</div>
        )}
      </div>
    );
  }

  // Social proof tab
  if (activeSubTab === 'social_proof' && socialProofSettings) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Счётчики доверия</h2>
          <button onClick={saveSocialProof} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]"><Save size={16} /> Сохранить</button>
        </div>
        <p className="text-sm text-[#8C8C8C] mb-6">Блок со статистикой, который отображается сразу после Hero-секции.</p>
        <div className="mb-6 p-4 bg-[#F9F9F7] border border-black/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={socialProofSettings.show_section} onChange={(e) => setSocialProofSettings({ ...socialProofSettings, show_section: e.target.checked })} className="w-5 h-5 accent-[#C6A87C]" />
            <span className="font-medium">Показывать блок счётчиков</span>
          </label>
        </div>
        <div className="space-y-4">
          {socialProofSettings.items.map((item, index) => (
            <div key={index} className="border border-black/5 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Значение</label><input type="text" value={item.value} onChange={(e) => updateSocialItem(index, 'value', e.target.value)} className="w-full p-2 border border-black/10 text-sm" placeholder="500+" /></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Подпись (PL)</label><input type="text" value={item.label_pl} onChange={(e) => updateSocialItem(index, 'label_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" /></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Подпись (EN)</label><input type="text" value={item.label_en} onChange={(e) => updateSocialItem(index, 'label_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
