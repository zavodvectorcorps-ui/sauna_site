import React from 'react';
import { Helmet } from 'react-helmet-async';
import { GlobalHeader } from '../components/GlobalHeader';
import { Footer } from '../components/Footer';
import { useSettings } from '../context/SettingsContext';

const PrivacyPolicyPage = () => {
  const { siteSettings } = useSettings();
  const company = siteSettings?.company_name || '[NAZWA_FIRMY]';
  const address = siteSettings?.address || '[ADRES_FIRMY]';
  const nip = siteSettings?.nip || '[NIP]';
  const email = siteSettings?.email || '[EMAIL_KONTAKTOWY]';

  return (
    <>
      <Helmet
        title={"Polityka prywatności — " + company}
        meta={[{ name: "robots", content: "noindex, nofollow" }]}
      />
      <GlobalHeader light />
      <main className="bg-[#FAFAF8] min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2" data-testid="privacy-heading">Polityka prywatności</h1>
          <p className="text-sm text-[#8C8C8C] mb-10">Ostatnia aktualizacja: marzec 2026</p>

          <div className="prose-custom space-y-8 text-[#333] text-[15px] leading-relaxed">

            <section>
              <h2>1. Administrator danych osobowych</h2>
              <p>Administratorem Twoich danych osobowych jest <strong>{company}</strong>, z siedzibą pod adresem: {address}, NIP: {nip} (dalej: „Administrator").</p>
              <p>W sprawach związanych z ochroną danych osobowych możesz skontaktować się z nami pod adresem e-mail: <a href={`mailto:${email}`} className="text-[#C6A87C] hover:underline">{email}</a>.</p>
            </section>

            <section>
              <h2>2. Jakie dane zbieramy</h2>
              <p>Za pośrednictwem formularza kontaktowego na naszej stronie zbieramy następujące dane:</p>
              <ul>
                <li>imię i nazwisko,</li>
                <li>adres e-mail,</li>
                <li>numer telefonu,</li>
                <li>treść wiadomości.</li>
              </ul>
              <p>Ponadto, za Twoją zgodą, zbieramy dane analityczne za pośrednictwem plików cookies (szczegóły w <a href="/cookies" className="text-[#C6A87C] hover:underline">Polityce cookies</a>).</p>
            </section>

            <section>
              <h2>3. Cel przetwarzania danych</h2>
              <p>Twoje dane osobowe podane w formularzu kontaktowym przetwarzamy wyłącznie w celu:</p>
              <ul>
                <li>udzielenia odpowiedzi na przesłane zapytanie,</li>
                <li>prowadzenia dalszej korespondencji związanej z Twoim zapytaniem,</li>
                <li>przygotowania i przedstawienia oferty handlowej, jeśli zapytanie dotyczy naszych produktów lub usług.</li>
              </ul>
            </section>

            <section>
              <h2>4. Podstawa prawna przetwarzania</h2>
              <p>Przetwarzanie Twoich danych odbywa się na podstawie:</p>
              <ul>
                <li><strong>art. 6 ust. 1 lit. f RODO</strong> — prawnie uzasadniony interes Administratora polegający na odpowiadaniu na zapytania kierowane za pośrednictwem strony internetowej,</li>
                <li><strong>art. 6 ust. 1 lit. b RODO</strong> — gdy korespondencja dotyczy podjęcia działań zmierzających do zawarcia umowy (np. przygotowanie wyceny, oferty),</li>
                <li><strong>art. 6 ust. 1 lit. a RODO</strong> — w zakresie danych analitycznych (cookies), wyłącznie na podstawie Twojej dobrowolnej zgody.</li>
              </ul>
            </section>

            <section>
              <h2>5. Okres przechowywania danych</h2>
              <p>Dane podane w formularzu kontaktowym przechowujemy przez czas trwania korespondencji oraz przez okres przedawnienia ewentualnych roszczeń (co do zasady 3 lata od zakończenia korespondencji, chyba że przepisy szczególne stanowią inaczej).</p>
              <p>Dane analityczne (cookies) przechowywane są przez okres wskazany w <a href="/cookies" className="text-[#C6A87C] hover:underline">Polityce cookies</a>.</p>
            </section>

            <section>
              <h2>6. Odbiorcy danych</h2>
              <p>Twoje dane mogą być przekazywane następującym kategoriom odbiorców:</p>
              <ul>
                <li>dostawcy usług hostingowych i serwerowych,</li>
                <li>dostawcy narzędzi IT i systemów CRM wykorzystywanych do obsługi zapytań,</li>
                <li>dostawcy narzędzi analitycznych (Google Analytics) — wyłącznie za Twoją zgodą.</li>
              </ul>
              <p>Nie sprzedajemy ani nie udostępniamy Twoich danych osobom trzecim w celach marketingowych.</p>
            </section>

            <section>
              <h2>7. Przekazywanie danych poza EOG</h2>
              <p>W związku z korzystaniem z Google Analytics Twoje dane analityczne mogą być przekazywane do Stanów Zjednoczonych. Przekazanie odbywa się na podstawie standardowych klauzul umownych zatwierdzonych przez Komisję Europejską (art. 46 ust. 2 lit. c RODO), zapewniających odpowiedni poziom ochrony danych osobowych.</p>
            </section>

            <section>
              <h2>8. Twoje prawa</h2>
              <p>W związku z przetwarzaniem danych osobowych przysługują Ci następujące prawa:</p>
              <ul>
                <li><strong>prawo dostępu</strong> do swoich danych,</li>
                <li><strong>prawo do sprostowania</strong> (poprawienia) danych,</li>
                <li><strong>prawo do usunięcia</strong> danych („prawo do bycia zapomnianym"),</li>
                <li><strong>prawo do ograniczenia</strong> przetwarzania,</li>
                <li><strong>prawo do sprzeciwu</strong> wobec przetwarzania opartego na uzasadnionym interesie,</li>
                <li><strong>prawo do przenoszenia</strong> danych,</li>
                <li><strong>prawo do cofnięcia zgody</strong> w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania dokonanego przed cofnięciem),</li>
                <li><strong>prawo do wniesienia skargi</strong> do organu nadzorczego — Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-[#C6A87C] hover:underline">uodo.gov.pl</a>).</li>
              </ul>
              <p>Aby skorzystać z powyższych praw, skontaktuj się z nami: <a href={`mailto:${email}`} className="text-[#C6A87C] hover:underline">{email}</a>.</p>
            </section>

            <section>
              <h2>9. Dobrowolność podania danych</h2>
              <p>Podanie danych w formularzu kontaktowym jest dobrowolne, jednak niezbędne do udzielenia odpowiedzi na Twoje zapytanie. Niepodanie danych uniemożliwia nam kontakt zwrotny.</p>
            </section>

            <section>
              <h2>10. Bezpieczeństwo danych</h2>
              <p>Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające ochronę przetwarzanych danych osobowych, w szczególności zabezpieczamy dane przed ich udostępnieniem osobom nieupoważnionym, przetwarzaniem z naruszeniem przepisów oraz zmianą, utratą, uszkodzeniem lub zniszczeniem. Do stosowanych środków należą m.in.: szyfrowanie połączenia (SSL/TLS), regularne aktualizacje oprogramowania oraz kontrola dostępu.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
