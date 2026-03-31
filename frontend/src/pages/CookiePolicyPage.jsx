import React from 'react';
import { Helmet } from 'react-helmet-async';
import { GlobalHeader } from '../components/GlobalHeader';
import { Footer } from '../components/Footer';
import { useSettings } from '../context/SettingsContext';

const CookiePolicyPage = () => {
  const { siteSettings } = useSettings();
  const company = siteSettings?.company_name || '[NAZWA_FIRMY]';
  const email = siteSettings?.email || '[EMAIL_KONTAKTOWY]';

  return (
    <>
      <Helmet
        title={"Polityka cookies — " + company}
        meta={[{ name: "robots", content: "noindex, nofollow" }]}
      />
      <GlobalHeader light />
      <main className="bg-[#FAFAF8] min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2" data-testid="cookies-heading">Polityka cookies</h1>
          <p className="text-sm text-[#8C8C8C] mb-10">Ostatnia aktualizacja: marzec 2026</p>

          <div className="prose-custom space-y-8 text-[#333] text-[15px] leading-relaxed">

            <section>
              <h2>1. Czym są pliki cookies?</h2>
              <p>Pliki cookies (ciasteczka) to niewielkie pliki tekstowe, które są zapisywane na Twoim urządzeniu (komputerze, telefonie, tablecie) podczas odwiedzania stron internetowych. Służą one do prawidłowego działania serwisu, zapamiętywania Twoich preferencji oraz — za Twoją zgodą — do celów analitycznych.</p>
            </section>

            <section>
              <h2>2. Rodzaje plików cookies</h2>
              <p>Na naszej stronie wykorzystujemy następujące rodzaje plików cookies:</p>

              <h3>a) Cookies niezbędne (techniczne)</h3>
              <p>Są to pliki niezbędne do prawidłowego działania strony internetowej. Obejmują np. zapamiętanie Twojej zgody dotyczącej cookies oraz preferencji językowych. Te cookies nie zbierają danych pozwalających na Twoją identyfikację w celach marketingowych.</p>
              <p><strong>Podstawa prawna:</strong> art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes Administratora polegający na zapewnieniu prawidłowego funkcjonowania serwisu.</p>

              <h3>b) Cookies analityczne (Google Analytics)</h3>
              <p>Te pliki cookies pozwalają nam zbierać anonimowe dane statystyczne dotyczące sposobu korzystania z naszej strony, takie jak:</p>
              <ul>
                <li>liczba odwiedzin poszczególnych podstron,</li>
                <li>czas spędzony na stronie,</li>
                <li>źródło, z którego trafiono na stronę (np. wyszukiwarka, reklama),</li>
                <li>przybliżona lokalizacja geograficzna (na poziomie miasta),</li>
                <li>typ urządzenia i przeglądarki.</li>
              </ul>
              <p>Dane te wykorzystujemy wyłącznie w celu doskonalenia naszej strony internetowej i lepszego dostosowania jej do potrzeb użytkowników.</p>
              <p><strong>Podstawa prawna:</strong> art. 6 ust. 1 lit. a RODO — Twoja dobrowolna zgoda wyrażona poprzez baner cookies. Cookies analityczne są ładowane <strong>wyłącznie po wyrażeniu zgody</strong>.</p>
            </section>

            <section>
              <h2>3. Google Analytics</h2>
              <p>Korzystamy z usługi Google Analytics dostarczanej przez Google LLC. W ramach tej usługi:</p>
              <ul>
                <li>zbierane są anonimowe dane statystyczne o ruchu na stronie,</li>
                <li>dane mogą być przekazywane do serwerów Google w Stanach Zjednoczonych,</li>
                <li>przekazanie danych odbywa się na podstawie standardowych klauzul umownych (art. 46 ust. 2 lit. c RODO),</li>
                <li>korzystamy z funkcji anonimizacji adresów IP.</li>
              </ul>
              <p>Google Analytics jest aktywowany <strong>wyłącznie po wyrażeniu przez Ciebie zgody</strong> poprzez baner cookies wyświetlany przy pierwszej wizycie na stronie. Możesz wycofać swoją zgodę w dowolnym momencie — szczegóły poniżej.</p>
            </section>

            <section>
              <h2>4. Zarządzanie plikami cookies</h2>
              <p>Masz pełną kontrolę nad plikami cookies. Możesz zarządzać nimi na dwa sposoby:</p>
              <h3>a) Baner cookies na stronie</h3>
              <p>Przy pierwszej wizycie wyświetlany jest baner umożliwiający wyrażenie lub odmowę zgody na cookies analityczne. Swoją decyzję możesz zmienić w dowolnym momencie, klikając link „Ustawienia cookies" w stopce strony.</p>
              <h3>b) Ustawienia przeglądarki</h3>
              <p>Możesz również zarządzać plikami cookies w ustawieniach swojej przeglądarki internetowej — blokować wszystkie lub wybrane cookies, a także usuwać wcześniej zapisane pliki. Instrukcje znajdziesz w dokumentacji Twojej przeglądarki.</p>
            </section>

            <section>
              <h2>5. Wpływ ograniczenia cookies</h2>
              <p>Ograniczenie lub wyłączenie plików cookies niezbędnych może wpłynąć na prawidłowe działanie niektórych funkcji serwisu (np. zapamiętywanie preferencji językowych). Wyłączenie cookies analitycznych nie wpływa na działanie strony — oznacza jedynie, że nie będziemy mogli zbierać anonimowych danych statystycznych.</p>
            </section>

            <section>
              <h2>6. Zmiany polityki cookies</h2>
              <p>Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce cookies. O wszelkich istotnych zmianach poinformujemy za pośrednictwem komunikatu na stronie internetowej. Zalecamy okresowe sprawdzanie tej strony w celu zapoznania się z aktualną wersją polityki.</p>
            </section>

            <section>
              <h2>7. Kontakt</h2>
              <p>W przypadku pytań dotyczących plików cookies prosimy o kontakt: <a href={`mailto:${email}`} className="text-[#C6A87C] hover:underline">{email}</a>.</p>
              <p>Więcej informacji o przetwarzaniu danych osobowych znajdziesz w naszej <a href="/privacy" className="text-[#C6A87C] hover:underline">Polityce prywatności</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CookiePolicyPage;
