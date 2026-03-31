import { useState, useEffect, useCallback } from 'react';
import { Save, BarChart3, TrendingUp, Users, Download, FileText, Send, MousePointer, Eye } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

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
