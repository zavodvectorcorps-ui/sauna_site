import { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaCalculatorAdmin = ({ authHeader, showMessage }) => {
  const [calculatorConfig, setCalculatorConfig] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { ...options.headers, 'Authorization': authHeader },
    });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [calcRes, apiRes] = await Promise.all([
        fetch(`${API}/api/settings/calculator`),
        fetch(`${API}/api/sauna/prices`),
      ]);
      setCalculatorConfig(await calcRes.json());
      if (apiRes.ok) setApiData(await apiRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveCalculatorConfig = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/calculator`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(calculatorConfig),
      });
      showMessage('success', 'Конфигурация калькулятора сохранена');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const toggleModel = (modelId) => {
    const enabled = calculatorConfig.enabled_models || [];
    if (enabled.includes(modelId)) {
      setCalculatorConfig({ ...calculatorConfig, enabled_models: enabled.filter(id => id !== modelId) });
    } else {
      setCalculatorConfig({ ...calculatorConfig, enabled_models: [...enabled, modelId] });
    }
  };

  const toggleCategory = (categoryId) => {
    const enabled = calculatorConfig.enabled_categories || [];
    if (enabled.includes(categoryId)) {
      setCalculatorConfig({ ...calculatorConfig, enabled_categories: enabled.filter(id => id !== categoryId) });
    } else {
      setCalculatorConfig({ ...calculatorConfig, enabled_categories: [...enabled, categoryId] });
    }
  };

  const toggleOption = (optionId) => {
    const disabled = calculatorConfig.disabled_options || [];
    if (disabled.includes(optionId)) {
      setCalculatorConfig({ ...calculatorConfig, disabled_options: disabled.filter(id => id !== optionId) });
    } else {
      setCalculatorConfig({ ...calculatorConfig, disabled_options: [...disabled, optionId] });
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  if (calculatorConfig && !apiData) {
    return (
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Конфигурация калькулятора</h2>
        <div className="text-center py-12 text-[#8C8C8C]">
          <p>Не удалось загрузить данные из API калькулятора.</p>
          <p className="text-sm mt-2">Внешний сервис временно недоступен.</p>
        </div>
      </div>
    );
  }

  if (!calculatorConfig || !apiData) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Конфигурация калькулятора</h2>
        <button onClick={saveCalculatorConfig} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
          <Save size={16} /> Сохранить
        </button>
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-4">Модели саун</h3>
        <p className="text-sm text-[#8C8C8C] mb-4">Выберите модели для отображения. Пустой список = все включены.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {apiData.models.map((model) => (
            <label key={model.id} className="flex items-center gap-2 p-2 border border-black/5 cursor-pointer hover:border-[#C6A87C]">
              <input type="checkbox" checked={calculatorConfig.enabled_models.length === 0 || calculatorConfig.enabled_models.includes(model.id)} onChange={() => toggleModel(model.id)} className="accent-[#C6A87C]" />
              <span className="text-sm truncate">{model.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Категории и опции</h3>
        <p className="text-sm text-[#8C8C8C] mb-4">Категории: пустой список = все включены. Опции внутри категорий можно отключать по отдельности.</p>
        <div className="space-y-4">
          {apiData.categories.map((cat) => {
            const catEnabled = calculatorConfig.enabled_categories.length === 0 || calculatorConfig.enabled_categories.includes(cat.id);
            const disabled = calculatorConfig.disabled_options || [];
            return (
              <div key={cat.id} className={`border ${catEnabled ? 'border-black/5' : 'border-red-200 bg-red-50/30'} p-3`}>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={catEnabled} onChange={() => toggleCategory(cat.id)} className="accent-[#C6A87C]" />
                  <span className="font-medium text-sm">{cat.name}</span>
                  <span className="text-xs text-[#8C8C8C]">({(cat.options || []).length} опций)</span>
                </label>
                {catEnabled && (cat.options || []).length > 0 && (
                  <div className="ml-6 flex flex-wrap gap-1.5 mt-2">
                    {cat.options.map(opt => {
                      const optDisabled = disabled.includes(opt.id);
                      return (
                        <label key={opt.id} className={`flex items-center gap-1.5 px-2 py-1 text-xs border cursor-pointer transition-colors ${optDisabled ? 'border-red-200 bg-red-50 text-red-400 line-through' : 'border-black/5 hover:border-[#C6A87C]'}`}>
                          <input type="checkbox" checked={!optDisabled} onChange={() => toggleOption(opt.id)} className="accent-[#C6A87C] w-3 h-3" />
                          <span className="truncate max-w-[200px]">{opt.name}</span>
                          {opt.price > 0 && <span className="text-[#C6A87C] whitespace-nowrap">+{opt.price} PLN</span>}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
