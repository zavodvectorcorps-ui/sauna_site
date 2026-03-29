import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const OrderProcessAdmin = ({ authHeader, showMessage, type = 'sauna' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const endpoint = type === 'balia' ? 'balia-order-process' : 'order-process';
  const label = type === 'balia' ? 'купелей' : 'саун';

  useEffect(() => {
    fetch(`${API}/api/admin/settings/${endpoint}`, { headers: { Authorization: authHeader } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => showMessage('error', 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings/${endpoint}`, {
        method: 'PUT',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) showMessage('success', 'Сохранено');
      else showMessage('error', 'Ошибка сохранения');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const addStep = () => {
    const id = 's_' + Date.now();
    const num = (data.steps || []).length + 1;
    setData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { id, number: String(num), title: '', desc: '' }],
    }));
  };

  const updateStep = (idx, field, value) => {
    setData(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }));
  };

  const removeStep = (idx) => {
    setData(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="py-8 text-center text-gray-400">Загрузка...</div>;
  if (!data) return null;

  return (
    <div data-testid={`order-process-admin-${type}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Процесс заказа ({label})</h2>
        <button onClick={save} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid={`order-process-save-${type}`}>
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Заголовок</label>
            <input type="text" value={data.title || ''} onChange={e => setData(prev => ({ ...prev, title: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Подзаголовок</label>
            <input type="text" value={data.subtitle || ''} onChange={e => setData(prev => ({ ...prev, subtitle: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Шаги ({(data.steps || []).length})</h3>
        <button onClick={addStep} className="flex items-center gap-1 text-sm text-[#C6A87C] hover:text-[#B09060]" data-testid={`order-process-add-${type}`}>
          <Plus size={14} /> Добавить шаг
        </button>
      </div>

      <div className="space-y-3">
        {(data.steps || []).map((step, idx) => (
          <div key={step.id || idx} className="p-4 border border-black/5 bg-[#F9F9F7]" data-testid={`order-step-admin-${idx}`}>
            <div className="flex items-start gap-3">
              <GripVertical size={16} className="text-gray-300 mt-2 flex-shrink-0" />
              <div className="w-10 h-10 rounded-full border-2 border-[#C6A87C]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[#C6A87C] text-sm font-bold">{step.number || idx + 1}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Номер</label>
                    <input type="text" value={step.number || ''} onChange={e => updateStep(idx, 'number', e.target.value)} className="w-full p-2 border border-black/10 text-sm text-center" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-400 mb-1">Заголовок шага</label>
                    <input type="text" value={step.title || ''} onChange={e => updateStep(idx, 'title', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Описание</label>
                  <textarea value={step.desc || ''} onChange={e => updateStep(idx, 'desc', e.target.value)} className="w-full p-2 border border-black/10 text-sm" rows={2} />
                </div>
              </div>
              <button onClick={() => removeStep(idx)} className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0" data-testid={`order-step-delete-${idx}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(data.steps || []).length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200">
          Нет шагов. Нажмите "Добавить шаг" для начала.
        </div>
      )}
    </div>
  );
};
