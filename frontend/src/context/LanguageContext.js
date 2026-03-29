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
      text3: 'We offer full service — from design, through production, to delivery and installation. 24-month warranty on all our products.',
      feature1: 'Polish Production',
      feature2: 'Scandinavian Wood',
      feature3: '24-Month Warranty',
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
  de: {
    nav: {
      models: 'Modelle',
      calculator: 'Kalkulator',
      gallery: 'Projekte',
      stock: 'Sofort verfügbar',
      reviews: 'Bewertungen',
      about: 'Über uns',
      contact: 'Kontakt',
    },
    hero: {
      title: 'Holzsauna-Hersteller in Polen',
      subtitle: 'Seit 2015 fertigen wir Premium-Saunen aus hochwertigstem skandinavischem Holz. Lieferbereit in 5–10 Tagen.',
      cta_primary: 'Preis berechnen',
      cta_secondary: 'Angebot ansehen',
    },
    calculator: {
      title: 'Sauna-Kalkulator',
      subtitle: 'Konfigurieren Sie Ihre Sauna und erhalten Sie in wenigen Minuten einen Preis',
      step_model: 'Modell wählen',
      step_variant: 'Grundriss wählen',
      step_options: 'Optionen hinzufügen',
      step_summary: 'Zusammenfassung',
      next: 'Weiter',
      back: 'Zurück',
      total: 'Gesamt',
      discount: 'Rabatt',
      base_price: 'Grundpreis',
      options_price: 'Optionen',
      send_inquiry: 'Anfrage senden',
      download_pdf: 'PDF herunterladen',
      persons: 'Personen',
      included: 'Inklusive',
      select_model_hint: 'Wählen Sie ein Saunamodell, um fortzufahren',
      loading: 'Laden...',
    },
    gallery: {
      title: 'Unsere Projekte',
      subtitle: 'Sehen Sie fertige Saunaprojekte, die wir für unsere Kunden realisiert haben',
      filter_all: 'Alle',
      filter_outdoor: 'Außen',
      filter_barrel: 'Fass',
      filter_kwadro: 'Kwadro',
    },
    stock: {
      title: 'Saunen sofort verfügbar',
      subtitle: 'Fertige Modelle auf Lager — schnelle Lieferung ohne Wartezeit',
      available: 'Sofort verfügbar',
      buy_now: 'Jetzt kaufen',
      from: 'ab',
    },
    reviews: {
      title: 'Kundenbewertungen',
      subtitle: 'Erfahren Sie, was unsere Kunden über uns sagen',
      see_more: 'Mehr Bewertungen ansehen',
    },
    about: {
      title: 'Über WM-Sauna',
      subtitle: 'Polnische Qualität und Handwerkskunst seit 2015',
      text1: 'Wir sind ein polnischer Holzsauna-Hersteller mit Sitz in Warschau. Seit 2015 fertigen wir Premium-Saunen und verbinden traditionelles Handwerk mit modernem Design.',
      text2: 'Wir verwenden ausschließlich hochwertiges skandinavisches Holz, kammergetrocknet. Jede Sauna durchläuft über 30 Qualitätskontrollen vor dem Versand.',
      text3: 'Wir bieten Komplettservice — von der Planung über die Produktion bis zur Lieferung und Montage. 24 Monate Garantie auf alle unsere Produkte.',
      feature1: 'Polnische Produktion',
      feature2: 'Skandinavisches Holz',
      feature3: '24 Monate Garantie',
      feature4: 'Lieferung in 5–10 Tagen',
    },
    contact: {
      title: 'Kontakt',
      subtitle: 'Kontaktieren Sie uns für ein individuelles Angebot',
      form_name: 'Vor- und Nachname',
      form_email: 'E-Mail',
      form_phone: 'Telefon',
      form_message: 'Nachricht',
      form_submit: 'Nachricht senden',
      form_success: 'Nachricht gesendet! Wir melden uns in Kürze.',
      form_error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      address: 'Adresse',
      phone: 'Telefon',
      email: 'E-Mail',
      hours: 'Öffnungszeiten',
      hours_value: 'Mo–Fr: 9:00 – 17:45',
    },
    footer: {
      description: 'Polnischer Premium-Holzsauna-Hersteller. Wir bauen Saunen mit Leidenschaft seit 2015.',
      links: 'Schnelllinks',
      legal: 'Rechtliche Informationen',
      privacy: 'Datenschutzrichtlinie',
      cookies: 'Cookie-Richtlinie',
      terms: 'Nutzungsbedingungen',
      copyright: '© 2025 WM-Sauna. Alle Rechte vorbehalten.',
    },
  },
  cs: {
    nav: {
      models: 'Modely',
      calculator: 'Kalkulačka',
      gallery: 'Realizace',
      stock: 'Ihned k dodání',
      reviews: 'Recenze',
      about: 'O nás',
      contact: 'Kontakt',
    },
    hero: {
      title: 'Výrobce dřevěných saun v Polsku',
      subtitle: 'Od roku 2015 vyrábíme prémiové sauny z nejkvalitnějšího skandinávského dřeva. Připraveno k dodání za 5–10 dní.',
      cta_primary: 'Spočítat cenu',
      cta_secondary: 'Zobrazit nabídku',
    },
    calculator: {
      title: 'Kalkulačka saun',
      subtitle: 'Nakonfigurujte si saunu a zjistěte cenu během několika minut',
      step_model: 'Vybrat model',
      step_variant: 'Vybrat dispozici',
      step_options: 'Přidat možnosti',
      step_summary: 'Shrnutí',
      next: 'Další',
      back: 'Zpět',
      total: 'Celkem',
      discount: 'Sleva',
      base_price: 'Základní cena',
      options_price: 'Možnosti',
      send_inquiry: 'Odeslat poptávku',
      download_pdf: 'Stáhnout PDF',
      persons: 'osob',
      included: 'V ceně',
      select_model_hint: 'Vyberte model sauny pro pokračování',
      loading: 'Načítání...',
    },
    gallery: {
      title: 'Naše realizace',
      subtitle: 'Podívejte se na dokončené projekty saun, které jsme vytvořili pro naše klienty',
      filter_all: 'Vše',
      filter_outdoor: 'Venkovní',
      filter_barrel: 'Sudová',
      filter_kwadro: 'Kwadro',
    },
    stock: {
      title: 'Sauny ihned k dodání',
      subtitle: 'Hotové modely na skladě — rychlé dodání bez čekání',
      available: 'Ihned k dodání',
      buy_now: 'Koupit nyní',
      from: 'od',
    },
    reviews: {
      title: 'Recenze zákazníků',
      subtitle: 'Podívejte se, co o nás říkají naši zákazníci',
      see_more: 'Zobrazit více recenzí',
    },
    about: {
      title: 'O firmě WM-Sauna',
      subtitle: 'Polská kvalita a řemeslo od roku 2015',
      text1: 'Jsme polský výrobce dřevěných saun se sídlem ve Varšavě. Od roku 2015 vyrábíme prémiové sauny, které kombinují tradiční řemeslo s moderním designem.',
      text2: 'Používáme pouze nejkvalitnější skandinávské dřevo, sušené v komorách. Každá sauna prochází více než 30 kontrolními body kvality před odesláním.',
      text3: 'Nabízíme kompletní servis — od návrhu přes výrobu až po dodání a montáž. Záruka 24 měsíců na všechny naše produkty.',
      feature1: 'Polská výroba',
      feature2: 'Skandinávské dřevo',
      feature3: 'Záruka 24 měsíců',
      feature4: 'Dodání za 5–10 dní',
    },
    contact: {
      title: 'Kontakt',
      subtitle: 'Kontaktujte nás pro individuální nabídku',
      form_name: 'Jméno a příjmení',
      form_email: 'E-mail',
      form_phone: 'Telefon',
      form_message: 'Zpráva',
      form_submit: 'Odeslat zprávu',
      form_success: 'Zpráva odeslána! Ozveme se vám co nejdříve.',
      form_error: 'Došlo k chybě. Zkuste to prosím znovu.',
      address: 'Adresa',
      phone: 'Telefon',
      email: 'E-mail',
      hours: 'Otevírací doba',
      hours_value: 'Po–Pá: 9:00 – 17:45',
    },
    footer: {
      description: 'Polský výrobce prémiových dřevěných saun. Vyrábíme sauny s vášní od roku 2015.',
      links: 'Rychlé odkazy',
      legal: 'Právní informace',
      privacy: 'Zásady ochrany osobních údajů',
      cookies: 'Zásady používání cookies',
      terms: 'Obchodní podmínky',
      copyright: '© 2025 WM-Sauna. Všechna práva vyhrazena.',
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
