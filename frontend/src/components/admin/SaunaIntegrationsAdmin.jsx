import { useState, useEffect, useCallback } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaIntegrationsAdmin = ({ authHeader, showMessage }) => {
  const [integrationSettings, setIntegrationSettings] = useState(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingAmo, setTestingAmo] = useState(false);
  const [testingAmoLead, setTestingAmoLead] = useState(false);
  const [amoPipelines, setAmoPipelines] = useState([]);
  const [amoUsers, setAmoUsers] = useState([]);
  const [amoLeadFields, setAmoLeadFields] = useState([]);
  const [amoContactFields, setAmoContactFields] = useState([]);
  const [amoConnected, setAmoConnected] = useState(false);
  const [amoLoading, setAmoLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const loadAmoData = useCallback(async () => {
    setAmoLoading(true);
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
    setAmoLoading(false);
  }, [fetchWithAuth, showMessage]);

  const checkAmoStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/amocrm/status`, { headers: { 'Authorization': authHeader } });
      if (res.ok) { const d = await res.json(); setAmoConnected(d.connected); if (d.connected) loadAmoData(); }
    } catch {}
  }, [authHeader, loadAmoData]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(`${API}/api/admin/settings/integrations`);
        const data = await res.json();
        setIntegrationSettings(data);
        if (data.amocrm_access_token) setTimeout(checkAmoStatus, 100);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [fetchWithAuth, checkAmoStatus]);

  const saveIntegrationSettings = async () => {
    try { await fetchWithAuth(`${API}/api/admin/settings/integrations`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(integrationSettings) }); showMessage('success', 'Настройки интеграций сохранены'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const testTelegram = async () => { setTestingTelegram(true); try { const res = await fetchWithAuth(`${API}/api/admin/test-telegram`, { method: 'POST' }); const d = await res.json(); showMessage('success', d.message || 'Тест отправлен'); } catch (e) { showMessage('error', e.message || 'Ошибка теста Telegram'); } setTestingTelegram(false); };
  const testAmocrm = async () => { setTestingAmo(true); try { const res = await fetchWithAuth(`${API}/api/admin/test-amocrm`, { method: 'POST' }); const d = await res.json(); showMessage('success', d.message || 'Подключение успешно'); } catch (e) { showMessage('error', e.message || 'Ошибка подключения AMO CRM'); } setTestingAmo(false); };
  const testAmoLead = async () => { setTestingAmoLead(true); try { const res = await fetchWithAuth(`${API}/api/admin/test-amocrm-lead`, { method: 'POST' }); const d = await res.json(); showMessage('success', d.message || 'Тестовая сделка отправлена'); } catch (e) { showMessage('error', e.message || 'Ошибка отправки тестовой сделки'); } setTestingAmoLead(false); };

  const getSelectedPipelineStatuses = () => {
    const pipeline = amoPipelines.find(p => p.id === integrationSettings?.amocrm_pipeline_id);
    return pipeline?.statuses || [];
  };

  if (loading || !integrationSettings) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Интеграции</h2>
        <button onClick={saveIntegrationSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]"><Save size={16} /> Сохранить</button>
      </div>
      <p className="text-sm text-[#8C8C8C] mb-6">Настройте уведомления о заявках.</p>

      {/* Telegram */}
      <div className="border border-black/5 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#229ED9] flex items-center justify-center text-white font-bold text-lg">T</div>
            <div><h3 className="font-semibold">Telegram</h3><p className="text-xs text-[#8C8C8C]">Уведомления о заявках в Telegram</p></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={integrationSettings.telegram_enabled} onChange={(e) => setIntegrationSettings({ ...integrationSettings, telegram_enabled: e.target.checked })} className="w-5 h-5 accent-[#C6A87C]" />
            <span className="text-sm">{integrationSettings.telegram_enabled ? 'Включено' : 'Выключено'}</span>
          </label>
        </div>
        <div className="space-y-3">
          <div><label className="block text-xs text-[#8C8C8C] mb-1">Токен бота</label><input type="text" value={integrationSettings.telegram_bot_token} onChange={(e) => setIntegrationSettings({ ...integrationSettings, telegram_bot_token: e.target.value })} placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" className="w-full p-2 border border-black/10 text-sm font-mono" /><p className="text-[10px] text-[#8C8C8C] mt-1">Получите через @BotFather</p></div>
          <div><label className="block text-xs text-[#8C8C8C] mb-1">Chat ID</label><input type="text" value={integrationSettings.telegram_chat_id} onChange={(e) => setIntegrationSettings({ ...integrationSettings, telegram_chat_id: e.target.value })} placeholder="-1001234567890" className="w-full p-2 border border-black/10 text-sm font-mono" /><p className="text-[10px] text-[#8C8C8C] mt-1">Узнайте через @userinfobot</p></div>
          <button onClick={testTelegram} disabled={testingTelegram || !integrationSettings.telegram_bot_token || !integrationSettings.telegram_chat_id} className="flex items-center gap-2 px-4 py-2 bg-[#229ED9] text-white text-sm hover:bg-[#1a8ec5] disabled:opacity-40 disabled:cursor-not-allowed">{testingTelegram ? <Loader2 size={14} className="animate-spin" /> : null}Отправить тестовое сообщение</button>
        </div>
      </div>

      {/* AMO CRM */}
      <div className="border border-black/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#339DC7] flex items-center justify-center text-white font-bold text-sm">AMO</div>
            <div><h3 className="font-semibold">AMO CRM</h3><p className="text-xs text-[#8C8C8C]">Создание сделок при новых заявках</p></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={integrationSettings.amocrm_enabled} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_enabled: e.target.checked })} className="w-5 h-5 accent-[#C6A87C]" />
            <span className="text-sm">{integrationSettings.amocrm_enabled ? 'Включено' : 'Выключено'}</span>
          </label>
        </div>
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-3">Шаг 1: Подключение</h4>
            <p className="text-[10px] text-[#8C8C8C] mb-3">Укажите домен AMO CRM и долгосрочный API-ключ.</p>
            <div className="space-y-3">
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Домен AMO CRM</label><input type="text" value={integrationSettings.amocrm_domain || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_domain: e.target.value })} placeholder="mycompany.amocrm.ru" className="w-full p-2 border border-black/10 text-sm" data-testid="amo-domain-input" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">API-ключ</label><input type="password" value={integrationSettings.amocrm_access_token || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_access_token: e.target.value })} placeholder="Долгосрочный токен" className="w-full p-2 border border-black/10 text-sm font-mono" data-testid="amo-token-input" /></div>
            </div>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <button onClick={async () => { await saveIntegrationSettings(); checkAmoStatus(); }} disabled={!integrationSettings.amocrm_domain || !integrationSettings.amocrm_access_token} className="px-4 py-2 bg-[#339DC7] text-white text-sm hover:bg-[#2a8bb3] disabled:opacity-40 disabled:cursor-not-allowed" data-testid="amo-save-connect-btn">Сохранить и подключить</button>
              <button onClick={testAmocrm} disabled={testingAmo || !integrationSettings.amocrm_access_token} className="flex items-center gap-2 px-4 py-2 border border-[#339DC7] text-[#339DC7] text-sm hover:bg-[#339DC7]/5 disabled:opacity-40 disabled:cursor-not-allowed" data-testid="amo-test-btn">{testingAmo ? <Loader2 size={14} className="animate-spin" /> : null}Проверить подключение</button>
              {amoConnected && <span className="text-xs text-green-600 flex items-center gap-1" data-testid="amo-connected-badge"><Check size={14} /> Подключено</span>}
            </div>
          </div>
          {/* Step 2 */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-3">Шаг 2: Воронка и этап</h4>
            {amoConnected && amoPipelines.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Воронка</label><select value={integrationSettings.amocrm_pipeline_id || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_pipeline_id: parseInt(e.target.value) || 0, amocrm_status_id: 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" data-testid="amo-pipeline-select"><option value="">-- выберите --</option>{amoPipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Этап</label><select value={integrationSettings.amocrm_status_id || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_status_id: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" disabled={!integrationSettings.amocrm_pipeline_id} data-testid="amo-status-select"><option value="">-- выберите --</option>{getSelectedPipelineStatuses().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-xs text-[#8C8C8C] mb-1">Ответственный</label><select value={integrationSettings.amocrm_responsible_user_id || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_responsible_user_id: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" data-testid="amo-user-select"><option value="">-- не указан --</option>{amoUsers.map(u => <option key={u.id} value={u.id}>{u.name}{u.email ? ` (${u.email})` : ''}</option>)}</select></div>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-[#8C8C8C] mb-3">{amoConnected ? 'Загрузка воронок...' : 'Подключите AMO CRM или укажите ID вручную.'}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-[#8C8C8C] mb-1">ID воронки</label><input type="number" value={integrationSettings.amocrm_pipeline_id || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_pipeline_id: parseInt(e.target.value) || 0 })} placeholder="123456" className="w-full p-2 border border-black/10 text-sm" /></div>
                  <div><label className="block text-xs text-[#8C8C8C] mb-1">ID этапа</label><input type="number" value={integrationSettings.amocrm_status_id || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_status_id: parseInt(e.target.value) || 0 })} placeholder="789012" className="w-full p-2 border border-black/10 text-sm" /></div>
                  <div><label className="block text-xs text-[#8C8C8C] mb-1">ID ответственного</label><input type="number" value={integrationSettings.amocrm_responsible_user_id || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, amocrm_responsible_user_id: parseInt(e.target.value) || 0 })} placeholder="ID" className="w-full p-2 border border-black/10 text-sm" /></div>
                </div>
              </>
            )}
          </div>
          {/* Step 3 */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-3">Шаг 3: Маппинг полей</h4>
            <p className="text-[10px] text-[#8C8C8C] mb-3">{amoConnected ? 'Выберите поля AMO CRM.' : 'Подключите AMO CRM или укажите ID вручную.'}</p>
            <div className="grid grid-cols-3 gap-3">
              {[{ key: 'amocrm_field_name', label: 'Имя клиента', entity: 'contacts' }, { key: 'amocrm_field_phone', label: 'Телефон', entity: 'contacts' }, { key: 'amocrm_field_email', label: 'Email', entity: 'contacts' }, { key: 'amocrm_field_model', label: 'Модель сауны', entity: 'leads' }, { key: 'amocrm_field_price', label: 'Стоимость', entity: 'leads' }, { key: 'amocrm_field_message', label: 'Комментарий', entity: 'leads' }].map(f => {
                const fieldsList = f.entity === 'leads' ? amoLeadFields : amoContactFields;
                return (
                  <div key={f.key}>
                    <label className="block text-xs text-[#8C8C8C] mb-1">{f.label}</label>
                    {amoConnected && fieldsList.length > 0 ? (
                      <select value={integrationSettings[f.key] || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, [f.key]: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10 text-sm bg-white" data-testid={`amo-field-${f.key}`}><option value="0">-- стандартное --</option>{fieldsList.map(cf => <option key={cf.id} value={cf.id}>{cf.name}{cf.code ? ` [${cf.code}]` : ''}</option>)}</select>
                    ) : (
                      <input type="number" value={integrationSettings[f.key] || ''} onChange={(e) => setIntegrationSettings({ ...integrationSettings, [f.key]: parseInt(e.target.value) || 0 })} placeholder="ID поля" className="w-full p-2 border border-black/10 text-sm" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Step 4 */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-3">Шаг 4: Проверка</h4>
            <p className="text-[10px] text-[#8C8C8C] mb-3">Отправьте тестовую сделку в AMO CRM.</p>
            <button onClick={testAmoLead} disabled={testingAmoLead || !integrationSettings.amocrm_access_token} className="flex items-center gap-2 px-4 py-2 bg-[#C6A87C] text-white text-sm hover:bg-[#B09060] disabled:opacity-40 disabled:cursor-not-allowed" data-testid="amo-test-lead-btn">{testingAmoLead ? <Loader2 size={14} className="animate-spin" /> : null}Отправить тестовую сделку</button>
            <p className="text-[10px] text-[#8C8C8C] mt-2">Будет создана сделка «WM-Sauna [ТЕСТ]: Sauna testowa»</p>
          </div>
          {/* Pipeline link */}
          <div className="p-4 bg-[#F9F9F7] border border-black/5">
            <h4 className="text-sm font-semibold mb-2">Просмотр воронок</h4>
            <p className="text-[10px] text-[#8C8C8C] mb-3">Откройте копию воронки AMO CRM.</p>
            <a href="/admin/pipeline" className="inline-flex items-center gap-2 px-4 py-2 border border-black/10 text-[#595959] text-sm hover:bg-black/5" data-testid="pipeline-view-link">Открыть воронку</a>
          </div>
        </div>
      </div>
    </div>
  );
};
