import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  pl: {
    // Navigation
    nav: {
      models: 'Modele',
      calculator: 'Kalkulator',
      gallery: 'Realizacje',
      stock: 'Dostępne od ręki',
      reviews: 'Opinie',
      about: 'O firmie',
      contact: 'Kontakt',
    },
    // Hero
    hero: {
      title: 'Producent Saun Drewnianych w Polsce',
      subtitle: 'Od 2015 roku tworzymy sauny premium z najwyższej jakości drewna skandynawskiego. Gotowe do dostawy w 5-10 dni.',
      cta_primary: 'Oblicz cenę',
      cta_secondary: 'Zobacz ofertę',
    },
    // Calculator
    calculator: {
      title: 'Kalkulator saun',
      subtitle: 'Skonfiguruj swoją saunę i poznaj cenę w kilka minut',
      step_model: 'Wybierz model',
      step_variant: 'Wybierz układ',
      step_options: 'Dodaj opcje',
      step_summary: 'Podsumowanie',
      next: 'Dalej',
      back: 'Wstecz',
      total: 'Razem',
      discount: 'Rabat',
      base_price: 'Cena bazowa',
      options_price: 'Opcje',
      send_inquiry: 'Wyślij zapytanie',
      download_pdf: 'Pobierz PDF',
      persons: 'osób',
      included: 'W zestawie',
      select_model_hint: 'Wybierz model sauny, aby kontynuować',
      loading: 'Ładowanie...',
    },
    // Gallery
    gallery: {
      title: 'Nasze realizacje',
      subtitle: 'Zobacz gotowe projekty saun, które stworzyliśmy dla naszych klientów',
      filter_all: 'Wszystkie',
      filter_outdoor: 'Zewnętrzne',
      filter_barrel: 'Beczka',
      filter_kwadro: 'Kwadro',
    },
    // Stock
    stock: {
      title: 'Sauny dostępne od ręki',
      subtitle: 'Gotowe modele na magazynie — szybka dostawa bez czekania',
      available: 'Dostępna od ręki',
      buy_now: 'Kup teraz',
      from: 'od',
    },
    // Reviews
    reviews: {
      title: 'Opinie klientów',
      subtitle: 'Sprawdź, co mówią o nas nasi klienci',
      see_more: 'Zobacz więcej opinii',
    },
    // About
    about: {
      title: 'O firmie WM-Sauna',
      subtitle: 'Polska jakość i rzemiosło od 2015 roku',
      text1: 'Jesteśmy polskim producentem saun drewnianych z siedzibą w Warszawie. Od 2015 roku tworzymy sauny premium, łącząc tradycyjne rzemiosło z nowoczesnym designem.',
      text2: 'Używamy tylko najwyższej jakości drewna skandynawskiego, suszonego w komorach. Każda sauna przechodzi ponad 30 punktów kontroli jakości przed wysyłką.',
      text3: 'Oferujemy pełny serwis — od projektu, przez produkcję, po dostawę i montaż. Gwarancja 24 miesiące na wszystkie nasze produkty.',
      feature1: 'Polska produkcja',
      feature2: 'Drewno skandynawskie',
      feature3: 'Gwarancja 24 miesiące',
      feature4: 'Dostawa w 5-10 dni',
    },
    // Contact
    contact: {
      title: 'Kontakt',
      subtitle: 'Skontaktuj się z nami, aby otrzymać indywidualną wycenę',
      form_name: 'Imię i nazwisko',
      form_email: 'Email',
      form_phone: 'Telefon',
      form_message: 'Wiadomość',
      form_submit: 'Wyślij wiadomość',
      form_success: 'Wiadomość wysłana! Odezwiemy się wkrótce.',
      form_error: 'Wystąpił błąd. Spróbuj ponownie.',
      address: 'Adres',
      phone: 'Telefon',
      email: 'Email',
      hours: 'Godziny pracy',
      hours_value: 'Pon–Pt: 9:00 – 17:45',
    },
    // Footer
    footer: {
      description: 'Polski producent saun drewnianych premium. Tworzymy sauny z pasją od 2015 roku.',
      links: 'Szybkie linki',
      legal: 'Informacje prawne',
      privacy: 'Polityka prywatności',
      cookies: 'Polityka cookies',
      terms: 'Regulamin',
      copyright: '© 2025 WM-Sauna. Wszelkie prawa zastrzeżone.',
    },
  },
  en: {
    nav: {
      models: 'Models',
      calculator: 'Calculator',
      gallery: 'Projects',
      stock: 'In Stock',
      reviews: 'Reviews',
      about: 'About Us',
      contact: 'Contact',
    },
    hero: {
      title: 'Wooden Sauna Manufacturer in Poland',
      subtitle: 'Since 2015, we create premium saunas from the highest quality Scandinavian wood. Ready for delivery in 5-10 days.',
      cta_primary: 'Calculate Price',
      cta_secondary: 'View Offer',
    },
    calculator: {
      title: 'Sauna Calculator',
      subtitle: 'Configure your sauna and get a price in minutes',
      step_model: 'Choose Model',
      step_variant: 'Choose Layout',
      step_options: 'Add Options',
      step_summary: 'Summary',
      next: 'Next',
      back: 'Back',
      total: 'Total',
      discount: 'Discount',
      base_price: 'Base Price',
      options_price: 'Options',
      send_inquiry: 'Send Inquiry',
      download_pdf: 'Download PDF',
      persons: 'persons',
      included: 'Included',
      select_model_hint: 'Select a sauna model to continue',
      loading: 'Loading...',
    },
    gallery: {
      title: 'Our Projects',
      subtitle: 'See completed sauna projects we created for our clients',
      filter_all: 'All',
      filter_outdoor: 'Outdoor',
      filter_barrel: 'Barrel',
      filter_kwadro: 'Kwadro',
    },
    stock: {
      title: 'Saunas In Stock',
      subtitle: 'Ready models in warehouse — fast delivery without waiting',
      available: 'Available Now',
      buy_now: 'Buy Now',
      from: 'from',
    },
    reviews: {
      title: 'Customer Reviews',
      subtitle: 'See what our customers say about us',
      see_more: 'See More Reviews',
    },
    about: {
      title: 'About WM-Sauna',
      subtitle: 'Polish quality and craftsmanship since 2015',
      text1: 'We are a Polish wooden sauna manufacturer based in Warsaw. Since 2015, we create premium saunas, combining traditional craftsmanship with modern design.',
      text2: 'We use only the highest quality Scandinavian wood, kiln-dried. Each sauna passes over 30 quality control points before shipping.',
      text3: 'We offer full service — from design, through production, to delivery and installation. 12-month warranty on all our products.',
      feature1: 'Polish Production',
      feature2: 'Scandinavian Wood',
      feature3: '12-Month Warranty',
      feature4: 'Delivery in 5-10 Days',
    },
    contact: {
      title: 'Contact',
      subtitle: 'Contact us to receive an individual quote',
      form_name: 'Full Name',
      form_email: 'Email',
      form_phone: 'Phone',
      form_message: 'Message',
      form_submit: 'Send Message',
      form_success: 'Message sent! We will contact you soon.',
      form_error: 'An error occurred. Please try again.',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      hours: 'Working Hours',
      hours_value: 'Mon–Fri: 9:00 – 17:45',
    },
    footer: {
      description: 'Polish premium wooden sauna manufacturer. Creating saunas with passion since 2015.',
      links: 'Quick Links',
      legal: 'Legal Information',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      terms: 'Terms of Service',
      copyright: '© 2025 WM-Sauna. All rights reserved.',
    },
  },
  ru: {
    nav: {
      models: 'Модели',
      calculator: 'Калькулятор',
      gallery: 'Реализации',
      stock: 'В наличии',
      reviews: 'Отзывы',
      about: 'О компании',
      contact: 'Контакт',
    },
    hero: {
      title: 'Производитель деревянных саун в Польше',
      subtitle: 'С 2015 года создаём премиальные сауны из высококачественной скандинавской древесины. Готовы к доставке за 5-10 дней.',
      cta_primary: 'Рассчитать цену',
      cta_secondary: 'Смотреть предложение',
    },
    calculator: {
      title: 'Калькулятор саун',
      subtitle: 'Сконфигурируйте свою сауну и узнайте цену за несколько минут',
      step_model: 'Выберите модель',
      step_variant: 'Выберите планировку',
      step_options: 'Добавьте опции',
      step_summary: 'Итого',
      next: 'Далее',
      back: 'Назад',
      total: 'Итого',
      discount: 'Скидка',
      base_price: 'Базовая цена',
      options_price: 'Опции',
      send_inquiry: 'Отправить запрос',
      download_pdf: 'Скачать PDF',
      persons: 'человек',
      included: 'В комплекте',
      select_model_hint: 'Выберите модель сауны, чтобы продолжить',
      loading: 'Загрузка...',
    },
    gallery: {
      title: 'Наши работы',
      subtitle: 'Смотрите готовые проекты саун, которые мы создали для наших клиентов',
      filter_all: 'Все',
      filter_outdoor: 'Уличные',
      filter_barrel: 'Бочка',
      filter_kwadro: 'Квадро',
    },
    stock: {
      title: 'Сауны в наличии',
      subtitle: 'Готовые модели на складе — быстрая доставка без ожидания',
      available: 'В наличии',
      buy_now: 'Купить сейчас',
      from: 'от',
    },
    reviews: {
      title: 'Отзывы клиентов',
      subtitle: 'Узнайте, что говорят о нас наши клиенты',
      see_more: 'Смотреть больше отзывов',
    },
    about: {
      title: 'О компании WM-Sauna',
      subtitle: 'Польское качество и мастерство с 2015 года',
      text1: 'Мы — польский производитель деревянных саун с офисом в Варшаве. С 2015 года создаём премиальные сауны, сочетая традиционное мастерство с современным дизайном.',
      text2: 'Используем только высококачественную скандинавскую древесину, высушенную в камерах. Каждая сауна проходит более 30 пунктов контроля качества перед отправкой.',
      text3: 'Предлагаем полный сервис — от проекта, через производство, до доставки и монтажа. Гарантия 12 месяцев на все наши продукты.',
      feature1: 'Польское производство',
      feature2: 'Скандинавская древесина',
      feature3: 'Гарантия 12 месяцев',
      feature4: 'Доставка за 5-10 дней',
    },
    contact: {
      title: 'Контакт',
      subtitle: 'Свяжитесь с нами для получения индивидуального расчёта',
      form_name: 'Имя и фамилия',
      form_email: 'Email',
      form_phone: 'Телефон',
      form_message: 'Сообщение',
      form_submit: 'Отправить сообщение',
      form_success: 'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.',
      form_error: 'Произошла ошибка. Попробуйте ещё раз.',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Email',
      hours: 'Часы работы',
      hours_value: 'Пн–Пт: 9:00 – 17:45',
    },
    footer: {
      description: 'Польский производитель премиальных деревянных саун. Создаём сауны с любовью с 2015 года.',
      links: 'Быстрые ссылки',
      legal: 'Правовая информация',
      privacy: 'Политика конфиденциальности',
      cookies: 'Политика cookies',
      terms: 'Условия использования',
      copyright: '© 2025 WM-Sauna. Все права защищены.',
    },
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pl');

  useEffect(() => {
    const savedLang = localStorage.getItem('wm-sauna-lang');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('wm-sauna-lang', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
