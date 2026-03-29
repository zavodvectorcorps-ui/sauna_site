import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Image, MessageSquare, LayoutGrid, LogOut, 
  Eye, GripVertical, Phone, FileText, Star, ChevronDown, Droplets, Flame, CreditCard, Gift
} from 'lucide-react';
import { BaliaProductsAdmin } from '../components/admin/BaliaProductsAdmin';
import { BaliaTestimonialsAdmin } from '../components/admin/BaliaTestimonialsAdmin';
import { BaliaContentAdmin } from '../components/admin/BaliaContentAdmin';
import { BaliaIntegrationsAdmin } from '../components/admin/BaliaIntegrationsAdmin';
import { BaliaCatalogAdmin } from '../components/admin/BaliaCatalogAdmin';
import { BaliaColorsAdmin } from '../components/admin/BaliaColorsAdmin';
import { BaliaCardOptionsAdmin } from '../components/admin/BaliaCardOptionsAdmin';
import { BaliaFaqAdmin } from '../components/admin/BaliaFaqAdmin';
import { BlogAdmin } from '../components/admin/BlogAdmin';
import { SaunaVideoReviewsAdmin } from '../components/admin/SaunaVideoReviewsAdmin';
import { B2BAdmin } from '../components/admin/B2BAdmin';
import { WhatsAppAdmin } from '../components/admin/WhatsAppAdmin';
import { OrderProcessAdmin } from '../components/admin/OrderProcessAdmin';
import { SaunaMessagesAdmin } from '../components/admin/SaunaMessagesAdmin';
import { SaunaDesignAdmin } from '../components/admin/SaunaDesignAdmin';
import { SaunaContentAdmin } from '../components/admin/SaunaContentAdmin';
import { SaunaCalculatorAdmin } from '../components/admin/SaunaCalculatorAdmin';
import { SaunaReviewsAdmin } from '../components/admin/SaunaReviewsAdmin';
import { SaunaGalleryAdmin } from '../components/admin/SaunaGalleryAdmin';
import { SaunaModelsStockAdmin } from '../components/admin/SaunaModelsStockAdmin';
import { SaunaFaqAdmin } from '../components/admin/SaunaFaqAdmin';
import { SaunaPromoFeaturesAdmin } from '../components/admin/SaunaPromoFeaturesAdmin';
import { SaunaAdvantagesAdmin } from '../components/admin/SaunaAdvantagesAdmin';
import { SaunaSeoAdmin } from '../components/admin/SaunaSeoAdmin';
import { SaunaIntegrationsAdmin } from '../components/admin/SaunaIntegrationsAdmin';
import { SaunaCatalogSectionsAdmin } from '../components/admin/SaunaCatalogSectionsAdmin';
import { InstallmentAdmin } from '../components/admin/InstallmentAdmin';
import { SpecialOfferAdmin } from '../components/admin/SpecialOfferAdmin';
import { MainLandingAdmin } from '../components/admin/MainLandingAdmin';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authHeader, setAuthHeader] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch(`${API_URL}/api/admin/contacts`, {
        headers: { 'Authorization': auth },
      });
      if (response.ok) {
        setAuthHeader(auth);
        localStorage.setItem('adminAuth', auth);
        setIsLoggedIn(true);
        showMessage('success', 'Вход выполнен успешно');
      } else {
        showMessage('error', 'Неверные данные для входа');
      }
    } catch {
      showMessage('error', 'Ошибка подключения');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthHeader('');
    localStorage.removeItem('adminAuth');
    setCredentials({ username: '', password: '' });
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      setAuthHeader(savedAuth);
      setIsLoggedIn(true);
    }
  }, []);

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
          <form onSubmit={handleLogin} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Логин</label>
              <input type="text" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none" required data-testid="admin-login-username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Пароль</label>
              <input type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none" required data-testid="admin-login-password" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#C6A87C] text-white p-3 font-medium hover:bg-[#B09060] transition-colors disabled:opacity-50" data-testid="admin-login-submit">
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const tabGroups = [
    {
      id: 'general',
      label: 'Общее',
      icon: MessageSquare,
      color: '#595959',
      tabs: [
        { id: 'contacts', label: 'Сообщения', icon: MessageSquare },
        { id: 'main_landing', label: 'Главная', icon: Image },
        { id: 'integrations', label: 'Интеграции', icon: Settings },
      ],
    },
    {
      id: 'sauna',
      label: 'Сауны',
      icon: Flame,
      color: '#C6A87C',
      tabs: [
        { id: 'hero', label: 'Hero', icon: Image },
        { id: 'content', label: 'Тексты', icon: FileText },
        { id: 'about', label: 'О компании', icon: FileText },
        { id: 'social_proof', label: 'Счётчики', icon: Users },
        { id: 'models', label: 'Модели', icon: LayoutGrid },
        { id: 'gallery', label: 'Галерея', icon: Image },
        { id: 'api_images', label: 'Фото из API', icon: Eye },
        { id: 'stock_saunas', label: 'В наличии', icon: Users },
        { id: 'calculator', label: 'Калькулятор', icon: LayoutGrid },
        { id: 'reviews', label: 'Отзывы', icon: Star },
        { id: 'faq', label: 'FAQ', icon: FileText },
        { id: 'order_process_sauna', label: 'Процесс заказа', icon: GripVertical },
        { id: 'promo_features', label: 'Преимущества', icon: Star },
        { id: 'advantages', label: '7 фактов', icon: Star },
        { id: 'layout', label: 'Оформление', icon: LayoutGrid },
        { id: 'buttons', label: 'Кнопки', icon: Settings },
        { id: 'site', label: 'Контакты', icon: Phone },
        { id: 'seo', label: 'SEO', icon: FileText },
        { id: 'installment', label: 'Рассрочка', icon: CreditCard },
        { id: 'special_offer', label: 'Спецпредложение', icon: Gift },
        { id: 'catalog', label: 'Каталог', icon: FileText },
        { id: 'sections', label: 'Порядок', icon: GripVertical },
      ],
    },
    {
      id: 'balia',
      label: 'Купели',
      icon: Droplets,
      color: '#339DC7',
      tabs: [
        { id: 'balia_products', label: 'Продукты', icon: LayoutGrid },
        { id: 'balia_colors', label: 'Цвета', icon: Image },
        { id: 'balia_card_options', label: 'Опции карточки', icon: Settings },
        { id: 'balia_testimonials', label: 'Отзывы', icon: Star },
        { id: 'balia_content', label: 'Контент', icon: FileText },
        { id: 'balia_faq', label: 'FAQ', icon: FileText },
        { id: 'order_process_balia', label: 'Процесс заказа', icon: GripVertical },
        { id: 'balia_catalog', label: 'Каталог', icon: FileText },
        { id: 'balia_integrations', label: 'Интеграции', icon: Settings },
      ],
    },
    {
      id: 'blog',
      label: 'Блог',
      icon: FileText,
      color: '#8B5CF6',
      tabs: [
        { id: 'blog_articles', label: 'Статьи', icon: FileText },
      ],
    },
    {
      id: 'b2b_group',
      label: 'B2B',
      icon: Users,
      color: '#059669',
      tabs: [
        { id: 'b2b', label: 'Настройки B2B', icon: Users },
      ],
    },
    {
      id: 'global',
      label: 'Глобальные',
      icon: Settings,
      color: '#D97706',
      tabs: [
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'video_reviews', label: 'Видео-обзоры', icon: Eye },
      ],
    },
  ];

  // Map tab IDs to components
  const renderTab = () => {
    const props = { authHeader, showMessage };

    switch (activeTab) {
      case 'contacts':
        return <SaunaMessagesAdmin {...props} />;
      case 'site':
      case 'layout':
      case 'buttons':
        return <SaunaDesignAdmin {...props} activeSubTab={activeTab} />;
      case 'content':
      case 'hero':
      case 'about':
        return <SaunaContentAdmin {...props} activeSubTab={activeTab} />;
      case 'calculator':
        return <SaunaCalculatorAdmin {...props} />;
      case 'reviews':
        return <SaunaReviewsAdmin {...props} />;
      case 'gallery':
      case 'api_images':
        return <SaunaGalleryAdmin {...props} activeSubTab={activeTab} />;
      case 'models':
      case 'stock_saunas':
      case 'social_proof':
        return <SaunaModelsStockAdmin {...props} activeSubTab={activeTab} />;
      case 'faq':
        return <SaunaFaqAdmin {...props} />;
      case 'promo_features':
        return <SaunaPromoFeaturesAdmin {...props} />;
      case 'advantages':
        return <SaunaAdvantagesAdmin {...props} />;
      case 'seo':
        return <SaunaSeoAdmin {...props} />;
      case 'integrations':
        return <SaunaIntegrationsAdmin {...props} />;
      case 'main_landing':
        return <MainLandingAdmin {...props} />;
      case 'catalog':
      case 'sections':
        return <SaunaCatalogSectionsAdmin {...props} activeSubTab={activeTab} />;
      case 'installment':
        return <InstallmentAdmin {...props} />;
      case 'special_offer':
        return <SpecialOfferAdmin {...props} />;
      case 'balia_products':
        return <BaliaProductsAdmin {...props} />;
      case 'balia_colors':
        return <BaliaColorsAdmin {...props} />;
      case 'balia_card_options':
        return <BaliaCardOptionsAdmin {...props} />;
      case 'balia_testimonials':
        return <BaliaTestimonialsAdmin {...props} />;
      case 'balia_content':
        return <BaliaContentAdmin {...props} />;
      case 'balia_faq':
        return <BaliaFaqAdmin {...props} />;
      case 'balia_catalog':
        return <BaliaCatalogAdmin {...props} />;
      case 'balia_integrations':
        return <BaliaIntegrationsAdmin {...props} />;
      case 'blog_articles':
        return <BlogAdmin {...props} />;
      case 'video_reviews':
        return <SaunaVideoReviewsAdmin {...props} />;
      case 'b2b':
        return <B2BAdmin {...props} />;
      case 'whatsapp':
        return <WhatsAppAdmin {...props} />;
      case 'order_process_sauna':
        return <OrderProcessAdmin {...props} type="sauna" />;
      case 'order_process_balia':
        return <OrderProcessAdmin {...props} type="balia" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Header */}
      <header className="bg-[#1A1A1A] text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">WM Group Админ</h1>
            <a href="/" target="_blank" className="text-sm text-[#C6A87C] hover:underline">
              Открыть сайт →
            </a>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-[#C6A87C]" data-testid="admin-logout-btn">
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </header>

      {/* Message */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white shadow-lg`} data-testid="admin-message">
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* Sidebar */}
        <nav className="w-56 flex-shrink-0">
          <div className="bg-white border border-black/5 sticky top-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
            {tabGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.id];
              const hasActiveTab = group.tabs.some(t => t.id === activeTab);
              return (
                <div key={group.id} data-testid={`admin-group-${group.id}`}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    data-testid={`admin-group-toggle-${group.id}`}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-black/5 transition-colors ${
                      hasActiveTab ? 'text-[#1A1A1A]' : 'text-[#8C8C8C]'
                    } hover:bg-[#F9F9F7]`}
                  >
                    <span className="flex items-center gap-2">
                      <group.icon size={14} style={{ color: group.color }} />
                      {group.label}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>
                  {!isCollapsed && (
                    <div className="py-1 px-1">
                      {group.tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          data-testid={`admin-tab-${tab.id}`}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                            activeTab === tab.id
                              ? 'bg-[#C6A87C] text-white font-medium'
                              : 'text-[#595959] hover:bg-[#F9F9F7]'
                          }`}
                        >
                          <tab.icon size={15} />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 bg-white border border-black/5 p-6" data-testid="admin-main-content">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
