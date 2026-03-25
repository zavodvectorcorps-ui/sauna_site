import { useState, useEffect, useCallback } from 'react';
import { Trash2, MessageSquare } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaMessagesAdmin = ({ authHeader, showMessage }) => {
  const [contacts, setContacts] = useState([]);
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
      const res = await fetchWithAuth(`${API}/api/admin/contacts`);
      setContacts(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteContact = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это сообщение?')) return;
    try {
      await fetchWithAuth(`${API}/api/admin/contacts/${id}`, { method: 'DELETE' });
      showMessage('success', 'Сообщение удалено');
      fetchData();
    } catch { showMessage('error', 'Ошибка удаления'); }
  };

  const updateContactStatus = async (id, status) => {
    try {
      await fetchWithAuth(`${API}/api/admin/contacts/${id}/status?status=${status}`, { method: 'PUT' });
      showMessage('success', 'Статус обновлён');
      fetchData();
    } catch { showMessage('error', 'Ошибка обновления'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Сообщения ({contacts.length})</h2>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border border-black/5 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#1A1A1A]">{contact.name}</h3>
                  {contact.type === 'calculator_order' && <span className="text-[10px] px-2 py-0.5 bg-[#C6A87C]/10 text-[#C6A87C] border border-[#C6A87C]/20">Калькулятор</span>}
                  {contact.type === 'model_inquiry' && <span className="text-[10px] px-2 py-0.5 bg-[#339DC7]/10 text-[#339DC7] border border-[#339DC7]/20">Модель</span>}
                  {(!contact.type || contact.type === 'contact') && <span className="text-[10px] px-2 py-0.5 bg-black/5 text-[#595959] border border-black/10">Контакт</span>}
                </div>
                <p className="text-sm text-[#595959]">{contact.phone} • {contact.email}</p>
                {contact.model && (
                  <p className="text-sm text-[#C6A87C] mt-1">
                    {contact.model} {contact.variant && `• ${contact.variant}`}
                    {contact.total && ` • ${contact.total.toLocaleString()} PLN`}
                  </p>
                )}
                {contact.options && contact.options.length > 0 && (
                  <p className="text-xs text-[#595959] mt-1">Опции: {contact.options.join(', ')}</p>
                )}
                {contact.message && <p className="text-sm mt-2">{contact.message}</p>}
                <p className="text-xs text-[#8C8C8C] mt-2">
                  {new Date(contact.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={contact.status}
                  onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                  className="text-sm border border-black/10 p-1"
                >
                  <option value="new">Новый</option>
                  <option value="in_progress">В работе</option>
                  <option value="completed">Завершён</option>
                </select>
                <button onClick={() => deleteContact(contact.id)} className="p-1 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="text-center text-[#8C8C8C] py-12">Нет сообщений</p>
        )}
      </div>
    </div>
  );
};
