import { useState } from 'react';
import { Download, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const DataMigrationAdmin = ({ fetchWithAuth, showMessage }) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wm-group-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('success', 'Экспорт завершён');
    } catch {
      showMessage('error', 'Ошибка экспорта');
    }
    setExporting(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetchWithAuth(`${API}/api/admin/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setImportResult(result);
      showMessage('success', 'Импорт завершён');
    } catch {
      showMessage('error', 'Ошибка импорта — проверьте файл');
    }
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-6" data-testid="data-migration-admin">
      <h2 className="text-lg font-bold">Экспорт / Импорт данных</h2>
      <p className="text-sm text-gray-500">
        Используйте для переноса данных между средами (preview → production).
        Экспорт сохраняет все настройки, контент купелей, продукты, цвета, галерею, блог, отзывы и медиа-записи.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <div className="border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Download size={24} className="text-[#C6A87C]" />
            <h3 className="font-semibold">Экспорт</h3>
          </div>
          <p className="text-sm text-gray-500">
            Скачать все данные из текущей среды как JSON-файл.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2.5 bg-[#C6A87C] text-white font-medium hover:bg-[#B09060] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="export-btn"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? 'Экспортируем...' : 'Скачать экспорт'}
          </button>
        </div>

        {/* Import */}
        <div className="border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Upload size={24} className="text-blue-500" />
            <h3 className="font-semibold">Импорт</h3>
          </div>
          <p className="text-sm text-gray-500">
            Загрузить JSON-файл экспорта для восстановления данных.
            Существующие записи будут обновлены, новые — добавлены.
          </p>
          <label className="block w-full py-2.5 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors text-center cursor-pointer">
            {importing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Импортируем...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload size={16} /> Загрузить JSON
              </span>
            )}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
              data-testid="import-input"
            />
          </label>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="border border-green-200 bg-green-50 p-4 space-y-2" data-testid="import-results">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle size={16} />
            Результат импорта
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {Object.entries(importResult.results || {}).map(([coll, result]) => (
              <div key={coll} className="flex justify-between">
                <span className="font-mono text-xs">{coll}</span>
                <span className="text-xs">{result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 flex items-start gap-3">
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Важно: медиа-файлы</p>
          <p>Экспорт содержит только ссылки на изображения и видео в Object Storage.
          Сами файлы хранятся в Emergent Object Storage и доступны на всех средах автоматически.</p>
        </div>
      </div>
    </div>
  );
};
