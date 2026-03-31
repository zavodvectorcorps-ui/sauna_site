import { useState, useEffect, useCallback } from 'react';
import { Save, BarChart3, TrendingUp, Users, Download, FileText, Send, MousePointer, Eye, Plus, Trash2, Play, Pause, Award } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const BUTTON_OPTIONS = [
  { id: 'hero_primary', label: 'Hero - Главная CTA (сауны)' },
  { id: 'hero_secondary', label: 'Hero - Вторая CTA (сауны)' },
  { id: 'balie_primary', label: 'Balie Hero - Главная CTA' },
  { id: 'balie_secondary', label: 'Balie Hero - Вторая CTA' },
  { id: 'model_details', label: 'Карточка модели - "Zobacz szczegoly"' },
  { id: 'model_configure', label: 'Сравнение - "Skonfiguruj"' },
];

// ═══ A/B Tests Management Panel ═══
const EMPTY_VARIANT = { id: '', text_pl: '', text_en: '', color: '' };

const ABTestsPanel = ({ authHeader, showMessage, fetchWithAuth }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTest, setEditingTest] = useState(null);
  const [form, setForm] = useState({ name: '', button_id: 'hero_primary', variants: [{ ...EMPTY_VARIANT, id: 'a' }, { ...EMPTY_VARIANT, id: 'b' }] });

  const loadTests = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API}/api/admin/ab/tests`);
      setTests(await res.json());
    } catch {}
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => { loadTests(); }, [loadTests]);

  const resetForm = () => {
    setForm({ name: '', button_id: 'hero_primary', variants: [{ ...EMPTY_VARIANT, id: 'a' }, { ...EMPTY_VARIANT, id: 'b' }] });
    setEditingTest(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showMessage('error', 'Введите название теста'); return; }
    const hasText = form.variants.every(v => v.text_pl.trim());
    if (!hasText) { showMessage('error', 'Заполните текст для всех вариантов'); return; }
    try {
      if (editingTest) {
        await fetchWithAuth(`${API}/api/admin/ab/tests/${editingTest}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, button_id: form.button_id, variants: form.variants }),
        });
        showMessage('success', 'Тест обновлён');
      } else {
        await fetchWithAuth(`${API}/api/admin/ab/tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        showMessage('success', 'Тест создан');
      }
      resetForm();
      loadTests();
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const toggleStatus = async (test) => {
    const newStatus = test.status === 'active' ? 'paused' : 'active';
    await fetchWithAuth(`${API}/api/admin/ab/tests/${test.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    showMessage('success', newStatus === 'active' ? 'Тест запущен' : 'Тест приостановлен');
    loadTests();
  };

  const deleteTest = async (id) => {
    if (!window.confirm('Удалить тест и все его данные?')) return;
    await fetchWithAuth(`${API}/api/admin/ab/tests/${id}`, { method: 'DELETE' });
    showMessage('success', 'Тест удалён');
    loadTests();
  };

  const editTest = (test) => {
    setEditingTest(test.id);
    setForm({ name: test.name, button_id: test.button_id, variants: test.variants || [] });
  };

  const addVariant = () => {
    const nextId = String.fromCharCode(97 + form.variants.length); // a, b, c, d...
    setForm(prev => ({ ...prev, variants: [...prev.variants, { ...EMPTY_VARIANT, id: nextId }] }));
  };

  const updateVariant = (index, field, value) => {
    setForm(prev => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const removeVariant = (index) => {
    if (form.variants.length <= 2) { showMessage('error', 'Минимум 2 варианта'); return; }
    setForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const getConversionRate = (stats, variantId) => {
    const s = stats?.[variantId];
    if (!s || !s.unique_impressions) return 0;
    return ((s.unique_clicks / s.unique_impressions) * 100);
  };

  const getWinner = (test) => {
    if (!test.stats || !test.variants?.length) return null;
    let best = null;
    let bestRate = -1;
    test.variants.forEach(v => {
      const rate = getConversionRate(test.stats, v.id);
      if (rate > bestRate) { bestRate = rate; best = v; }
    });
    return bestRate > 0 ? best : null;
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]" data-testid="ab-tests-title">A/B Тестирование CTA</h2>
          <p className="text-sm text-[#8C8C8C] mt-1">Тестируйте текст, цвет и варианты кнопок для максимальной конверсии</p>
        </div>
      </div>

      {/* ── Create / Edit form ── */}
      <div className="border border-black/5 p-5 mb-6" data-testid="ab-test-form">
        <h3 className="font-semibold text-sm mb-4">{editingTest ? 'Редактирование теста' : 'Новый тест'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-[#8C8C8C] mb-1">Название теста</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Например: Hero CTA текст"
              className="w-full p-2 border border-black/10 text-sm"
              data-testid="ab-test-name-input"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8C8C8C] mb-1">Кнопка</label>
            <select
              value={form.button_id}
              onChange={e => setForm(prev => ({ ...prev, button_id: e.target.value }))}
              className="w-full p-2 border border-black/10 text-sm bg-white"
              data-testid="ab-test-button-select"
            >
              {BUTTON_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="block text-xs text-[#8C8C8C] mb-2">Варианты</label>
        <div className="space-y-3 mb-4">
          {form.variants.map((variant, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#F9F9F7] border border-black/5">
              <div className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A] text-white text-xs font-bold flex-shrink-0 mt-1">
                {variant.id.toUpperCase()}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[#8C8C8C]">Текст (PL)</label>
                  <input
                    type="text"
                    value={variant.text_pl}
                    onChange={e => updateVariant(i, 'text_pl', e.target.value)}
                    placeholder="Текст кнопки на польском"
                    className="w-full p-1.5 border border-black/10 text-sm"
                    data-testid={`ab-variant-${variant.id}-text-pl`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8C8C8C]">Текст (EN)</label>
                  <input
                    type="text"
                    value={variant.text_en}
                    onChange={e => updateVariant(i, 'text_en', e.target.value)}
                    placeholder="English text (optional)"
                    className="w-full p-1.5 border border-black/10 text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-[#8C8C8C]">Цвет кнопки</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={variant.color || '#C6A87C'}
                        onChange={e => updateVariant(i, 'color', e.target.value)}
                        className="w-8 h-8 border border-black/10 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={variant.color || ''}
                        onChange={e => updateVariant(i, 'color', e.target.value)}
                        placeholder="(по умолчанию)"
                        className="flex-1 p-1.5 border border-black/10 text-sm font-mono"
                      />
                    </div>
                  </div>
                  {form.variants.length > 2 && (
                    <button onClick={() => removeVariant(i)} className="p-1.5 text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={addVariant} className="flex items-center gap-1 text-xs text-[#C6A87C] hover:text-[#B09060] font-medium" data-testid="ab-add-variant-btn">
            <Plus size={14} /> Добавить вариант
          </button>
          <div className="flex-1" />
          {editingTest && (
            <button onClick={resetForm} className="px-4 py-2 text-xs border border-black/10 text-[#595959] hover:bg-black/5">
              Отмена
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#C6A87C] text-white px-5 py-2 text-sm font-medium hover:bg-[#B09060]" data-testid="ab-save-test-btn">
            <Save size={14} /> {editingTest ? 'Сохранить' : 'Создать тест'}
          </button>
        </div>
      </div>

      {/* ── Active tests with stats ── */}
      {tests.length === 0 ? (
        <div className="border border-dashed border-black/10 p-8 text-center" data-testid="ab-no-tests">
          <BarChart3 size={32} className="mx-auto text-[#8C8C8C] mb-3" />
          <p className="text-sm text-[#8C8C8C]">Нет тестов. Создайте первый A/B тест выше.</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="ab-tests-list">
          {tests.map(test => {
            const winner = getWinner(test);
            const buttonLabel = BUTTON_OPTIONS.find(b => b.id === test.button_id)?.label || test.button_id;
            return (
              <div key={test.id} className="border border-black/5 overflow-hidden" data-testid={`ab-test-${test.id}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-[#F9F9F7] border-b border-black/5">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${test.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {test.status === 'active' ? <Play size={10} /> : <Pause size={10} />}
                      {test.status === 'active' ? 'Активен' : 'Приостановлен'}
                    </span>
                    <span className="font-semibold text-sm text-[#1A1A1A]">{test.name}</span>
                    <span className="text-xs text-[#8C8C8C]">{buttonLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(test)} className="p-1.5 text-[#595959] hover:text-[#1A1A1A] border border-black/10" title={test.status === 'active' ? 'Приостановить' : 'Запустить'} data-testid={`ab-toggle-${test.id}`}>
                      {test.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button onClick={() => editTest(test)} className="px-3 py-1.5 text-xs border border-black/10 text-[#595959] hover:bg-black/5">Изменить</button>
                    <button onClick={() => deleteTest(test.id)} className="p-1.5 text-red-400 hover:text-red-600 border border-red-200" data-testid={`ab-delete-${test.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Variants stats */}
                <div className="p-4">
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${test.variants?.length || 2}, 1fr)` }}>
                    {(test.variants || []).map(v => {
                      const s = test.stats?.[v.id] || { impressions: 0, clicks: 0, unique_impressions: 0, unique_clicks: 0 };
                      const convRate = s.unique_impressions > 0 ? ((s.unique_clicks / s.unique_impressions) * 100) : 0;
                      const isWinner = winner?.id === v.id;
                      return (
                        <div key={v.id} className={`border p-4 ${isWinner ? 'border-green-300 bg-green-50/50' : 'border-black/5'}`} data-testid={`ab-variant-stat-${v.id}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 flex items-center justify-center bg-[#1A1A1A] text-white text-[10px] font-bold">{v.id.toUpperCase()}</span>
                              {isWinner && <Award size={14} className="text-green-600" />}
                            </div>
                            {v.color && <span className="w-5 h-5 border border-black/10" style={{ backgroundColor: v.color }} />}
                          </div>
                          <p className="text-sm font-medium text-[#1A1A1A] mb-1 truncate" title={v.text_pl}>{v.text_pl || '—'}</p>
                          {v.text_en && <p className="text-xs text-[#8C8C8C] mb-3 truncate">{v.text_en}</p>}
                          <div className="space-y-2 mt-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#8C8C8C]">Показы</span>
                              <span className="font-medium">{s.unique_impressions}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-[#8C8C8C]">Клики</span>
                              <span className="font-medium">{s.unique_clicks}</span>
                            </div>
                            <div className="pt-2 border-t border-black/5 flex justify-between text-xs">
                              <span className="font-semibold text-[#1A1A1A]">Конверсия</span>
                              <span className={`font-bold text-base ${convRate > 0 ? (isWinner ? 'text-green-600' : 'text-[#C6A87C]') : 'text-[#8C8C8C]'}`}>
                                {convRate.toFixed(1)}%
                              </span>
                            </div>
                            {/* Visual bar */}
                            <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{
                                width: `${Math.min(convRate, 100)}%`,
                                backgroundColor: isWinner ? '#059669' : '#C6A87C',
                                minWidth: convRate > 0 ? '4px' : '0',
                              }} />
                            </div>
                          </div>
                          {/* Preview button */}
                          <div className="mt-3 pt-3 border-t border-black/5">
                            <button className="w-full py-2 text-white text-xs font-medium" style={{ backgroundColor: v.color || '#C6A87C' }}>
                              {v.text_pl || 'Превью'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {winner && (
                    <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 p-3">
                      <Award size={16} className="text-green-600 flex-shrink-0" />
                      <span className="text-xs text-green-700">
                        <strong>Лидер: Вариант {winner.id.toUpperCase()}</strong> — "{winner.text_pl}" показывает лучшую конверсию
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-[#FFFBEB] p-5 border border-[#C6A87C]/30">
        <h3 className="font-semibold text-sm mb-2 text-[#92730A]">Как работает A/B тестирование</h3>
        <ul className="text-xs text-[#7A6012] space-y-1 leading-relaxed">
          <li>Каждый посетитель автоматически получает один вариант кнопки (привязка к cookie)</li>
          <li>Один и тот же посетитель всегда видит один и тот же вариант для стабильных результатов</li>
          <li>Показы и клики считаются по уникальным посетителям</li>
          <li>Рекомендуется набрать мин. 100 уникальных показов на вариант перед выводами</li>
          <li>Можно тестировать: текст (PL/EN), цвет кнопки. Для каждой кнопки — один активный тест</li>
        </ul>
      </div>
    </div>
  );
};

export const AnalyticsAdmin = ({ authHeader, showMessage, activeSubTab }) => {
  const [trackingSettings, setTrackingSettings] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, aRes] = await Promise.all([
          fetch(`${API}/api/settings/tracking`),
          fetchWithAuth(`${API}/api/admin/analytics/summary?days=${period}`),
        ]);
        setTrackingSettings(await tRes.json());
        setAnalyticsData(await aRes.json());
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [fetchWithAuth, period]);

  const saveTrackingSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingSettings),
      });
      showMessage('success', 'Настройки трекинга сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  // ───── A/B Tests section ─────
  if (activeSubTab === 'ab_tests') {
    return <ABTestsPanel authHeader={authHeader} showMessage={showMessage} fetchWithAuth={fetchWithAuth} />;
  }

  // Tracking codes settings
  if (activeSubTab === 'tracking') {
    if (!trackingSettings) return null;
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Коды отслеживания</h2>
            <p className="text-sm text-[#8C8C8C] mt-1">GTM, Google Analytics, Google Ads, Facebook Pixel</p>
          </div>
          <button onClick={saveTrackingSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="save-tracking-btn">
            <Save size={16} /> Сохранить
          </button>
        </div>
        <div className="space-y-6">
          {/* Google Tag Manager */}
          <div className="border border-black/5 p-5">
            <h3 className="font-semibold text-sm mb-1">Google Tag Manager</h3>
            <p className="text-xs text-[#8C8C8C] mb-3">Универсальный контейнер для всех тегов. Рекомендуется для Google Ads.</p>
            <div>
              <label className="block text-xs text-[#8C8C8C] mb-1">GTM ID</label>
              <input type="text" value={trackingSettings.gtm_id || ''} onChange={(e) => setTrackingSettings({ ...trackingSettings, gtm_id: e.target.value })} placeholder="GTM-XXXXXXX" className="w-full max-w-sm p-2 border border-black/10 text-sm font-mono" data-testid="gtm-id-input" />
            </div>
          </div>

          {/* Google Analytics 4 */}
          <div className="border border-black/5 p-5">
            <h3 className="font-semibold text-sm mb-1">Google Analytics 4</h3>
            <p className="text-xs text-[#8C8C8C] mb-3">Если используете GTM — GA4 лучше настраивать внутри GTM. Здесь — для standalone.</p>
            <div>
              <label className="block text-xs text-[#8C8C8C] mb-1">GA4 Measurement ID</label>
              <input type="text" value={trackingSettings.ga4_id || ''} onChange={(e) => setTrackingSettings({ ...trackingSettings, ga4_id: e.target.value })} placeholder="G-XXXXXXXXXX" className="w-full max-w-sm p-2 border border-black/10 text-sm font-mono" data-testid="ga4-id-input" />
            </div>
          </div>

          {/* Google Ads */}
          <div className="border border-black/5 p-5">
            <h3 className="font-semibold text-sm mb-1">Google Ads</h3>
            <p className="text-xs text-[#8C8C8C] mb-3">Для отслеживания конверсий Google Ads. Конверсии отправляются автоматически при отправке любой формы.</p>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-xs text-[#8C8C8C] mb-1">Ads Conversion ID</label>
                <input type="text" value={trackingSettings.google_ads_id || ''} onChange={(e) => setTrackingSettings({ ...trackingSettings, google_ads_id: e.target.value })} placeholder="AW-XXXXXXXXX" className="w-full p-2 border border-black/10 text-sm font-mono" data-testid="google-ads-id-input" />
              </div>
              <div>
                <label className="block text-xs text-[#8C8C8C] mb-1">Conversion Label</label>
                <input type="text" value={trackingSettings.google_ads_conversion_label || ''} onChange={(e) => setTrackingSettings({ ...trackingSettings, google_ads_conversion_label: e.target.value })} placeholder="AbCdEf..." className="w-full p-2 border border-black/10 text-sm font-mono" data-testid="google-ads-label-input" />
              </div>
            </div>
          </div>

          {/* Facebook Pixel */}
          <div className="border border-black/5 p-5">
            <h3 className="font-semibold text-sm mb-1">Facebook / Meta Pixel</h3>
            <p className="text-xs text-[#8C8C8C] mb-3">Для отслеживания конверсий Facebook/Instagram рекламы. Lead-события отправляются автоматически.</p>
            <div>
              <label className="block text-xs text-[#8C8C8C] mb-1">Pixel ID</label>
              <input type="text" value={trackingSettings.facebook_pixel_id || ''} onChange={(e) => setTrackingSettings({ ...trackingSettings, facebook_pixel_id: e.target.value })} placeholder="XXXXXXXXXXXXXXXX" className="w-full max-w-sm p-2 border border-black/10 text-sm font-mono" data-testid="fb-pixel-id-input" />
            </div>
          </div>

          {/* Custom code */}
          <div className="border border-black/5 p-5">
            <h3 className="font-semibold text-sm mb-1">Свой код в &lt;head&gt;</h3>
            <p className="text-xs text-[#8C8C8C] mb-3">Любой HTML/JS код, который будет вставлен в &lt;head&gt; страницы. Например, верификация домена.</p>
            <textarea value={trackingSettings.custom_head_code || ''} onChange={(e) => setTrackingSettings({ ...trackingSettings, custom_head_code: e.target.value })} placeholder='<meta name="verification" content="..." />' className="w-full p-2 border border-black/10 text-sm font-mono h-24" data-testid="custom-head-code-input" />
          </div>

          {/* Instructions */}
          <div className="bg-[#F9F9F7] p-5 border border-black/5">
            <h3 className="font-semibold text-sm mb-3">Автоматические события конверсий</h3>
            <p className="text-xs text-[#8C8C8C] mb-3">Сайт автоматически отправляет следующие события:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2"><Eye size={12} className="text-[#C6A87C]" /> <code className="bg-white px-1.5 py-0.5 border border-black/5">page_view</code> — просмотр страницы</div>
              <div className="flex items-center gap-2"><MousePointer size={12} className="text-[#C6A87C]" /> <code className="bg-white px-1.5 py-0.5 border border-black/5">click_cta</code> — клик по CTA</div>
              <div className="flex items-center gap-2"><Send size={12} className="text-[#C6A87C]" /> <code className="bg-white px-1.5 py-0.5 border border-black/5">generate_lead</code> — отправка формы</div>
              <div className="flex items-center gap-2"><Download size={12} className="text-[#C6A87C]" /> <code className="bg-white px-1.5 py-0.5 border border-black/5">catalog_download</code> — скачивание каталога</div>
            </div>
            <p className="text-xs text-[#8C8C8C] mt-3">В Google Ads и Facebook эти события маппятся как Lead. UTM-метки сохраняются автоматически.</p>
          </div>

          {/* Quick start tip */}
          <div className="bg-[#FFFBEB] p-5 border border-[#C6A87C]/30">
            <h3 className="font-semibold text-sm mb-2 text-[#92730A]">Быстрый старт</h3>
            <p className="text-xs text-[#7A6012] leading-relaxed">Для запуска <strong>Google Ads</strong> достаточно вставить GTM ID выше и настроить конверсии внутри Google Tag Manager. Для <strong>Facebook</strong> — вставить Pixel ID. Всё остальное сайт делает автоматически: отправляет события <code>Lead</code> при заполнении любой формы и <code>PageView</code> при переходах между страницами.</p>
          </div>
        </div>
      </div>
    );
  }

  // Analytics dashboard
  if (!analyticsData) return <p className="text-[#8C8C8C] text-sm py-8 text-center">Нет данных аналитики</p>;

  const { totals, daily, utm_sources, forms } = analyticsData;
  const pageViews = totals.page_view || 0;
  const ctaClicks = totals.click_cta || 0;
  const totalLeads = (totals.generate_lead || 0) + (totals.catalog_download || 0);
  const convRate = pageViews > 0 ? ((totalLeads / pageViews) * 100).toFixed(1) : '0.0';

  // Build chart data
  const dailyDays = Object.keys(daily).sort();
  const maxValue = Math.max(1, ...dailyDays.map(d => Math.max(daily[d].page_view || 0, (daily[d].generate_lead || 0) + (daily[d].catalog_download || 0))));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Аналитика конверсий</h2>
          <p className="text-sm text-[#8C8C8C] mt-1">Встроенная статистика за последние {period} дней</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setPeriod(d)} className={`px-3 py-1.5 text-xs font-medium border transition-colors ${period === d ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-black/10 text-[#595959] hover:bg-black/5'}`} data-testid={`period-${d}`}>
              {d}д
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-black/5 p-4" data-testid="stat-page-views">
          <div className="flex items-center gap-2 mb-2"><Eye size={16} className="text-[#8C8C8C]" /><span className="text-xs text-[#8C8C8C] uppercase tracking-wider">Визиты</span></div>
          <p className="text-2xl font-bold text-[#1A1A1A]">{pageViews.toLocaleString()}</p>
        </div>
        <div className="border border-black/5 p-4" data-testid="stat-cta-clicks">
          <div className="flex items-center gap-2 mb-2"><MousePointer size={16} className="text-[#8C8C8C]" /><span className="text-xs text-[#8C8C8C] uppercase tracking-wider">Клики CTA</span></div>
          <p className="text-2xl font-bold text-[#1A1A1A]">{ctaClicks.toLocaleString()}</p>
        </div>
        <div className="border border-black/5 p-4" data-testid="stat-total-leads">
          <div className="flex items-center gap-2 mb-2"><Send size={16} className="text-[#C6A87C]" /><span className="text-xs text-[#8C8C8C] uppercase tracking-wider">Заявки</span></div>
          <p className="text-2xl font-bold text-[#C6A87C]">{totalLeads.toLocaleString()}</p>
        </div>
        <div className="border border-black/5 p-4" data-testid="stat-conv-rate">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-600" /><span className="text-xs text-[#8C8C8C] uppercase tracking-wider">Конверсия</span></div>
          <p className="text-2xl font-bold text-green-600">{convRate}%</p>
        </div>
      </div>

      {/* Chart */}
      {dailyDays.length > 0 && (
        <div className="border border-black/5 p-5 mb-8">
          <h3 className="font-semibold text-sm mb-4">Динамика по дням</h3>
          <div className="flex items-end gap-px h-40" data-testid="analytics-chart">
            {dailyDays.map(day => {
              const views = daily[day].page_view || 0;
              const leads = (daily[day].generate_lead || 0) + (daily[day].catalog_download || 0);
              const viewH = Math.max(2, (views / maxValue) * 100);
              const leadH = Math.max(0, (leads / maxValue) * 100);
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-0.5 group relative" title={`${day}\nВизиты: ${views}\nЗаявки: ${leads}`}>
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '140px', justifyContent: 'flex-end' }}>
                    <div className="w-full bg-[#E8E0D4] rounded-t-sm transition-all" style={{ height: `${viewH}%`, minHeight: '2px' }} />
                    {leads > 0 && <div className="w-full bg-[#C6A87C] rounded-t-sm" style={{ height: `${leadH}%`, minHeight: '2px' }} />}
                  </div>
                  {/* Label every 7th day */}
                  {(dailyDays.indexOf(day) % 7 === 0 || dailyDays.indexOf(day) === dailyDays.length - 1) && (
                    <span className="text-[9px] text-[#8C8C8C] mt-1 whitespace-nowrap">{day.slice(5)}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#8C8C8C]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-[#E8E0D4] inline-block" /> Визиты</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-[#C6A87C] inline-block" /> Заявки</span>
          </div>
        </div>
      )}

      {/* Funnel: Forms breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-black/5 p-5">
          <h3 className="font-semibold text-sm mb-4">Разбивка заявок</h3>
          <div className="space-y-3" data-testid="forms-breakdown">
            {[
              { label: 'Контактная форма', count: forms.contact, icon: Send, color: '#595959' },
              { label: 'Калькулятор', count: forms.calculator_order, icon: FileText, color: '#C6A87C' },
              { label: 'Запрос модели', count: forms.model_inquiry, icon: Users, color: '#339DC7' },
              { label: 'Скачивание каталога', count: forms.catalog_request, icon: Download, color: '#059669' },
            ].map(item => {
              const pct = forms.total > 0 ? ((item.count / forms.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2 text-xs"><item.icon size={12} style={{ color: item.color }} /> {item.label}</span>
                    <span className="text-xs font-medium">{item.count} <span className="text-[#8C8C8C]">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-black/5 flex justify-between text-xs font-semibold">
              <span>Всего</span>
              <span>{forms.total}</span>
            </div>
          </div>
        </div>

        {/* UTM Sources */}
        <div className="border border-black/5 p-5">
          <h3 className="font-semibold text-sm mb-4">Источники трафика (UTM)</h3>
          {utm_sources.length > 0 ? (
            <div className="space-y-2" data-testid="utm-sources">
              {utm_sources.slice(0, 10).map((u, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate mr-2">
                    <span className="font-medium">{u.source}</span>
                    {u.medium && <span className="text-[#8C8C8C]"> / {u.medium}</span>}
                    {u.campaign && <span className="text-[#8C8C8C]"> / {u.campaign}</span>}
                  </span>
                  <span className="font-medium whitespace-nowrap">{u.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8C8C8C]">Нет данных по UTM-меткам. Добавьте UTM-параметры к рекламным ссылкам (utm_source, utm_medium, utm_campaign).</p>
          )}
        </div>
      </div>

      {/* Conversion funnel */}
      <div className="border border-black/5 p-5">
        <h3 className="font-semibold text-sm mb-4">Воронка конверсий</h3>
        <div className="flex items-center gap-3" data-testid="conversion-funnel">
          {[
            { label: 'Визиты', value: pageViews, color: '#E8E0D4' },
            { label: 'Клики CTA', value: ctaClicks, color: '#D4C5A9' },
            { label: 'Заявки', value: (forms.contact || 0) + (forms.calculator_order || 0) + (forms.model_inquiry || 0), color: '#C6A87C' },
            { label: 'Каталог', value: forms.catalog_request || 0, color: '#059669' },
          ].map((step, i, arr) => {
            const width = arr[0].value > 0 ? Math.max(20, (step.value / arr[0].value) * 100) : 20;
            const prevVal = i > 0 ? arr[i - 1].value : 0;
            const dropOff = prevVal > 0 ? ((1 - step.value / prevVal) * 100).toFixed(0) : null;
            return (
              <div key={step.label} className="flex-1 text-center">
                <div className="mb-2 mx-auto rounded" style={{ height: '48px', width: `${width}%`, backgroundColor: step.color, minWidth: '40px' }} />
                <p className="text-lg font-bold text-[#1A1A1A]">{step.value.toLocaleString()}</p>
                <p className="text-xs text-[#8C8C8C]">{step.label}</p>
                {dropOff && <p className="text-[10px] text-red-400 mt-0.5">-{dropOff}%</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
