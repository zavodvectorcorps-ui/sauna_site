import { useState, useEffect } from 'react';
import { Upload, Trash2, Loader2, Image } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieGalleryAdmin = ({ authHeader, showMessage }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchImages = () => {
    fetch(`${API}/api/balia/gallery`).then(r => r.json()).then(d => { setImages(d || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${API}/api/balia/gallery/upload`, {
          method: 'POST',
          headers: { Authorization: authHeader },
          body: formData,
        });
        if (res.ok) {
          showMessage('success', `${file.name} загружено`);
        } else {
          showMessage('error', `Ошибка загрузки ${file.name}`);
        }
      } catch { showMessage('error', `Ошибка загрузки ${file.name}`); }
    }
    setUploading(false);
    fetchImages();
    e.target.value = '';
  };

  const handleDelete = async (imageId) => {
    try {
      const res = await fetch(`${API}/api/balia/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      });
      if (res.ok) {
        showMessage('success', 'Изображение удалено');
        fetchImages();
      } else { showMessage('error', 'Ошибка удаления'); }
    } catch { showMessage('error', 'Ошибка удаления'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div data-testid="balie-gallery-admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Галерея (Купели)</h2>
          <p className="text-xs text-[#8C8C8C] mt-1">{images.length} фото</p>
        </div>
        <label className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 cursor-pointer hover:bg-[#B09060]" data-testid="balie-gallery-upload">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Загрузка...' : 'Загрузить фото'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-16 bg-[#F9F9F7] border border-dashed border-black/10">
          <Image size={48} className="mx-auto text-[#D4D4D4] mb-4" />
          <p className="text-[#8C8C8C]">Галерея пуста. Загрузите фотографии.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id || img.public_id} className="group relative aspect-square bg-[#F2F2F0] overflow-hidden border border-black/5">
              <img src={img.url || img.secure_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(img.id || img.public_id)}
                  className="w-10 h-10 bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  data-testid={`balie-gallery-delete-${img.id || img.public_id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
