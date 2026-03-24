import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Search, Loader2, User, DollarSign, Calendar, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts * 1000);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const LeadCard = ({ lead }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-black/5 p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[#1A1A1A] truncate">{lead.name || 'Без названия'}</h4>
          {lead.contacts?.length > 0 && (
            <p className="text-xs text-[#595959] mt-0.5 flex items-center gap-1">
              <User size={10} />
              {lead.contacts.map(c => c.name).filter(Boolean).join(', ') || `ID: ${lead.contacts[0]?.id}`}
            </p>
          )}
        </div>
        {lead.price > 0 && (
          <span className="text-xs font-bold text-[#C6A87C] whitespace-nowrap flex items-center gap-0.5">
            <DollarSign size={10} />
            {lead.price.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#8C8C8C]">
        <span className="flex items-center gap-0.5"><Calendar size={9} />{formatDate(lead.created_at)}</span>
        <span>ID: {lead.id}</span>
      </div>
      {lead.custom_fields?.length > 0 && (
        <>
          <button onClick={() => setExpanded(!expanded)} className="mt-1.5 text-[10px] text-[#339DC7] hover:underline flex items-center gap-0.5">
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {expanded ? 'Скрыть поля' : `Поля (${lead.custom_fields.length})`}
          </button>
          {expanded && (
            <div className="mt-1.5 space-y-0.5">
              {lead.custom_fields.map((f, i) => (
                <div key={i} className="text-[10px]">
                  <span className="text-[#8C8C8C]">{f.name}: </span>
                  <span className="text-[#1A1A1A]">{f.values?.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function PipelineView() {
  const navigate = useNavigate();
  const [pipelineId, setPipelineId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authHeader, setAuthHeader] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check localStorage for existing session
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      setAuthHeader(savedAuth);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const auth = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Authorization': auth },
      });
      if (res.ok) {
        setAuthHeader(auth);
        localStorage.setItem('adminAuth', auth);
        setIsLoggedIn(true);
      } else {
        setLoginError('Неверные данные для входа');
      }
    } catch {
      setLoginError('Ошибка подключения к серверу');
    }
    setLoginLoading(false);
  };

  const loadPipeline = useCallback(async () => {
    if (!pipelineId) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/amocrm/pipeline/${pipelineId}/full`, {
        headers: { 'Authorization': authHeader },
      });
      if (res.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('adminAuth');
        setError('Сессия истекла. Войдите заново.');
      } else if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || `Ошибка ${res.status}`);
      } else {
        setData(await res.json());
      }
    } catch {
      setError('Ошибка подключения к серверу');
    }
    setLoading(false);
  }, [pipelineId, authHeader]);

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-black/5 p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Lock size={20} className="text-[#C6A87C]" />
              <h1 className="text-lg font-bold text-[#1A1A1A]">Воронка AMO CRM</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#595959] mb-1">Логин</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-2.5 border border-black/10 text-sm focus:outline-none focus:border-[#C6A87C]"
                  data-testid="pipeline-login-username"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#595959] mb-1">Пароль</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-2.5 border border-black/10 text-sm focus:outline-none focus:border-[#C6A87C]"
                  data-testid="pipeline-login-password"
                />
              </div>
              {loginError && (
                <p className="text-xs text-red-600" data-testid="pipeline-login-error">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loginLoading || !credentials.username || !credentials.password}
                className="w-full py-2.5 bg-[#1A1A1A] text-white text-sm font-medium hover:bg-black disabled:opacity-40 transition-colors"
                data-testid="pipeline-login-submit"
              >
                {loginLoading ? 'Вход...' : 'Войти'}
              </button>
            </form>
            <button
              onClick={() => navigate('/admin')}
              className="w-full mt-3 py-2 text-xs text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors"
            >
              Перейти в админ-панель
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Header */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors" data-testid="back-to-admin">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Воронка AMO CRM</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value)}
              placeholder="ID воронки"
              className="w-40 p-2 border border-black/10 text-sm"
              data-testid="pipeline-id-input"
              onKeyDown={(e) => e.key === 'Enter' && loadPipeline()}
            />
            <button
              onClick={loadPipeline}
              disabled={loading || !pipelineId}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              data-testid="load-pipeline-btn"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Загрузить
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4" data-testid="pipeline-error">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-[#C6A87C] mx-auto mb-3" />
              <p className="text-sm text-[#595959]">Загрузка сделок из AMO CRM...</p>
              <p className="text-xs text-[#8C8C8C] mt-1">Это может занять некоторое время</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Pipeline info */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]" data-testid="pipeline-name">{data.pipeline_name}</h2>
                <p className="text-sm text-[#8C8C8C]">ID: {data.pipeline_id} &bull; {data.total_leads} сделок &bull; {data.statuses.length} этапов</p>
              </div>
            </div>

            {/* Kanban board */}
            <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
              {data.statuses.map((status) => {
                const leads = data.leads_by_status[String(status.id)] || [];
                const totalPrice = leads.reduce((s, l) => s + (l.price || 0), 0);
                return (
                  <div key={status.id} className="flex-shrink-0 w-[300px]" data-testid={`status-column-${status.id}`}>
                    {/* Column header */}
                    <div className="bg-white border border-black/5 p-3 mb-2 sticky top-[57px] z-[5]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: status.color ? `#${status.color}` : '#8C8C8C' }} />
                        <h3 className="text-sm font-semibold text-[#1A1A1A] truncate flex-1">{status.name}</h3>
                        <span className="text-xs bg-black/5 text-[#595959] px-1.5 py-0.5 font-medium">{leads.length}</span>
                      </div>
                      {totalPrice > 0 && (
                        <p className="text-xs text-[#C6A87C] font-medium mt-1">{totalPrice.toLocaleString()} PLN</p>
                      )}
                    </div>
                    {/* Cards */}
                    <div className="space-y-2">
                      {leads.length === 0 && (
                        <p className="text-xs text-[#8C8C8C] text-center py-4">Нет сделок</p>
                      )}
                      {leads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-[#E5E5E5] mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">Введите ID воронки</h3>
            <p className="text-sm text-[#595959] max-w-md mx-auto">
              Укажите ID воронки из AMO CRM и нажмите «Загрузить». Все сделки будут загружены и отображены по этапам.
            </p>
            <p className="text-xs text-[#8C8C8C] mt-3">
              ID воронки можно найти: AMO CRM &rarr; Сделки &rarr; в URL после /leads/pipeline/
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
