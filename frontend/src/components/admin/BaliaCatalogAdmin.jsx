import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, FileDown, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaCatalogAdmin = ({ authHeader, showMessage }) => {
  const [catalogInfo, setCatalogInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    fetch(`${API}/api/balia-catalog/info`)
      .then(r => r.json())
      .then(d => setCatalogInfo(d))
      .catch(() => setCatalogInfo({ available: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/balia-catalog/upload`, { method: 'POST', body: formData });
      if (res.ok) {
        showMessage('success', 'Каталог купелей загружен');
        const infoRes = await fetch(`${API}/api/balia-catalog/info`);
        setCatalogInfo(await infoRes.json());
      } else {
        const err = await res.json();
        showMessage('error', err.detail || 'Ошибка загрузки');
      }
    } catch { showMessage('error', 'Ошибка загрузки каталога'); }
    setUploading(false);
  };

  const handleDelete = async () => {
    try {
      const res = await fetchWithAuth(`${API}/api/admin/balia-catalog`, { method: 'DELETE' });
      if (res.ok) { showMessage('success', 'Каталог купелей удалён'); setCatalogInfo({ available: false }); }
    } catch { showMessage('error', 'Ошибка удаления'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Каталог купелей (PDF)</h2>
      <p className="text-sm text-[#595959] mb-6">Загрузите PDF-каталог купелей. Кнопка "Pobierz katalog" автоматически появится в блоке Hero на странице купелей.</p>

      <div className="border border-black/5 p-6">
        {catalogInfo?.available ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileDown size={24} className="text-[#D4AF37]" />
                <div>
                  <p className="font-medium text-[#1A1A1A]">{catalogInfo.filename || 'balia-catalog.pdf'}</p>
                  <p className="text-xs text-[#8C8C8C]">{catalogInfo.size ? `${(catalogInfo.size / 1024 / 1024).toFixed(1)} МБ` : ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`${API}/api/balia-catalog/download`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm border border-[#339DC7] text-[#339DC7] hover:bg-[#339DC7]/5" data-testid="balia-catalog-preview">Просмотр</a>
                <button onClick={handleDelete} className="px-4 py-2 text-sm border border-red-300 text-red-500 hover:bg-red-50" data-testid="balia-catalog-delete"><Trash2 size={14} /></button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8C8C8C] mb-2">Заменить каталог</label>
              <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="text-sm" data-testid="balia-catalog-replace" />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <FileDown size={40} className="mx-auto text-[#8C8C8C] mb-3" />
            <p className="text-sm text-[#595959] mb-4">Каталог не загружен. Загрузите PDF-файл.</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A87C] text-white cursor-pointer hover:bg-[#B09060]">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Загрузка...' : 'Загрузить PDF-каталог'}
              <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="hidden" data-testid="balia-catalog-upload" />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
