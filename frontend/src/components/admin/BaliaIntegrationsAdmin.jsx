import { useState, useEffect, useCallback } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaIntegrationsAdmin = ({ authHeader, showMessage }) => {
  const [settings, setSettings] = useState(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingAmoLead, setTestingAmoLead] = useState(false);
  const [amoPipelines, setAmoPipelines] = useState([]);
  const [amoUsers, setAmoUsers] = useState([]);
  const [amoLeadFields, setAmoLeadFields] = useState([]);
  const [amoContactFields, setAmoContactFields] = useState([]);
  const [amoConnected, setAmoConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const loadAmoData = useCallback(async () => {
    try {
      const [pR, uR, lfR, cfR] = await Promise.allSettled([
        fetchWithAuth(`${API}/api/admin/amocrm/pipelines`),
        fetchWithAuth(`${API}/api/admin/amocrm/users`),
        fetchWithAuth(`${API}/api/admin/amocrm/fields?entity=leads`),
        fetchWithAuth(`${API}/api/admin/amocrm/fields?entity=contacts`),
      ]);
      if (pR.status === 'fulfilled') setAmoPipelines((await pR.value.json()).pipelines || []);
      if (uR.status === 'fulfilled') setAmoUsers((await uR.value.json()).users || []);
      if (lfR.status === 'fulfilled') setAmoLeadFields((await lfR.value.json()).fields || []);
      if (cfR.status === 'fulfilled') setAmoContactFields((await cfR.value.json()).fields || []);
      setAmoConnected(true);
    } catch { showMessage('error', 'Ошибка загрузки данных AMO CRM'); }
  }, [fetchWithAuth, showMessage]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(`${API}/api/admin/settings/balia-integrations`);
        const data = await res.json();
        setSettings(data);
        // Check if sauna AMO is connected to load pipelines/fields
        const saunaRes = await fetchWithAuth(`${API}/api/admin/settings/integrations`);
        const saunaData = await saunaRes.json();
        if (saunaData.amocrm_access_token) {
          try {
            const statusRes = await fetch(`${API}/api/admin/amocrm/status`, { headers: { 'Authorization': authHeader } });
            if (statusRes.ok) { const d = await statusRes.json(); if (d.connected) loadAmoData(); setAmoConnected(d.connected); }
          } catch {}
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [fetchWithAuth, authHeader, loadAmoData]);

  const saveSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/balia-integrations`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings),
      });
      showMessage('success', 'Настройки интеграций купелей сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const testTelegram = async () => {
    setTestingTelegram(true);
    try { const res = await fetchWithAuth(`${API}/api/admin/test-balia-telegram`, { method: 'POST' }); const d = await res.json(); showMessage('success', d.message || 'Тест отправлен'); }
    catch (e) { showMessage('error', e.message || 'Ошибка теста Telegram'); }
    setTestingTelegram(false);
  };

  const testAmoLead = async () => {
    setTestingAmoLead(true);
    try { const res = await fetchWithAuth(`${API}/api/admin/test-balia-amocrm-lead`, { method: 'POST' }); const d = await res.json(); showMessage('success', d.message || 'Тестовая сделка отправлена'); }
    catch (e) { showMessage('error', e.message || 'Ошибка отправки тестовой сделки'); }
    setTestingAmoLead(false);
  };

  const getSelectedPipelineStatuses = () => {
    const pipeline = amoPipelines.find(p => p.id === settings?.amocrm_pipeline_id);
    return pipeline?.statuses || [];
  };

  if (loading || !settings) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Интеграции купелей (WM-Balia)</h2>
          <p className="text-sm text-[#8C8C8C] mt-1">Отдельный Telegram-бот и воронка AMO CRM для заявок с купелей. API-ключ AMO берётся из настроек саун.</p>
        </div>
        <button onClick={saveSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="balia-integrations-save"><Save size={16} /> Сохранить</button>
      </div>

      {/* Telegram */}
      <div className="border border-black/5 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#229ED9] flex items-center justify-center text-white font-bold text-lg">T</div>
            <div><h3 className="font-semibold">Telegram (Купели)</h3><p className="text-xs text-[#8C8C8C]">Отдельный бот для заявок WM-Balia</p></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.telegram_enabled} onChange={(e) => setSettings({ ...settings, telegram_enabled: e.target.checked })} className="w-5 h-5 accent-[#C6A87C]" data-testid="balia-tg-enabled" />
            <span className="text-sm">{settings.telegram_enabled ? 'Включено' : 'Выключено'}</span>
          </label>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[#8C8C8C] mb-1">Токен бота</label>
            <input type="text" value={settings.telegram_bot_token} onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })} placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" className="w-full p-2 border border-black/10 text-sm font-mono" data-testid="balia-tg-token" />
            <p className="text-[10px] text-[#8C8C8C] mt-1">Получите через @BotFather</p>
          </div>
          <div>
            <label className="block text-xs text-[#8C8C8C] mb-1">Chat ID</label>
            <input type="text" value={settings.telegram_chat_id} onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })} placeholder="-1001234567890" className="w-full p-2 border border-black/10 text-sm font-mono" data-testid="balia-tg-chat-id" />
          </div>
          <button onClick={testTelegram} disabled={testingTelegram || !settings.telegram_bot_token || !settings.telegram_chat_id} className="flex items-center gap-2 px-4 py-2 bg-[#229ED9] text-white text-sm hover:bg-[#1a8ec5] disabled:opacity-40 disabled:cursor-not-allowed" data-testid="balia-tg-test-btn">
            {testingTelegram ? <Loader2 size={14} className="animate-spin" /> : null}Отправить тестовое сообщение
          </button>
        </div>
      </div>

      {/* AMO CRM */}
      <div className="border border-black/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#339DC7] flex items-center justify-center text-white font-bold text-sm">AMO</div>
            <div><h3 className="font-semibold">AMO CRM (Купели)</h3><p className="text-xs text-[#8C8C8C]">Отдельная воронка. API-ключ берётся из настроек саун.</p></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.amocrm_enabled} onChange={(e) => setSettings({ ...settings, amocrm_enabled: e.target.checked })} className="w-5 h-5 accent-[#C6A87C]" data-testid="balia-amo-enabled" />
            <span className="text-sm">{settings.amocrm_enabled ? 'Включено' : 'Выключено'}</span>
          </label>
        </div>

        {!amoConnected && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4">
            AMO CRM не подключен. Убедитесь, что API-ключ и домен указаны в настройках интеграций саун.
          </div>
        )}

        <div className="space-y-4">
          {/* Pipeline / Status */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-3">Воронка и этап</h4>
            {amoConnected && amoPipelines.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Воронка</label><select value={settings.amocrm_pipeline_id || ''} onChange={(e) => setSettings({ ...settings, amocrm_pipeline_id: parseInt(e.target.value) || 0, amocrm_status_id: 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" data-testid="balia-amo-pipeline"><option value="">-- выберите --</option>{amoPipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Этап</label><select value={settings.amocrm_status_id || ''} onChange={(e) => setSettings({ ...settings, amocrm_status_id: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" disabled={!settings.amocrm_pipeline_id} data-testid="balia-amo-status"><option value="">-- выберите --</option>{getSelectedPipelineStatuses().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Ответственный</label><select value={settings.amocrm_responsible_user_id || ''} onChange={(e) => setSettings({ ...settings, amocrm_responsible_user_id: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" data-testid="balia-amo-user"><option value="">-- не указан --</option>{amoUsers.map(u => <option key={u.id} value={u.id}>{u.name}{u.email ? ` (${u.email})` : ''}</option>)}</select></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-[#8C8C8C] mb-1">ID воронки</label><input type="number" value={settings.amocrm_pipeline_id || ''} onChange={(e) => setSettings({ ...settings, amocrm_pipeline_id: parseInt(e.target.value) || 0 })} placeholder="123456" className="w-full p-2 border border-black/10 text-sm" /></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">ID этапа</label><input type="number" value={settings.amocrm_status_id || ''} onChange={(e) => setSettings({ ...settings, amocrm_status_id: parseInt(e.target.value) || 0 })} placeholder="789012" className="w-full p-2 border border-black/10 text-sm" /></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">ID ответственного</label><input type="number" value={settings.amocrm_responsible_user_id || ''} onChange={(e) => setSettings({ ...settings, amocrm_responsible_user_id: parseInt(e.target.value) || 0 })} placeholder="ID" className="w-full p-2 border border-black/10 text-sm" /></div>
              </div>
            )}
          </div>

          {/* Field Mapping */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-3">Маппинг полей</h4>
            <div className="grid grid-cols-3 gap-3">
              {[{ key: 'amocrm_field_name', label: 'Имя клиента', entity: 'contacts' }, { key: 'amocrm_field_phone', label: 'Телефон', entity: 'contacts' }, { key: 'amocrm_field_email', label: 'Email', entity: 'contacts' }, { key: 'amocrm_field_model', label: 'Модель купели', entity: 'leads' }, { key: 'amocrm_field_price', label: 'Стоимость', entity: 'leads' }, { key: 'amocrm_field_message', label: 'Комментарий', entity: 'leads' }].map(f => {
                const fieldsList = f.entity === 'leads' ? amoLeadFields : amoContactFields;
                return (
                  <div key={f.key}>
                    <label className="block text-xs text-[#8C8C8C] mb-1">{f.label}</label>
                    {amoConnected && fieldsList.length > 0 ? (
                      <select value={settings[f.key] || ''} onChange={(e) => setSettings({ ...settings, [f.key]: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" data-testid={`balia-amo-field-${f.key}`}><option value="0">-- стандартное --</option>{fieldsList.map(cf => <option key={cf.id} value={cf.id}>{cf.name}{cf.code ? ` [${cf.code}]` : ''}</option>)}</select>
                    ) : (
                      <input type="number" value={settings[f.key] || ''} onChange={(e) => setSettings({ ...settings, [f.key]: parseInt(e.target.value) || 0 })} placeholder="ID поля" className="w-full p-2 border border-black/10 text-sm" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-3">Проверка</h4>
            <button onClick={testAmoLead} disabled={testingAmoLead} className="flex items-center gap-2 px-4 py-2 bg-[#C6A87C] text-white text-sm hover:bg-[#B09060] disabled:opacity-40 disabled:cursor-not-allowed" data-testid="balia-amo-test-lead">
              {testingAmoLead ? <Loader2 size={14} className="animate-spin" /> : null}Отправить тестовую сделку (Balia)
            </button>
            <p className="text-[10px] text-[#8C8C8C] mt-2">Будет создана сделка «WM-Balia: Balia testowa»</p>
          </div>
        </div>
      </div>
    </div>
  );
};
