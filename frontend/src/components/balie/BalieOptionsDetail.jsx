import { useState } from 'react';
import { Waves, Wind, Lightbulb, ThermometerSun, ShieldCheck, Filter, Headphones, Droplets, Armchair, GlassWater, CircleDot, Zap, ChevronDown, ChevronUp, Info } from 'lucide-react';

const optionsData = [
  {
    id: 'hydromassage',
    icon: Waves,
    title: 'System Hydromasażu',
    shortDesc: 'Wysokociśnieniowy masaż wodny przez dysze',
    details: {
      description: 'System hydromasażu wykorzystuje pompę o mocy 1,1 kW do rozpylania wody pod wysokim ciśnieniem przez specjalne dysze, zapewniając głęboki masaż ciała.',
      benefits: [
        'Tymczasowa ulga w bólach i dolegliwościach',
        'Łagodzenie napięcia mięśniowego',
        'Poprawa krążenia krwi',
        'Redukcja stresu i poprawa samopoczucia',
      ],
      specs: [
        { label: 'Moc pompy', value: '1,1 kW' },
        { label: 'Standardowe dysze', value: '6-8 lub 10 szt.' },
        { label: 'Mini dysze (strefa osobista)', value: '20-24 szt.' },
      ],
    },
  },
  {
    id: 'airbubble',
    icon: Wind,
    title: 'System Aeromasażu',
    shortDesc: 'Delikatny masaż bąbelkami powietrza',
    details: {
      description: 'System aeromasażu wykorzystuje pompę 0,6 kW do tworzenia podwodnego masażu bąbelkami powietrza. Efekt jest łagodniejszy niż hydromasaż i działa na całą powierzchnię ciała.',
      benefits: [
        'Uczucie unoszenia się i lekkości',
        'Delikatny masaż całego ciała',
        'Doskonałe odprężenie i relaksacja',
        'Stymulacja krążenia',
      ],
      specs: [
        { label: 'Moc pompy', value: '0,6 kW' },
        { label: 'Dysze', value: '12-18 szt.' },
      ],
    },
  },
  {
    id: 'led',
    icon: Lightbulb,
    title: 'Oświetlenie LED RGB',
    shortDesc: '7 kolorów, tryb automatycznej zmiany',
    details: {
      description: 'Wodoodporna lampa LED wykonana z wysokiej jakości stali nierdzewnej. Umożliwia wybór jednego stałego koloru lub automatyczną zmianę między 7 kolorami.',
      benefits: [
        'Nastrojowa atmosfera wieczornych kąpieli',
        'Terapia kolorami (chromoterapia)',
        'Wodoodporna konstrukcja ze stali nierdzewnej',
        'Opcjonalne: mini LED wewnątrz i na zewnątrz, taśma LED na krawędzi',
      ],
      specs: [
        { label: 'Moc', value: '12W' },
        { label: 'Napięcie', value: 'DC/AC 12V' },
        { label: 'Dostępne kolory', value: 'biały, żółty, różowy, czerwony, zielony, turkusowy, niebieski' },
      ],
    },
  },
  {
    id: 'cover',
    icon: ThermometerSun,
    title: 'Pokrywa Termiczna SPA',
    shortDesc: 'Utrzymuje ciepło, chroni przed zanieczyszczeniami',
    details: {
      description: 'Najważniejszy element utrzymujący czystość wody i redukujący koszty ogrzewania. Pokrywa posiada wewnętrzną uszczelkę parową oraz zewnętrzną powłokę odporną na promieniowanie UV klasy morskiej.',
      benefits: [
        'Utrzymuje temperaturę wody',
        'Chroni przed liśćmi, kurzem i deszczem',
        'Znacząco obniża koszty ogrzewania',
        'Nachylona powierzchnia odprowadza wodę deszczową',
      ],
      specs: [
        { label: 'Uszczelka', value: 'Wewnętrzna bariera parowa' },
        { label: 'Materiał zewnętrzny', value: 'UV-odporny klasy morskiej' },
        { label: 'Powierzchnia', value: 'Nachylona (odprowadzanie wody)' },
      ],
    },
  },
  {
    id: 'filtration',
    icon: Filter,
    title: 'System Filtracji Piaskowej',
    shortDesc: 'Efektywne oczyszczanie wody',
    details: {
      description: 'Zaawansowany system filtracji zaprojektowany do efektywnego czyszczenia wody i niezawodnej codziennej pracy. Można stosować piasek kwarcowy lub specjalne kulki filtracyjne.',
      benefits: [
        'Czysta i higieniczna woda na co dzień',
        'Wielofunkcyjny: filtracja, cyrkulacja, płukanie wsteczne, spust',
        'Kulki filtracyjne: lekkie, wielokrotnego użytku, dłuższa żywotność',
        'Łatwa konserwacja i obsługa',
      ],
      specs: [
        { label: 'Media filtracyjne', value: 'Piasek kwarcowy (0,45-0,85 mm) lub kulki filtracyjne' },
        { label: 'Tryby pracy', value: 'Filtracja, cyrkulacja, płukanie, spust, zamknięty' },
      ],
    },
  },
  {
    id: 'heater',
    icon: Zap,
    title: 'Grzałka Elektryczna',
    shortDesc: 'Do podtrzymywania temperatury wody',
    details: {
      description: 'Elektryczny podgrzewacz wody jako uzupełnienie pieca na drewno. Pozwala na utrzymanie stałej temperatury wody bez konieczności dokładania drewna.',
      benefits: [
        'Automatyczne podtrzymywanie temperatury',
        'Wygoda użytkowania',
        'Idealne jako uzupełnienie pieca na drewno',
        'Dostępne w dwóch mocach',
      ],
      specs: [
        { label: 'Dostępne moce', value: '3 kW lub 6 kW' },
      ],
    },
  },
  {
    id: 'pillows',
    icon: Armchair,
    title: 'Poduszki Zagłówkowe',
    shortDesc: 'Komfortowe oparcie dla głowy',
    details: {
      description: 'Miękkie poduszki zagłówkowe umożliwiają wygodne odchylenie się i głębsze zanurzenie w wodzie. Idealne do długich, relaksujących sesji.',
      benefits: [
        'Wsparcie dla szyi i głowy',
        'Głębsze zanurzenie w wodzie',
        'Większy komfort podczas dłuższych kąpieli',
      ],
    },
  },
  {
    id: 'drinks',
    icon: GlassWater,
    title: 'Uchwyty na Napoje',
    shortDesc: 'Z drewna lub kompozytu, opcjonalnie z LED',
    details: {
      description: 'Praktyczne uchwyty na napoje wykonane z drewna świerkowego, termicznego, WPC lub kanadyjskiego czerwonego cedru. Dostępne w wersji z podświetleniem LED.',
      benefits: [
        'Praktyczne miejsce na napoje',
        'Wykonane z tego samego drewna co obudowa',
        'Opcjonalne podświetlenie LED',
      ],
    },
  },
  {
    id: 'insulation',
    icon: ShieldCheck,
    title: 'Izolacja Termiczna',
    shortDesc: 'Ogranicza straty ciepła, szybsze nagrzewanie',
    details: {
      description: 'Dodatkowa warstwa izolacji termicznej znacząco ogranicza straty ciepła, przyspiesza nagrzewanie wody i obniża koszty eksploatacji, szczególnie w sezonie zimowym.',
      benefits: [
        'Szybsze nagrzewanie wody',
        'Niższe koszty ogrzewania',
        'Dłuższe utrzymywanie temperatury',
        'Zalecana przy użytkowaniu zimowym',
      ],
    },
  },
  {
    id: 'bluetooth',
    icon: Headphones,
    title: 'Radio Bluetooth',
    shortDesc: 'Bezprzewodowe odtwarzanie muzyki',
    details: {
      description: 'Wbudowany system audio Bluetooth pozwala na bezprzewodowe odtwarzanie ulubionej muzyki bezpośrednio z telefonu lub tabletu podczas relaksu w balii.',
      benefits: [
        'Bezprzewodowe połączenie z telefonem',
        'Wodoodporna konstrukcja',
        'Jeszcze lepszy relaks przy ulubionej muzyce',
      ],
    },
  },
];

export const BalieOptionsDetail = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <section id="opcje" className="py-20 bg-[#0F1218]" data-testid="balie-options-detail">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-3">
            <Info size={16} />
            Wyposażenie
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Opcje i <span className="text-[#D4AF37]">Akcesoria</span>
          </h2>
          <p className="text-white/40 text-sm max-w-2xl mx-auto">
            Dopasuj swoją balię do własnych potrzeb. Każda opcja jest dostępna jako dodatek do konfiguracji — sprawdź szczegóły i korzyści.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optionsData.map((opt) => {
            const isExpanded = expandedId === opt.id;
            return (
              <div
                key={opt.id}
                className={`bg-[#1A1E27] border transition-all ${isExpanded ? 'border-[#D4AF37]/40' : 'border-white/5 hover:border-white/10'}`}
                data-testid={`balie-option-${opt.id}`}
              >
                <button
                  onClick={() => toggle(opt.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                  data-testid={`balie-option-toggle-${opt.id}`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors ${isExpanded ? 'bg-[#D4AF37]' : 'bg-[#D4AF37]/10'}`}>
                    <opt.icon size={20} className={isExpanded ? 'text-[#0F1218]' : 'text-[#D4AF37]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm">{opt.title}</h3>
                    <p className="text-white/30 text-xs mt-0.5">{opt.shortDesc}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-[#D4AF37] flex-shrink-0" /> : <ChevronDown size={18} className="text-white/30 flex-shrink-0" />}
                </button>

                {isExpanded && opt.details && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    <p className="text-white/50 text-sm leading-relaxed">{opt.details.description}</p>

                    {opt.details.benefits && (
                      <div>
                        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Korzyści</h4>
                        <ul className="space-y-1.5">
                          {opt.details.benefits.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/40">
                              <CircleDot size={8} className="text-[#D4AF37] mt-1.5 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {opt.details.specs && (
                      <div className="bg-[#0F1218] border border-white/5 p-3">
                        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Dane techniczne</h4>
                        <div className="space-y-1">
                          {opt.details.specs.map((s, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-white/30">{s.label}</span>
                              <span className="text-white/70 font-medium">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
