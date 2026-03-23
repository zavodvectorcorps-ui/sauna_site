import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, Users, Image, MessageSquare, LayoutGrid, Save, LogOut, 
  Trash2, Plus, Eye, EyeOff, GripVertical, Upload, Check, X,
  Phone, Mail, MapPin, Clock, FileText, Star, ChevronDown, ChevronUp
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authHeader, setAuthHeader] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Data states
  const [contacts, setContacts] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [heroSettings, setHeroSettings] = useState(null);
  const [aboutSettings, setAboutSettings] = useState(null);
  const [calculatorConfig, setCalculatorConfig] = useState(null);
  const [sectionOrder, setSectionOrder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [galleryConfig, setGalleryConfig] = useState(null);
  const [apiImages, setApiImages] = useState([]);
  // Section content settings
  const [gallerySettings, setGallerySettings] = useState(null);
  const [calculatorSettings, setCalculatorSettings] = useState(null);
  const [stockSettings, setStockSettings] = useState(null);
  const [reviewsSettings, setReviewsSettings] = useState(null);
  const [contactSettings, setContactSettings] = useState(null);
  const [footerSettings, setFooterSettings] = useState(null);
  // Stock saunas and layout
  const [stockSaunas, setStockSaunas] = useState([]);
  const [layoutSettings, setLayoutSettings] = useState(null);
  const [buttonConfig, setButtonConfig] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': authHeader,
      },
    });
    if (response.status === 401) {
      setIsLoggedIn(false);
      throw new Error('Unauthorized');
    }
    return response;
  }, [authHeader]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const auth = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);
    
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Authorization': auth },
      });
      
      if (response.ok) {
        setAuthHeader(auth);
        setIsLoggedIn(true);
        showMessage('success', 'Вход выполнен успешно');
      } else {
        showMessage('error', 'Неверные данные для входа');
      }
    } catch (error) {
      showMessage('error', 'Ошибка подключения');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthHeader('');
    setCredentials({ username: '', password: '' });
  };

  // Fetch all data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        contactsRes, siteRes, heroRes, aboutRes, calcRes, sectionsRes, reviewsRes, galleryRes, apiRes, galleryConfigRes,
        gallerySettingsRes, calculatorSettingsRes, stockSettingsRes, reviewsSettingsRes, contactSettingsRes, footerSettingsRes,
        stockSaunasRes, layoutRes, buttonsRes
      ] = await Promise.all([
        fetchWithAuth(`${API_URL}/api/admin/contacts`),
        fetch(`${API_URL}/api/settings/site`),
        fetch(`${API_URL}/api/settings/hero`),
        fetch(`${API_URL}/api/settings/about`),
        fetch(`${API_URL}/api/settings/calculator`),
        fetch(`${API_URL}/api/settings/sections`),
        fetchWithAuth(`${API_URL}/api/admin/reviews`),
        fetchWithAuth(`${API_URL}/api/admin/gallery`),
        fetch(`${API_URL}/api/sauna/prices`),
        fetch(`${API_URL}/api/settings/gallery`),
        fetch(`${API_URL}/api/settings/gallery-content`),
        fetch(`${API_URL}/api/settings/calculator-content`),
        fetch(`${API_URL}/api/settings/stock`),
        fetch(`${API_URL}/api/settings/reviews-content`),
        fetch(`${API_URL}/api/settings/contact`),
        fetch(`${API_URL}/api/settings/footer`),
        fetchWithAuth(`${API_URL}/api/admin/stock-saunas`),
        fetch(`${API_URL}/api/settings/layout`),
        fetch(`${API_URL}/api/settings/buttons`),
      ]);

      setContacts(await contactsRes.json());
      setSiteSettings(await siteRes.json());
      setHeroSettings(await heroRes.json());
      setAboutSettings(await aboutRes.json());
      setCalculatorConfig(await calcRes.json());
      setSectionOrder(await sectionsRes.json());
      setReviews(await reviewsRes.json());
      setGallery(await galleryRes.json());
      
      const apiDataJson = await apiRes.json();
      setApiData(apiDataJson);
      
      // Extract all images from API
      const extractedImages = [];
      const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
      
      apiDataJson.models?.forEach((model) => {
        if (model.imageUrl) {
          const imageUrl = model.imageUrl.startsWith('http') ? model.imageUrl : `${CALCULATOR_API_URL}${model.imageUrl}`;
          extractedImages.push({ url: imageUrl, name: model.name, type: 'model' });
        }
        model.galleryImages?.forEach((img) => {
          const imgUrl = img.startsWith('http') ? img : `${CALCULATOR_API_URL}${img}`;
          extractedImages.push({ url: imgUrl, name: `${model.name} (галерея)`, type: 'gallery' });
        });
      });
      
      apiDataJson.categories?.forEach((category) => {
        category.options?.forEach((option) => {
          if (option.imageUrl) {
            const imgUrl = option.imageUrl.startsWith('http') ? option.imageUrl : `${CALCULATOR_API_URL}${option.imageUrl}`;
            extractedImages.push({ url: imgUrl, name: option.namePl || option.name, type: 'option' });
          }
        });
      });
      
      setApiImages(extractedImages);
      setGalleryConfig(await galleryConfigRes.json());
      setGallerySettings(await gallerySettingsRes.json());
      setCalculatorSettings(await calculatorSettingsRes.json());
      setStockSettings(await stockSettingsRes.json());
      setReviewsSettings(await reviewsSettingsRes.json());
      setContactSettings(await contactSettingsRes.json());
      setFooterSettings(await footerSettingsRes.json());
      setStockSaunas(await stockSaunasRes.json());
      setLayoutSettings(await layoutRes.json());
      setButtonConfig(await buttonsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Save functions
  const saveSiteSettings = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/site`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      showMessage('success', 'Настройки сохранены');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const saveHeroSettings = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/hero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroSettings),
      });
      showMessage('success', 'Настройки Hero сохранены');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const saveAboutSettings = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutSettings),
      });
      showMessage('success', 'Настройки "О компании" сохранены');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const saveCalculatorConfig = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/calculator`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatorConfig),
      });
      showMessage('success', 'Конфигурация калькулятора сохранена');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const saveSectionOrder = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionOrder),
      });
      showMessage('success', 'Порядок секций сохранён');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const saveGalleryConfig = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryConfig),
      });
      showMessage('success', 'Настройки галереи сохранены');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  // Section content save functions
  const saveSectionContent = async (endpoint, data, name) => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      showMessage('success', `${name} сохранены`);
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const toggleApiImage = (imageUrl) => {
    const hidden = galleryConfig.hidden_api_images || [];
    if (hidden.includes(imageUrl)) {
      setGalleryConfig({
        ...galleryConfig,
        hidden_api_images: hidden.filter(url => url !== imageUrl),
      });
    } else {
      setGalleryConfig({
        ...galleryConfig,
        hidden_api_images: [...hidden, imageUrl],
      });
    }
  };

  // Stock Saunas CRUD
  const addStockSauna = async () => {
    const newSauna = {
      id: `sauna_${Date.now()}`,
      name: 'Новая сауна',
      image: '',
      price: 0,
      discount: 0,
      capacity: '2-4',
      steam_room_size: '',
      relax_room_size: '',
      features: [],
      active: true,
      sort_order: stockSaunas.length,
    };
    try {
      await fetchWithAuth(`${API_URL}/api/admin/stock-saunas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSauna),
      });
      showMessage('success', 'Сауна добавлена');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка добавления');
    }
  };

  const saveStockSauna = async (sauna) => {
    try {
      await fetchWithAuth(`${API_URL}/api/admin/stock-saunas/${sauna.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sauna),
      });
      showMessage('success', 'Сауна сохранена');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
  };

  const deleteStockSauna = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту сауну?')) return;
    try {
      await fetchWithAuth(`${API_URL}/api/admin/stock-saunas/${id}`, { method: 'DELETE' });
      showMessage('success', 'Сауна удалена');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка удаления');
    }
  };

  // Layout settings
  const saveLayoutSettings = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layoutSettings),
      });
      showMessage('success', 'Настройки отступов сохранены');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  // Button config
  const saveButtonConfig = async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/settings/buttons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buttonConfig),
      });
      showMessage('success', 'Настройки кнопок сохранены');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const updateButton = (buttonId, field, value) => {
    setButtonConfig({
      ...buttonConfig,
      buttons: {
        ...buttonConfig.buttons,
        [buttonId]: {
          ...buttonConfig.buttons[buttonId],
          [field]: value,
        },
      },
    });
  };

  const saveReview = async (review) => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      showMessage('success', 'Отзыв сохранён');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
    setLoading(false);
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
    try {
      await fetchWithAuth(`${API_URL}/api/admin/reviews/${id}`, { method: 'DELETE' });
      showMessage('success', 'Отзыв удалён');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка удаления');
    }
  };

  const addNewReview = async () => {
    const newReview = {
      id: `review_${Date.now()}`,
      name: 'Новый клиент',
      location: 'Варшава',
      rating: 5,
      text_pl: 'Treść opinii...',
      text_en: 'Review text...',
      text_ru: 'Текст отзыва...',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      sauna: 'Sauna',
      active: true,
    };
    try {
      await fetchWithAuth(`${API_URL}/api/admin/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
      showMessage('success', 'Отзыв добавлен');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка добавления');
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это сообщение?')) return;
    try {
      await fetchWithAuth(`${API_URL}/api/admin/contacts/${id}`, { method: 'DELETE' });
      showMessage('success', 'Сообщение удалено');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка удаления');
    }
  };

  const updateContactStatus = async (id, status) => {
    try {
      await fetchWithAuth(`${API_URL}/api/admin/contacts/${id}/status?status=${status}`, { method: 'PUT' });
      showMessage('success', 'Статус обновлён');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка обновления');
    }
  };

  const addGalleryImage = async () => {
    const newImage = {
      id: `img_${Date.now()}`,
      url: '',
      alt: 'Новое фото',
      category: 'all',
      source: 'custom',
      active: true,
      sort_order: gallery.length,
    };
    try {
      await fetchWithAuth(`${API_URL}/api/admin/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImage),
      });
      showMessage('success', 'Фото добавлено');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка добавления');
    }
  };

  const saveGalleryImage = async (image) => {
    try {
      await fetchWithAuth(`${API_URL}/api/admin/gallery/${image.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(image),
      });
      showMessage('success', 'Фото сохранено');
    } catch (error) {
      showMessage('error', 'Ошибка сохранения');
    }
  };

  const deleteGalleryImage = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это фото?')) return;
    try {
      await fetchWithAuth(`${API_URL}/api/admin/gallery/${id}`, { method: 'DELETE' });
      showMessage('success', 'Фото удалено');
      fetchAllData();
    } catch (error) {
      showMessage('error', 'Ошибка удаления');
    }
  };

  const handleImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/admin/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      callback(`${API_URL}${data.url}`);
      showMessage('success', 'Фото загружено');
    } catch (error) {
      showMessage('error', 'Ошибка загрузки');
    }
  };

  const moveSection = (index, direction) => {
    const newSections = [...sectionOrder.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSectionOrder({ ...sectionOrder, sections: newSections });
  };

  const toggleModel = (modelId) => {
    const enabled = calculatorConfig.enabled_models || [];
    if (enabled.includes(modelId)) {
      setCalculatorConfig({
        ...calculatorConfig,
        enabled_models: enabled.filter(id => id !== modelId),
      });
    } else {
      setCalculatorConfig({
        ...calculatorConfig,
        enabled_models: [...enabled, modelId],
      });
    }
  };

  const toggleCategory = (categoryId) => {
    const enabled = calculatorConfig.enabled_categories || [];
    if (enabled.includes(categoryId)) {
      setCalculatorConfig({
        ...calculatorConfig,
        enabled_categories: enabled.filter(id => id !== categoryId),
      });
    } else {
      setCalculatorConfig({
        ...calculatorConfig,
        enabled_categories: [...enabled, categoryId],
      });
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 w-full max-w-md border border-black/5">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Панель администратора</h1>
          <p className="text-[#595959] mb-6">WM-Sauna</p>
          
          {message.text && (
            <div className={`p-3 mb-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Логин</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Пароль</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C6A87C] text-white p-3 font-medium hover:bg-[#B09060] transition-colors disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'contacts', label: 'Сообщения', icon: MessageSquare },
    { id: 'layout', label: 'Оформление', icon: LayoutGrid },
    { id: 'content', label: 'Тексты', icon: FileText },
    { id: 'hero', label: 'Hero', icon: Image },
    { id: 'about', label: 'О компании', icon: FileText },
    { id: 'gallery', label: 'Галерея', icon: Image },
    { id: 'stock_saunas', label: 'В наличии', icon: Users },
    { id: 'calculator', label: 'Калькулятор', icon: LayoutGrid },
    { id: 'reviews', label: 'Отзывы', icon: Star },
    { id: 'site', label: 'Контакты', icon: Phone },
    { id: 'sections', label: 'Порядок', icon: GripVertical },
  ];

  const sectionNames = {
    hero: 'Hero (Главный экран)',
    calculator: 'Калькулятор',
    gallery: 'Галерея',
    stock: 'Сауны в наличии',
    reviews: 'Отзывы',
    about: 'О компании',
    contact: 'Контакты',
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Header */}
      <header className="bg-[#1A1A1A] text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">WM-Sauna Админ</h1>
            <a href="/" target="_blank" className="text-sm text-[#C6A87C] hover:underline">
              Открыть сайт →
            </a>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-[#C6A87C]">
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </header>

      {/* Message */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white shadow-lg`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* Sidebar */}
        <nav className="w-56 flex-shrink-0">
          <div className="bg-white border border-black/5 p-2 sticky top-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#C6A87C] text-white'
                    : 'text-[#595959] hover:bg-[#F9F9F7]'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 bg-white border border-black/5 p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && !loading && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Сообщения ({contacts.length})</h2>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border border-black/5 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#1A1A1A]">{contact.name}</h3>
                        <p className="text-sm text-[#595959]">{contact.phone} • {contact.email}</p>
                        {contact.model && (
                          <p className="text-sm text-[#C6A87C] mt-1">
                            {contact.model} {contact.variant && `• ${contact.variant}`}
                            {contact.total && ` • ${contact.total.toLocaleString()} PLN`}
                          </p>
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
          )}

          {/* Site Settings Tab */}
          {activeTab === 'site' && !loading && siteSettings && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки сайта</h2>
                <button onClick={saveSiteSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Save size={16} /> Сохранить
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Название компании</label>
                  <input
                    type="text"
                    value={siteSettings.company_name}
                    onChange={(e) => setSiteSettings({ ...siteSettings, company_name: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Телефон</label>
                  <input
                    type="text"
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Адрес</label>
                  <input
                    type="text"
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NIP</label>
                  <input
                    type="text"
                    value={siteSettings.nip}
                    onChange={(e) => setSiteSettings({ ...siteSettings, nip: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">REGON</label>
                  <input
                    type="text"
                    value={siteSettings.regon}
                    onChange={(e) => setSiteSettings({ ...siteSettings, regon: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Часы работы</label>
                  <input
                    type="text"
                    value={siteSettings.working_hours}
                    onChange={(e) => setSiteSettings({ ...siteSettings, working_hours: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={siteSettings.facebook_url}
                    onChange={(e) => setSiteSettings({ ...siteSettings, facebook_url: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={siteSettings.instagram_url}
                    onChange={(e) => setSiteSettings({ ...siteSettings, instagram_url: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={siteSettings.youtube_url}
                    onChange={(e) => setSiteSettings({ ...siteSettings, youtube_url: e.target.value })}
                    className="w-full p-2 border border-black/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Layout Tab - Section Spacing */}
          {activeTab === 'layout' && !loading && layoutSettings && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Оформление</h2>
                <button onClick={saveLayoutSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Save size={16} /> Сохранить
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="border border-black/5 p-6">
                  <h3 className="font-semibold mb-4">Расстояние между блоками</h3>
                  <p className="text-sm text-[#8C8C8C] mb-4">Выберите размер отступов между секциями сайта</p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'small', label: 'Маленькое', desc: '40px' },
                        { value: 'medium', label: 'Среднее', desc: '60px' },
                        { value: 'large', label: 'Большое', desc: '80px' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex flex-col items-center p-4 border cursor-pointer transition-all ${
                            layoutSettings.section_spacing === option.value
                              ? 'border-[#C6A87C] bg-[#C6A87C]/10'
                              : 'border-black/10 hover:border-[#C6A87C]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="section_spacing"
                            value={option.value}
                            checked={layoutSettings.section_spacing === option.value}
                            onChange={(e) => setLayoutSettings({ ...layoutSettings, section_spacing: e.target.value })}
                            className="sr-only"
                          />
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-[#8C8C8C]">{option.desc}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Точная настройка (в пикселях)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#8C8C8C] mb-1">Отступ сверху</label>
                          <input
                            type="number"
                            value={layoutSettings.section_padding_top}
                            onChange={(e) => setLayoutSettings({ ...layoutSettings, section_padding_top: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 border border-black/10"
                            min="0"
                            max="200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#8C8C8C] mb-1">Отступ снизу</label>
                          <input
                            type="number"
                            value={layoutSettings.section_padding_bottom}
                            onChange={(e) => setLayoutSettings({ ...layoutSettings, section_padding_bottom: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 border border-black/10"
                            min="0"
                            max="200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab - All Section Texts */}
          {activeTab === 'content' && !loading && gallerySettings && calculatorSettings && stockSettings && reviewsSettings && contactSettings && footerSettings && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Тексты разделов</h2>
              <p className="text-sm text-[#8C8C8C] mb-6">Редактируйте заголовки и описания всех секций сайта</p>
              
              <div className="space-y-8">
                {/* Gallery Section */}
                <div className="border border-black/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Галерея (Nasze realizacje)</h3>
                    <button onClick={() => saveSectionContent('gallery-content', gallerySettings, 'Настройки галереи')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                      <Save size={14} /> Сохранить
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label>
                      <input
                        type="text"
                        value={gallerySettings.title_pl}
                        onChange={(e) => setGallerySettings({ ...gallerySettings, title_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label>
                      <input
                        type="text"
                        value={gallerySettings.title_en}
                        onChange={(e) => setGallerySettings({ ...gallerySettings, title_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label>
                      <textarea
                        value={gallerySettings.subtitle_pl}
                        onChange={(e) => setGallerySettings({ ...gallerySettings, subtitle_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label>
                      <textarea
                        value={gallerySettings.subtitle_en}
                        onChange={(e) => setGallerySettings({ ...gallerySettings, subtitle_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculator Section */}
                <div className="border border-black/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Калькулятор</h3>
                    <button onClick={() => saveSectionContent('calculator-content', calculatorSettings, 'Настройки калькулятора')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                      <Save size={14} /> Сохранить
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label>
                      <input
                        type="text"
                        value={calculatorSettings.title_pl}
                        onChange={(e) => setCalculatorSettings({ ...calculatorSettings, title_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label>
                      <input
                        type="text"
                        value={calculatorSettings.title_en}
                        onChange={(e) => setCalculatorSettings({ ...calculatorSettings, title_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label>
                      <textarea
                        value={calculatorSettings.subtitle_pl}
                        onChange={(e) => setCalculatorSettings({ ...calculatorSettings, subtitle_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label>
                      <textarea
                        value={calculatorSettings.subtitle_en}
                        onChange={(e) => setCalculatorSettings({ ...calculatorSettings, subtitle_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Saunas Section */}
                <div className="border border-black/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Сауны в наличии</h3>
                    <button onClick={() => saveSectionContent('stock', stockSettings, 'Настройки блока наличия')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                      <Save size={14} /> Сохранить
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label>
                      <input
                        type="text"
                        value={stockSettings.title_pl}
                        onChange={(e) => setStockSettings({ ...stockSettings, title_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label>
                      <input
                        type="text"
                        value={stockSettings.title_en}
                        onChange={(e) => setStockSettings({ ...stockSettings, title_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label>
                      <textarea
                        value={stockSettings.subtitle_pl}
                        onChange={(e) => setStockSettings({ ...stockSettings, subtitle_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label>
                      <textarea
                        value={stockSettings.subtitle_en}
                        onChange={(e) => setStockSettings({ ...stockSettings, subtitle_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="border border-black/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Отзывы</h3>
                    <button onClick={() => saveSectionContent('reviews-content', reviewsSettings, 'Настройки отзывов')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                      <Save size={14} /> Сохранить
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label>
                      <input
                        type="text"
                        value={reviewsSettings.title_pl}
                        onChange={(e) => setReviewsSettings({ ...reviewsSettings, title_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label>
                      <input
                        type="text"
                        value={reviewsSettings.title_en}
                        onChange={(e) => setReviewsSettings({ ...reviewsSettings, title_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label>
                      <textarea
                        value={reviewsSettings.subtitle_pl}
                        onChange={(e) => setReviewsSettings({ ...reviewsSettings, subtitle_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label>
                      <textarea
                        value={reviewsSettings.subtitle_en}
                        onChange={(e) => setReviewsSettings({ ...reviewsSettings, subtitle_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="border border-black/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Контакты</h3>
                    <button onClick={() => saveSectionContent('contact', contactSettings, 'Настройки контактов')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                      <Save size={14} /> Сохранить
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label>
                      <input
                        type="text"
                        value={contactSettings.title_pl}
                        onChange={(e) => setContactSettings({ ...contactSettings, title_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label>
                      <input
                        type="text"
                        value={contactSettings.title_en}
                        onChange={(e) => setContactSettings({ ...contactSettings, title_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label>
                      <textarea
                        value={contactSettings.subtitle_pl}
                        onChange={(e) => setContactSettings({ ...contactSettings, subtitle_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label>
                      <textarea
                        value={contactSettings.subtitle_en}
                        onChange={(e) => setContactSettings({ ...contactSettings, subtitle_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm h-16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок формы (PL)</label>
                      <input
                        type="text"
                        value={contactSettings.form_title_pl}
                        onChange={(e) => setContactSettings({ ...contactSettings, form_title_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок формы (EN)</label>
                      <input
                        type="text"
                        value={contactSettings.form_title_en}
                        onChange={(e) => setContactSettings({ ...contactSettings, form_title_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border border-black/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Подвал (Footer)</h3>
                    <button onClick={() => saveSectionContent('footer', footerSettings, 'Настройки подвала')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                      <Save size={14} /> Сохранить
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Слоган (PL)</label>
                      <input
                        type="text"
                        value={footerSettings.tagline_pl}
                        onChange={(e) => setFooterSettings({ ...footerSettings, tagline_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Слоган (EN)</label>
                      <input
                        type="text"
                        value={footerSettings.tagline_en}
                        onChange={(e) => setFooterSettings({ ...footerSettings, tagline_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Копирайт (PL)</label>
                      <input
                        type="text"
                        value={footerSettings.copyright_pl}
                        onChange={(e) => setFooterSettings({ ...footerSettings, copyright_pl: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Копирайт (EN)</label>
                      <input
                        type="text"
                        value={footerSettings.copyright_en}
                        onChange={(e) => setFooterSettings({ ...footerSettings, copyright_en: e.target.value })}
                        className="w-full p-2 border border-black/10 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && !loading && heroSettings && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки Hero</h2>
                <button onClick={saveHeroSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Save size={16} /> Сохранить
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Фоновое изображение</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={heroSettings.background_image}
                      onChange={(e) => setHeroSettings({ ...heroSettings, background_image: e.target.value })}
                      className="flex-1 p-2 border border-black/10"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white cursor-pointer hover:bg-black">
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files[0], (url) => setHeroSettings({ ...heroSettings, background_image: url }))}
                      />
                    </label>
                  </div>
                  {heroSettings.background_image && (
                    <img src={heroSettings.background_image} alt="Preview" className="mt-2 h-32 object-cover" />
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Заголовок (PL)</label>
                    <input
                      type="text"
                      value={heroSettings.title_pl}
                      onChange={(e) => setHeroSettings({ ...heroSettings, title_pl: e.target.value })}
                      className="w-full p-2 border border-black/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Заголовок (EN)</label>
                    <input
                      type="text"
                      value={heroSettings.title_en}
                      onChange={(e) => setHeroSettings({ ...heroSettings, title_en: e.target.value })}
                      className="w-full p-2 border border-black/10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Подзаголовок (PL)</label>
                    <textarea
                      value={heroSettings.subtitle_pl}
                      onChange={(e) => setHeroSettings({ ...heroSettings, subtitle_pl: e.target.value })}
                      className="w-full p-2 border border-black/10 h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Подзаголовок (EN)</label>
                    <textarea
                      value={heroSettings.subtitle_en}
                      onChange={(e) => setHeroSettings({ ...heroSettings, subtitle_en: e.target.value })}
                      className="w-full p-2 border border-black/10 h-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && !loading && aboutSettings && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки "О компании"</h2>
                <button onClick={saveAboutSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Save size={16} /> Сохранить
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Изображение</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={aboutSettings.image}
                      onChange={(e) => setAboutSettings({ ...aboutSettings, image: e.target.value })}
                      className="flex-1 p-2 border border-black/10"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white cursor-pointer hover:bg-black">
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files[0], (url) => setAboutSettings({ ...aboutSettings, image: url }))}
                      />
                    </label>
                  </div>
                  {aboutSettings.image && (
                    <img src={aboutSettings.image} alt="Preview" className="mt-2 h-32 object-cover" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Лет опыта</label>
                  <input
                    type="number"
                    value={aboutSettings.years_experience}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, years_experience: parseInt(e.target.value) })}
                    className="w-32 p-2 border border-black/10"
                  />
                </div>
                
                {['text1', 'text2', 'text3'].map((textKey) => (
                  <div key={textKey} className="border border-black/5 p-4">
                    <h4 className="font-medium mb-3">Параграф {textKey.slice(-1)}</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-[#8C8C8C]">PL</label>
                        <textarea
                          value={aboutSettings[`${textKey}_pl`]}
                          onChange={(e) => setAboutSettings({ ...aboutSettings, [`${textKey}_pl`]: e.target.value })}
                          className="w-full p-2 border border-black/10 h-16 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#8C8C8C]">EN</label>
                        <textarea
                          value={aboutSettings[`${textKey}_en`]}
                          onChange={(e) => setAboutSettings({ ...aboutSettings, [`${textKey}_en`]: e.target.value })}
                          className="w-full p-2 border border-black/10 h-16 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculator Tab */}
          {activeTab === 'calculator' && !loading && calculatorConfig && apiData && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Конфигурация калькулятора</h2>
                <button onClick={saveCalculatorConfig} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Save size={16} /> Сохранить
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Модели саун</h3>
                <p className="text-sm text-[#8C8C8C] mb-4">Выберите модели для отображения. Пустой список = все включены.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {apiData.models.map((model) => (
                    <label key={model.id} className="flex items-center gap-2 p-2 border border-black/5 cursor-pointer hover:border-[#C6A87C]">
                      <input
                        type="checkbox"
                        checked={calculatorConfig.enabled_models.length === 0 || calculatorConfig.enabled_models.includes(model.id)}
                        onChange={() => toggleModel(model.id)}
                        className="accent-[#C6A87C]"
                      />
                      <span className="text-sm truncate">{model.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Категории опций</h3>
                <p className="text-sm text-[#8C8C8C] mb-4">Выберите категории для отображения. Пустой список = все включены.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {apiData.categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 p-2 border border-black/5 cursor-pointer hover:border-[#C6A87C]">
                      <input
                        type="checkbox"
                        checked={calculatorConfig.enabled_categories.length === 0 || calculatorConfig.enabled_categories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="accent-[#C6A87C]"
                      />
                      <span className="text-sm truncate">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calculator Tab - No API data */}
          {activeTab === 'calculator' && !loading && calculatorConfig && !apiData && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Конфигурация калькулятора</h2>
              </div>
              <div className="text-center py-12 text-[#8C8C8C]">
                <p>Не удалось загрузить данные из API калькулятора.</p>
                <p className="text-sm mt-2">Внешний сервис временно недоступен.</p>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && !loading && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Отзывы клиентов</h2>
                <button onClick={addNewReview} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Plus size={16} /> Добавить отзыв
                </button>
              </div>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <ReviewEditor key={review.id} review={review} onSave={saveReview} onDelete={() => deleteReview(review.id)} onImageUpload={handleImageUpload} />
                ))}
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && !loading && galleryConfig && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Галерея</h2>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 cursor-pointer hover:bg-black">
                    <Upload size={16} /> Массовая загрузка
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files);
                        setLoading(true);
                        for (const file of files) {
                          await handleImageUpload(file, async (url) => {
                            const newImage = {
                              id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                              url: url,
                              alt: file.name.replace(/\.[^/.]+$/, ''),
                              category: 'all',
                              active: true,
                              sort_order: gallery.length,
                            };
                            await fetchWithAuth(`${API_URL}/api/admin/gallery`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(newImage),
                            });
                          });
                        }
                        showMessage('success', `Загружено ${files.length} фото`);
                        fetchAllData();
                      }}
                    />
                  </label>
                  <button onClick={addGalleryImage} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                    <Plus size={16} /> Добавить фото
                  </button>
                </div>
              </div>
              
              {/* API Images Toggle */}
              <div className="mb-6 p-4 bg-[#F9F9F7] border border-black/5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={galleryConfig.show_api_images}
                      onChange={(e) => {
                        const newConfig = { ...galleryConfig, show_api_images: e.target.checked };
                        setGalleryConfig(newConfig);
                        fetchWithAuth(`${API_URL}/api/admin/settings/gallery`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newConfig),
                        }).then(() => showMessage('success', 'Настройка сохранена'));
                      }}
                      className="w-5 h-5 accent-[#C6A87C]"
                    />
                    <div>
                      <span className="font-medium">Показывать фото из API калькулятора</span>
                      <p className="text-sm text-[#8C8C8C]">Автоматически добавлять фото моделей саун из внешнего API</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Gallery Grid */}
              {gallery.length === 0 && !galleryConfig.show_api_images ? (
                <div className="text-center py-12 text-[#8C8C8C] border border-dashed border-black/10">
                  <p>Галерея пуста</p>
                  <p className="text-sm mt-2">Загрузите фото или включите фото из API</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {gallery.map((img) => (
                    <GalleryEditorSimple key={img.id} image={img} onSave={saveGalleryImage} onDelete={() => deleteGalleryImage(img.id)} onImageUpload={handleImageUpload} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stock Saunas Tab */}
          {activeTab === 'stock_saunas' && !loading && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Сауны в наличии</h2>
                <button onClick={addStockSauna} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Plus size={16} /> Добавить сауну
                </button>
              </div>
              <p className="text-sm text-[#8C8C8C] mb-6">Управляйте карточками саун, которые отображаются в блоке "В наличии"</p>
              
              {stockSaunas.length === 0 ? (
                <div className="text-center py-12 text-[#8C8C8C] border border-dashed border-black/10">
                  <p>Нет саун в наличии</p>
                  <p className="text-sm mt-2">Нажмите "Добавить сауну" чтобы создать первую карточку</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stockSaunas.map((sauna) => (
                    <StockSaunaEditor 
                      key={sauna.id} 
                      sauna={sauna} 
                      onSave={saveStockSauna} 
                      onDelete={() => deleteStockSauna(sauna.id)}
                      onImageUpload={handleImageUpload}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && !loading && sectionOrder && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">Порядок секций</h2>
                <button onClick={saveSectionOrder} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
                  <Save size={16} /> Сохранить
                </button>
              </div>
              <div className="space-y-2">
                {sectionOrder.sections.map((section, index) => (
                  <div key={section} className="flex items-center gap-4 p-4 bg-[#F9F9F7] border border-black/5">
                    <GripVertical size={20} className="text-[#8C8C8C]" />
                    <span className="flex-1 font-medium">{sectionNames[section] || section}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-white disabled:opacity-30"
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sectionOrder.sections.length - 1}
                        className="p-1 hover:bg-white disabled:opacity-30"
                      >
                        <ChevronDown size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Review Editor Component
const ReviewEditor = ({ review, onSave, onDelete, onImageUpload }) => {
  const [data, setData] = useState(review);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-black/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={data.image} alt={data.name} className="w-12 h-12 object-cover" />
          <div>
            <h4 className="font-medium">{data.name}</h4>
            <p className="text-sm text-[#8C8C8C]">{data.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-[#F9F9F7]">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onSave(data)} className="p-2 text-[#C6A87C] hover:bg-[#F9F9F7]">
            <Save size={16} />
          </button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-black/5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8C8C8C]">Имя</label>
              <input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full p-2 border border-black/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C]">Город</label>
              <input
                value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })}
                className="w-full p-2 border border-black/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C]">Сауна</label>
              <input
                value={data.sauna}
                onChange={(e) => setData({ ...data, sauna: e.target.value })}
                className="w-full p-2 border border-black/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C]">Оценка</label>
              <select
                value={data.rating}
                onChange={(e) => setData({ ...data, rating: parseInt(e.target.value) })}
                className="w-full p-2 border border-black/10 text-sm"
              >
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ★</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-[#8C8C8C]">URL фото</label>
            <div className="flex gap-2">
              <input
                value={data.image}
                onChange={(e) => setData({ ...data, image: e.target.value })}
                className="flex-1 p-2 border border-black/10 text-sm"
              />
              <label className="flex items-center gap-1 px-3 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer">
                <Upload size={14} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onImageUpload(e.target.files[0], (url) => setData({ ...data, image: url }))}
                />
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-[#8C8C8C]">Отзыв (PL)</label>
            <textarea
              value={data.text_pl}
              onChange={(e) => setData({ ...data, text_pl: e.target.value })}
              className="w-full p-2 border border-black/10 text-sm h-16"
            />
          </div>
          <div>
            <label className="text-xs text-[#8C8C8C]">Отзыв (EN)</label>
            <textarea
              value={data.text_en}
              onChange={(e) => setData({ ...data, text_en: e.target.value })}
              className="w-full p-2 border border-black/10 text-sm h-16"
            />
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.active}
              onChange={(e) => setData({ ...data, active: e.target.checked })}
              className="accent-[#C6A87C]"
            />
            <span className="text-sm">Активен</span>
          </label>
        </div>
      )}
    </div>
  );
};

// Gallery Editor Component
const GalleryEditor = ({ image, onSave, onDelete, onImageUpload }) => {
  const [data, setData] = useState(image);

  return (
    <div className="border border-black/5 p-2">
      <div className="aspect-square bg-[#F2F2F0] mb-2 relative overflow-hidden">
        {data.url ? (
          <img src={data.url} alt={data.alt} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-[#8C8C8C]">
            <Image size={32} />
          </div>
        )}
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
          <Upload size={24} className="text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onImageUpload(e.target.files[0], (url) => {
                const newData = { ...data, url };
                setData(newData);
                onSave(newData);
              });
            }}
          />
        </label>
      </div>
      <input
        value={data.url}
        onChange={(e) => setData({ ...data, url: e.target.value })}
        placeholder="URL фото"
        className="w-full p-1 border border-black/10 text-xs mb-1"
      />
      <input
        value={data.alt}
        onChange={(e) => setData({ ...data, alt: e.target.value })}
        placeholder="Описание"
        className="w-full p-1 border border-black/10 text-xs mb-1"
      />
      <select
        value={data.category}
        onChange={(e) => setData({ ...data, category: e.target.value })}
        className="w-full p-1 border border-black/10 text-xs mb-2"
      >
        <option value="all">Все</option>
        <option value="kwadro">Квадро</option>
        <option value="beczka">Бочка</option>
      </select>
      <div className="flex gap-1">
        <button onClick={() => onSave(data)} className="flex-1 p-1 bg-[#C6A87C] text-white text-xs">
          <Check size={12} className="mx-auto" />
        </button>
        <button onClick={onDelete} className="p-1 bg-red-500 text-white text-xs">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// Stock Sauna Editor Component
const StockSaunaEditor = ({ sauna, onSave, onDelete, onImageUpload }) => {
  const [data, setData] = useState(sauna);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-black/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-[#F2F2F0] overflow-hidden">
            {data.image ? (
              <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8C8C8C]">
                <Image size={24} />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium">{data.name}</h4>
            <p className="text-sm text-[#C6A87C]">
              {data.discount > 0 ? (
                <>
                  <span className="line-through text-[#8C8C8C] mr-2">{data.price?.toLocaleString()} PLN</span>
                  {Math.round(data.price * (1 - data.discount / 100)).toLocaleString()} PLN
                </>
              ) : (
                <>{data.price?.toLocaleString()} PLN</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.active}
              onChange={(e) => {
                const newData = { ...data, active: e.target.checked };
                setData(newData);
                onSave(newData);
              }}
              className="accent-[#C6A87C]"
            />
            Активна
          </label>
          <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-[#F9F9F7]">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onSave(data)} className="p-2 text-[#C6A87C] hover:bg-[#F9F9F7]">
            <Save size={16} />
          </button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-black/5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-[#8C8C8C]">Название</label>
              <input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full p-2 border border-black/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C]">Цена (PLN)</label>
              <input
                type="number"
                value={data.price}
                onChange={(e) => setData({ ...data, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-black/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C]">Скидка (%)</label>
              <input
                type="number"
                value={data.discount}
                onChange={(e) => setData({ ...data, discount: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-black/10 text-sm"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C]">Вместимость</label>
              <input
                value={data.capacity}
                onChange={(e) => setData({ ...data, capacity: e.target.value })}
                className="w-full p-2 border border-black/10 text-sm"
                placeholder="2-4"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C]">Парилка (м²)</label>
              <input
                value={data.steam_room_size}
                onChange={(e) => setData({ ...data, steam_room_size: e.target.value })}
                className="w-full p-2 border border-black/10 text-sm"
                placeholder="2.5"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-[#8C8C8C]">URL изображения</label>
            <div className="flex gap-2">
              <input
                value={data.image}
                onChange={(e) => setData({ ...data, image: e.target.value })}
                className="flex-1 p-2 border border-black/10 text-sm"
              />
              <label className="flex items-center gap-1 px-3 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer">
                <Upload size={14} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onImageUpload(e.target.files[0], (url) => setData({ ...data, image: url }))}
                />
              </label>
            </div>
            {data.image && (
              <img src={data.image} alt="Preview" className="mt-2 h-24 object-cover" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Gallery Editor Component (no categories)
const GalleryEditorSimple = ({ image, onSave, onDelete, onImageUpload }) => {
  const [data, setData] = useState(image);

  return (
    <div className="border border-black/5 p-2">
      <div className="aspect-square bg-[#F2F2F0] mb-2 relative overflow-hidden">
        {data.url ? (
          <img src={data.url} alt={data.alt} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-[#8C8C8C]">
            <Image size={32} />
          </div>
        )}
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
          <Upload size={24} className="text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onImageUpload(e.target.files[0], (url) => {
                const newData = { ...data, url };
                setData(newData);
                onSave(newData);
              });
            }}
          />
        </label>
      </div>
      <input
        value={data.alt}
        onChange={(e) => setData({ ...data, alt: e.target.value })}
        placeholder="Описание"
        className="w-full p-1 border border-black/10 text-xs mb-2"
      />
      <div className="flex gap-1">
        <button onClick={() => onSave(data)} className="flex-1 p-1 bg-[#C6A87C] text-white text-xs">
          <Check size={12} className="mx-auto" />
        </button>
        <button onClick={onDelete} className="p-1 bg-red-500 text-white text-xs">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
