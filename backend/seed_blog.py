"""Seed blog articles for WM Group - SEO optimized content"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta

ARTICLES = [
    {
        "slug": "sauna-beczka-do-ogrodu-jak-wybrac-ile-kosztuje",
        "title": "Sauna beczka do ogrodu — jak wybrać i ile kosztuje w 2026?",
        "meta_description": "Kompletny przewodnik po saunach beczkowych do ogrodu. Porównanie rozmiarów, materiałów, cen i kosztów eksploatacji. Dowiedz się, na co zwrócić uwagę przed zakupem.",
        "category": "sauny",
        "tags": ["sauna beczka", "sauna ogrodowa", "cena sauny"],
        "cover_image": "",
        "excerpt": "Sauna beczka to najpopularniejszy typ sauny ogrodowej w Polsce. Sprawdź, jak wybrać odpowiedni model, z jakiego drewna powinna być wykonana i ile kosztuje w 2026 roku.",
        "author": "WM Group",
        "published": True,
        "content": """## Dlaczego sauna beczka?

Sauna beczkowa (barrel sauna) to najczęściej wybierany model sauny ogrodowej w Polsce i Europie. Jej kształt nie jest przypadkowy — okrągła konstrukcja zapewnia lepszą cyrkulację ciepłego powietrza, szybsze nagrzewanie i mniejsze zużycie energii.

### Kluczowe zalety sauny beczkowej:
- **Szybkie nagrzewanie** — dzięki cylindrycznej formie powietrze krąży naturalnie, a sauna osiąga 80–90°C w 30–45 minut
- **Efektywność energetyczna** — mniejsza kubatura do nagrzania w porównaniu z sauną prostokątną
- **Estetyka** — nowoczesny design, który pasuje do każdego ogrodu
- **Mobilność** — można ją przenosić bez fundamentu

## Jak wybrać odpowiedni rozmiar?

Rozmiar sauny beczkowej zależy od liczby osób, które będą z niej korzystać jednocześnie:

| Długość | Pojemność | Pomieszczenia | Idealna dla |
|---------|-----------|---------------|-------------|
| 2,0 m   | 2–3 osoby | Łaźnia | Par i małych rodzin |
| 2,5 m   | 3–4 osoby | Łaźnia | Rodzin z dziećmi |
| 3,0 m   | 4–6 osób  | Przebieralnia + łaźnia | Rodzin i spotkań |
| 3,5 m   | 6–8 osób  | Przebieralnia + łaźnia | Większych grup |
| 4,0+ m  | 8–10 osób | Przebieralnia + łaźnia + taras | Imprez i eventów |

### Nasza rekomendacja
Dla typowej rodziny (2 dorosłych + 2 dzieci) zalecamy saunę o długości **3,0 metra** z przebieralnią. To najbardziej uniwersalny rozmiar — wystarczająco duży na komfortowe korzystanie, a jednocześnie nie zajmuje zbyt wiele miejsca w ogrodzie.

## Jakie drewno wybrać?

Wybór drewna to jedna z najważniejszych decyzji przy zakupie sauny. Oto porównanie najpopularniejszych materiałów:

### Świerk skandynawski
- Jasny, ciepły kolor
- Przyjemny zapach żywicy
- Najlepszy stosunek jakości do ceny
- Wymaga regularnej impregnacji (raz do roku)

### Termodrewno (thermowood)
- Ciemny, elegancki kolor
- Odporność na wilgoć i szkodniki
- Nie wymaga impregnacji
- Wyższa cena, ale niższe koszty utrzymania

### Modrzew syberyjski
- Naturalna odporność na wodę
- Piękna, ciepła barwa
- Duża twardość i trwałość
- Idealny do klimatu polskiego

## Ile kosztuje sauna beczka w 2026 roku?

Ceny saun beczkowych w Polsce wahają się w zależności od rozmiaru, materiału i wyposażenia:

| Model | Cena od | Cena z pełnym wyposażeniem |
|-------|---------|---------------------------|
| 2,0 m świerk | 12 000 zł | 18 000 zł |
| 2,5 m świerk | 15 000 zł | 22 000 zł |
| 3,0 m świerk | 18 000 zł | 27 000 zł |
| 3,0 m termodrewno | 23 000 zł | 32 000 zł |
| 4,0 m świerk | 25 000 zł | 38 000 zł |

*Ceny zawierają piec, drzwi ze szkła hartowanego i podstawowe wyposażenie.*

## Na co zwrócić uwagę przed zakupem?

1. **Grubość ścian** — minimum 38 mm dla saun całorocznych, 44 mm dla klimatu polskiego to ideał
2. **Rodzaj pieca** — piec na drewno daje tradycyjne doświadczenie, elektryczny jest wygodniejszy w obsłudze
3. **Jakość drewna** — sprawdź, czy drewno jest suszone komorowo (wilgotność poniżej 12%)
4. **Gwarancja** — minimum 24 miesiące na konstrukcję
5. **Montaż** — czy producent oferuje montaż w cenie?
6. **Transport** — darmowa dostawa to standard u renomowanych producentów

## Podsumowanie

Sauna beczka to doskonała inwestycja w zdrowie i komfort całej rodziny. Przy wyborze kluczowe są: odpowiedni rozmiar, jakość drewna i solidna konstrukcja. W WM-Sauna oferujemy sauny beczkowe od 2,0 do 4,5 metra, wykonane z wyselekcjonowanego drewna skandynawskiego, z 24-miesięczną gwarancją i darmową dostawą na terenie całej Polski."""
    },
    {
        "slug": "balia-drewniana-z-piecem-wewnetrzny-czy-zewnetrzny",
        "title": "Balia drewniana z piecem — wewnętrzny czy zewnętrzny? Porównanie",
        "meta_description": "Porównanie pieców do balii drewnianych: wewnętrzny vs zewnętrzny. Czas nagrzewania, koszty, zalety i wady. Dowiedz się, który typ pieca jest lepszy.",
        "category": "balie",
        "tags": ["balia drewniana", "piec do balii", "balia z piecem"],
        "cover_image": "",
        "excerpt": "Wybór pieca to kluczowa decyzja przy zakupie balii drewnianej. Porównujemy piec wewnętrzny i zewnętrzny — czas nagrzewania, wygoda, bezpieczeństwo i cena.",
        "author": "WM Group",
        "published": True,
        "content": """## Piec do balii — od czego zależy wybór?

Przy zakupie balii drewnianej jedną z najważniejszych decyzji jest wybór typu pieca. To on decyduje o komforcie użytkowania, czasie nagrzewania i bezpieczeństwie. W tym artykule porównujemy dwa główne typy: **piec wewnętrzny** (zintegrowany) i **piec zewnętrzny** (z podwójnym obiegiem wody).

## Piec wewnętrzny — kompaktowe rozwiązanie

Piec wewnętrzny montowany jest wewnątrz misy balii, za ogrodzeniem ochronnym. Woda nagrzewa się przez bezpośredni kontakt z piecem.

### Zalety pieca wewnętrznego:
- **Szybsze nagrzewanie** — bezpośredni kontakt z wodą skraca czas o 20–30%
- **Kompaktowa konstrukcja** — piec nie zajmuje dodatkowego miejsca na zewnątrz
- **Niższa cena** — prostszy montaż oznacza niższy koszt
- **Idealny dla małych ogrodów** — gdy liczy się każdy metr kwadratowy

### Wady pieca wewnętrznego:
- Zmniejsza przestrzeń kąpielową (piec zajmuje ok. 20–25% misy)
- Trudniejszy dostęp do dołożenia drewna podczas kąpieli
- Metalowa obudowa pieca wewnątrz balii wymaga ostrożności

## Piec zewnętrzny — więcej komfortu

Piec zewnętrzny montowany jest obok balii i połączony z nią systemem podwójnego obiegu wody. Zimna woda jest pobierana z dna balii, podgrzewana w piecu i wracana ciepła do balii.

### Zalety pieca zewnętrznego:
- **Pełna przestrzeń kąpielowa** — cała misa do dyspozycji
- **Łatwiejsze dokładanie drewna** — bez wychylania się nad gorącą wodą
- **Bezpieczniejszy** — brak gorących elementów wewnątrz balii
- **Podwójny obieg** — równomierniejsze nagrzewanie wody

### Wady pieca zewnętrznego:
- Wymaga dodatkowego miejsca obok balii (ok. 50–70 cm)
- Dłuższy czas nagrzewania o 20–30 minut
- Wyższa cena (różnica ok. 1000–2000 zł)

## Porównanie: piec wewnętrzny vs zewnętrzny

| Parametr | Piec wewnętrzny | Piec zewnętrzny |
|----------|----------------|-----------------|
| Czas nagrzewania (do 38°C) | 1–2 godz. | 1,5–2,5 godz. |
| Przestrzeń kąpielowa | Zmniejszona o ~20% | Pełna |
| Bezpieczeństwo | Ogrodzenie ochronne | Brak gorących elementów w balii |
| Dokładanie drewna | Utrudnione | Wygodne |
| Cena | od 5 900 zł | od 8 900 zł |
| Idealny dla | Małych ogrodów, budżet | Rodzin, komfort |

## Nasza rekomendacja

Jeśli zależy Ci na **maksymalnym komforcie i bezpieczeństwie** — wybierz piec zewnętrzny. Jest to zdecydowanie lepsze rozwiązanie dla rodzin z dziećmi.

Jeśli masz **ograniczony budżet lub mało miejsca** — piec wewnętrzny to solidne i sprawdzone rozwiązanie.

W WM-Balia oferujemy oba typy pieców. Każdy piec jest wykonany ze stali nierdzewnej o grubości 3 mm, z ochroną przed przegrzaniem i 24-miesięczną gwarancją."""
    },
    {
        "slug": "jak-przygotowac-podloze-pod-saune-ogrodowa",
        "title": "Jak przygotować podłoże pod saunę ogrodową? Krok po kroku",
        "meta_description": "Praktyczny poradnik przygotowania podłoża pod saunę ogrodową. Kostka brukowa, płyta betonowa, żwir — co wybrać? Wymiary, nośność, drenaż.",
        "category": "sauny",
        "tags": ["podłoże pod saunę", "montaż sauny", "sauna ogrodowa"],
        "cover_image": "",
        "excerpt": "Prawidłowe podłoże to fundament długiej żywotności sauny. Sprawdź, jak krok po kroku przygotować podłoże pod saunę beczkową w swoim ogrodzie.",
        "author": "WM Group",
        "published": True,
        "content": """## Dlaczego podłoże jest takie ważne?

Prawidłowe podłoże pod saunę ogrodową to nie kwestia estetyki — to kwestia bezpieczeństwa i trwałości konstrukcji. Sauna beczkowa o długości 3 metrów waży ok. 800–1200 kg (bez osób wewnątrz), więc podłoże musi być:

- **Poziome** — odchylenie max. 2 cm na całej długości
- **Stabilne** — nie może się osiadać ani przesuwać
- **Przepuszczalne** — woda z sauny musi mieć odpływ
- **Wytrzymałe** — nośność min. 500 kg/m²

## Opcje podłoża — porównanie

### 1. Kostka brukowa (najczęściej wybierana)
**Zalety:** trwała, estetyczna, łatwa w utrzymaniu
**Wady:** wymaga przygotowania podbudowy
**Koszt:** 80–150 zł/m²

Kostka brukowa to najczęściej wybierane podłoże pod sauny ogrodowe. Zapewnia stabilność, łatwy odpływ wody (przez szczeliny między kostkami) i estetyczny wygląd.

### 2. Płyta betonowa
**Zalety:** idealna równość, maksymalna stabilność
**Wady:** wymaga odpływu wody, droższe wykonanie
**Koszt:** 120–200 zł/m²

Idealna dla saun ciężkich (4+ metrów). Wymaga wykonania spadku (1–2%) dla odpływu wody.

### 3. Żwir/grys (najtańsza opcja)
**Zalety:** tania, dobry drenaż, szybka realizacja
**Wady:** może się osiadać, mniej estetyczna
**Koszt:** 30–60 zł/m²

Warstwa żwiru o grubości 15–20 cm na geowłókninie. Odpowiednia dla lżejszych saun (do 2,5 m).

### 4. Deski tarasowe / WPC
**Zalety:** elegancki wygląd, ciepłe pod stopami
**Wady:** wymaga solidnej podkonstrukcji
**Koszt:** 150–300 zł/m²

## Krok po kroku: przygotowanie podłoża

### Krok 1: Wyznacz miejsce
- Odległość od ogrodzenia: min. 1 metr
- Odległość od budynku: min. 2 metry (ze względu na komin)
- Orientacja: wejście od strony domu (wygoda)
- Podłoże: min. 50 cm większe niż sauna z każdej strony

### Krok 2: Wyrównaj teren
- Usuń warstwę humusu (15–20 cm)
- Ubij grunt zagęszczarką płytową
- Sprawdź poziom — max 2 cm odchylenia

### Krok 3: Podbudowa
- Warstwa geowłókniny
- 10–15 cm żwiru / kruszywa (frakcja 0–31,5 mm)
- Zagęszczenie zagęszczarką
- 3–5 cm podsypki piaskowej (dla kostki brukowej)

### Krok 4: Nawierzchnia
- Ułóż kostki / wylej beton / wysyp żwir
- Sprawdź poziom w wielu punktach
- Zostaw szczeliny na odpływ wody

### Krok 5: Podpory
Sauna beczkowa powinna stać na drewnianych lub metalowych podporach (kolebkach), a nie bezpośrednio na podłożu. To zapewnia cyrkulację powietrza pod sauną i chroni drewno przed wilgocią.

## Najczęstsze błędy

1. **Brak geowłókniny** — chwasty przerastają przez podłoże
2. **Za cienka warstwa żwiru** — podłoże osiada po roku
3. **Brak spadku** — woda stoi przy saunie
4. **Zbyt blisko drzew** — korzenie mogą uszkodzić podłoże
5. **Brak wentylacji od spodu** — drewno gnije szybciej

## Podsumowanie

Przygotowanie podłoża zajmuje zazwyczaj 1–2 dni i kosztuje 500–2000 zł (w zależności od wybranego materiału i wielkości sauny). To stosunkowo niewielka inwestycja w porównaniu z ceną samej sauny, ale ma ogromny wpływ na jej trwałość i komfort użytkowania."""
    },
    {
        "slug": "termodrewno-vs-swierk-skandynawski-co-lepsze-do-sauny",
        "title": "Termodrewno vs świerk skandynawski — co lepsze do sauny?",
        "meta_description": "Porównanie termodrewna i świerku skandynawskiego do budowy saun ogrodowych. Trwałość, wygląd, cena, konserwacja — który materiał wybrać?",
        "category": "sauny",
        "tags": ["termodrewno", "świerk skandynawski", "drewno do sauny"],
        "cover_image": "",
        "excerpt": "Termodrewno czy świerk skandynawski? To pytanie zadaje sobie każdy, kto planuje zakup sauny ogrodowej. Porównujemy oba materiały pod każdym kątem.",
        "author": "WM Group",
        "published": True,
        "content": """## Drewno — serce każdej sauny

Drewno to nie tylko materiał konstrukcyjny sauny — to element, który definiuje jej charakter, zapach i atmosferę. Wybór odpowiedniego gatunku wpływa na trwałość, wygląd i koszty utrzymania przez lata.

## Świerk skandynawski — klasyka gatunku

Świerk skandynawski (Picea abies) to najpopularniejsze drewno do budowy saun w Skandynawii i Europie. Rośnie w surowym klimacie Finlandii i Szwecji, co nadaje mu wyjątkowe właściwości.

### Charakterystyka:
- **Kolor:** jasny, ciepły, złocisty
- **Zapach:** delikatny, żywiczny — typowy "zapach sauny"
- **Gęstość:** 430–470 kg/m³
- **Wytrzymałość:** klasa 3–4 (umiarkowana)

### Zalety:
- Naturalny, przyjemny aromat podczas seansu
- Jasny kolor rozjaśnia wnętrze sauny
- Lekkie drewno — łatwiejszy transport
- Niższa cena — najlepszy stosunek jakości do ceny
- Tradycyjny, skandynawski charakter

### Wady:
- Wymaga corocznej impregnacji na zewnątrz
- Z czasem może szarzeć bez ochrony
- Mniejsza odporność na wilgoć niż termodrewno

## Termodrewno — nowoczesna technologia

Termodrewno (thermowood) to drewno poddane obróbce termicznej w temperaturze 180–215°C. Proces modyfikuje strukturę chemiczną drewna, drastycznie zwiększając jego odporność.

### Charakterystyka:
- **Kolor:** ciemny, brązowy, elegancki
- **Zapach:** delikatny, karmelowy (po obróbce)
- **Gęstość:** 390–420 kg/m³ (niższa po termoobróbce)
- **Wytrzymałość:** klasa 1–2 (wysoka)

### Zalety:
- Nie wymaga impregnacji — praktycznie bezobsługowe
- Wysoka odporność na wilgoć i grzyby
- Stabilność wymiarowa — minimalne odkształcenia
- Elegancki, ciemny kolor bez malowania
- Klasa trwałości 1–2 (25+ lat)

### Wady:
- Wyższa cena (o 30–50% więcej)
- Bardziej kruche — mniejsza odporność na uderzenia
- Brak typowego zapachu żywicy
- Ciemny kolor może nie pasować do każdego ogrodu

## Porównanie

| Parametr | Świerk skandynawski | Termodrewno |
|----------|-------------------|-------------|
| Cena (za saunę 3m) | od 18 000 zł | od 23 000 zł |
| Trwałość | 15–20 lat | 25–30 lat |
| Impregnacja | Co roku | Nie wymaga |
| Odporność na wilgoć | Średnia | Wysoka |
| Kolor | Jasny, złocisty | Ciemny, brązowy |
| Zapach | Żywiczny | Neutralny |
| Konserwacja roczna | ~200–400 zł | ~0 zł |
| Waga (3m sauna) | ~700 kg | ~650 kg |

## Kiedy wybrać świerk?

- Lubisz **tradycyjny, skandynawski styl**
- Zależy Ci na **niższej cenie zakupu**
- Nie przeszkadza Ci **coroczna konserwacja**
- Cenisz **naturalny zapach żywicy** w saunie

## Kiedy wybrać termodrewno?

- Wolisz **nowoczesny, elegancki wygląd**
- Nie chcesz się martwić o **konserwację**
- Planujesz korzystać z sauny przez **20+ lat**
- Ważna jest **maksymalna odporność** na warunki atmosferyczne

## Nasza rekomendacja

W WM-Sauna używamy wyłącznie **drewna klasy A+**, suszonego komorowo do wilgotności poniżej 12%. Oferujemy sauny zarówno ze świerku skandynawskiego, jak i z termodrewna. Przy długofalowym porównaniu kosztów (zakup + konserwacja przez 15 lat), termodrewno wychodzi zaledwie o 10–15% drożej — a zapewnia spokój ducha i zero konserwacji."""
    },
    {
        "slug": "balia-ogrodowa-kompletny-przewodnik-kupujacego",
        "title": "Balia ogrodowa — kompletny przewodnik kupującego 2026",
        "meta_description": "Wszystko, co musisz wiedzieć przed zakupem balii ogrodowej. Rodzaje, rozmiary, materiały, piece, ceny i porady ekspertów. Kompletny poradnik.",
        "category": "balie",
        "tags": ["balia ogrodowa", "balia drewniana", "hot tub", "przewodnik"],
        "cover_image": "",
        "excerpt": "Planujesz zakup balii ogrodowej? Ten kompletny przewodnik pomoże Ci wybrać idealny model — od rozmiaru, przez materiały, po typ pieca i akcesoria.",
        "author": "WM Group",
        "published": True,
        "content": """## Czym jest balia ogrodowa?

Balia ogrodowa (hot tub) to drewniane naczynie do kąpieli na świeżym powietrzu, podgrzewane piecem na drewno lub elektrycznie. To tradycyjne rozwiązanie znane od wieków w Skandynawii, Japonii i krajach alpejskich, które w ostatnich latach zyskało ogromną popularność w Polsce.

## Rodzaje balii ogrodowych

### Balia okrągła (klasyczna)
- Najpopularniejszy kształt
- Pojemność: 4–8 osób
- Średnica: 160–225 cm
- Idealna do ogrodów i tarasów

### Balia owalna / kwadratowa
- Więcej miejsca na osobę
- Ergonomiczne siedzenia
- Nowoczesny design
- Pojemność: 4–6 osób

### Balia japońska (Ofuro)
- Głębsza, mniejsza — dla 1–2 osób
- Tradycyjny, medytacyjny charakter
- Kompaktowa — idealna na balkony i małe tarasy
- Wymiary: ok. 120x190 cm

## Jaki rozmiar wybrać?

| Model | Osoby | Średnica/wymiary | Pojemność wody |
|-------|-------|-----------------|----------------|
| Okrągła 160 | 2–4 | Ø 160 cm | ~800 L |
| Okrągła 180 | 3–5 | Ø 180 cm | ~1100 L |
| Okrągła 200 | 4–6 | Ø 200 cm | ~1500 L |
| Okrągła 225 | 6–8 | Ø 225 cm | ~2000 L |
| Kwadratowa 220 | 4–6 | 220x220 cm | ~1800 L |
| Ofuro | 1–2 | 120x190 cm | ~900 L |

## Materiały — z czego jest balia?

### Misa (wnętrze)
- **Polipropylene (PP)** — najtrwalszy, higieniczny, łatwy w czyszczeniu
- **Akryl** — elegancki, różne kolory, odporny na UV
- **Fiberglass (włókno szklane)** — lekki, wytrzymały

### Obudowa zewnętrzna
- **Modrzew syberyjski** — naturalny, ciepły wygląd
- **Termodrewno** — bezobsługowe, eleganckie
- **Świerk skandynawski** — klasyczny, przystępny cenowo
- **Kompozyt WPC** — nowoczesny, zero konserwacji

## Piec — serce balii

### Piec na drewno (wewnętrzny)
- Cena: od 5 900 zł
- Tradycyjne doświadczenie
- Bez kosztów prądu

### Piec na drewno (zewnętrzny)
- Cena: od 8 900 zł
- Pełna przestrzeń kąpielowa
- Wygodniejsza obsługa

### Piec elektryczny
- Cena: od 12 000 zł
- Automatyczna regulacja temperatury
- Najwygodniejszy w obsłudze
- Wymaga przyłącza 380V

## Akcesoria — co warto dołożyć?

1. **Pokrywa termiczna** — utrzymuje ciepło, chroni przed liśćmi i deszczem
2. **Hydromasaż** — system dysz masujących dla głębokiego relaksu
3. **Aeromasaż** — delikatne bąbelki powietrza
4. **Oświetlenie LED** — nastrojowa atmosfera wieczorami
5. **Schody** — wygodne wchodzenie i wychodzenie
6. **Filtr wody** — przedłuża czas między wymianami wody

## Ile kosztuje balia ogrodowa?

| Typ | Cena podstawowa | Z pełnym wyposażeniem |
|-----|----------------|----------------------|
| Okrągła 160, piec wewn. | od 5 900 zł | od 12 000 zł |
| Okrągła 200, piec zewn. | od 11 000 zł | od 18 000 zł |
| Okrągła 225, piec zewn. | od 14 000 zł | od 22 000 zł |
| Kwadratowa 220, elektr. | od 18 000 zł | od 28 000 zł |

## Podłoże i instalacja

Balia wymaga płaskiego, stabilnego podłoża o nośności min. 1000 kg/m². Najlepsze opcje:
- Płyta betonowa z odpływem
- Kostka brukowa
- Taras drewniany (wzmocniony)

**Ważne:** pełna balia z wodą i osobami waży 2000–4000 kg!

## Konserwacja

- **Wymiana wody:** co 1–3 kąpiele (bez chemii) lub co 1–2 tygodnie (z uzdatnianiem)
- **Zewnętrzna obudowa:** impregnacja raz w roku (drewno naturalne)
- **Misa PP/akryl:** mycie środkiem do łazienki
- **Piec:** czyszczenie popielnika po każdym użyciu

## Podsumowanie

Balia ogrodowa to inwestycja, która zwraca się w postaci zdrowia, relaksu i radości przez wiele lat. W WM-Balia oferujemy balie w 6 rozmiarach, z 3 typami pieców i szerokim wyborem kolorów misy i drewna. Każda balia jest wykonywana ręcznie w naszej pracowni w Polsce, z 24-miesięczną gwarancją."""
    },
    {
        "slug": "sauna-ogrodowa-a-pozwolenie-na-budowe",
        "title": "Sauna ogrodowa a pozwolenie na budowę — co musisz wiedzieć?",
        "meta_description": "Czy sauna ogrodowa wymaga pozwolenia na budowę? Przepisy, zgłoszenia, odległości — kompletny poradnik prawny dla właścicieli saun w Polsce.",
        "category": "sauny",
        "tags": ["pozwolenie na budowę", "prawo budowlane", "sauna ogrodowa"],
        "cover_image": "",
        "excerpt": "Czy na saunę ogrodową trzeba pozwolenie na budowę? Jakie są wymagane odległości? Kiedy wystarczy zgłoszenie? Odpowiadamy na wszystkie pytania prawne.",
        "author": "WM Group",
        "published": True,
        "content": """## Czy na saunę ogrodową trzeba pozwolenie?

To jedno z najczęstszych pytań, które otrzymujemy od klientów. Odpowiedź brzmi: **w większości przypadków NIE** — ale diabeł tkwi w szczegółach.

## Co mówi prawo budowlane?

Zgodnie z polskim Prawem budowlanym (art. 29 ust. 1 pkt 28), **nie wymaga pozwolenia na budowę ani zgłoszenia** budowa obiektów małej architektury, takich jak:
- Altany
- Pergole
- Grille ogrodowe
- **Sauny ogrodowe wolnostojące**

### Warunek: powierzchnia zabudowy do 35 m²
Sauna ogrodowa musi mieć powierzchnię zabudowy **nieprzekraczającą 35 m²**. Typowa sauna beczkowa ma powierzchnię zabudowy 3–8 m², więc ten warunek jest zawsze spełniony.

## Kiedy jest potrzebne zgłoszenie?

Zgłoszenie może być wymagane w następujących przypadkach:

1. **Sauna z trwałym fundamentem** — jeśli planujesz betonowy fundament zamiast podkładów
2. **Sauna połączona z budynkiem** — jako dobudówka do domu
3. **Sauna na terenie objętym ochroną konserwatorską** — zabytki, strefy ochronne
4. **Instalacja kominowa** — jeśli komin przekracza określoną wysokość

## Odległości — na co uważać?

### Odległość od granicy działki
- **Brak przepisów specjalnych** dla obiektów małej architektury
- Zalecamy min. **1 metr** od ogrodzenia (ze względu na komin i dym)
- W przypadku wspólnot mieszkaniowych mogą obowiązywać regulaminy

### Odległość od budynków
- Min. **4 metry** od budynku drewnianego (ochrona pożarowa)
- Min. **2 metry** od budynku murowanego
- Min. **8 metrów** od budynku sąsiada (ze względu na komin)

### Odległość od drzew
- Min. **3 metry** od korony drzewa (ochrona przed iskrami)

## Komin — ważny element

Piec na drewno wymaga komina. Komin sauny ogrodowej:
- Powinien wystawać **min. 50 cm** ponad dach sauny
- Musi być wykonany ze **stali nierdzewnej** (dwuścienny)
- Powinien mieć **iskrochronę** na szczycie
- Nie podlega obowiązkowi przeglądów kominiarskich (obiekt nietrwały)

## A co z balią?

Balia drewniana to **element wyposażenia ogrodu**, nie obiekt budowlany. Nie wymaga:
- Pozwolenia na budowę
- Zgłoszenia
- Żadnych formalności

Jedyne, o czym warto pamiętać, to odpowiedni odpływ wody i stabilne podłoże.

## Praktyczne wskazówki

1. **Sprawdź MPZP** — Miejscowy Plan Zagospodarowania Przestrzennego może zawierać dodatkowe ograniczenia
2. **Poinformuj sąsiadów** — dym z pieca może być uciążliwy, lepiej uprzedzić
3. **Zadbaj o bezpieczeństwo pożarowe** — gaśnica w pobliżu sauny to dobra praktyka
4. **Dokumentacja** — zachowaj fakturę i kartę gwarancyjną (mogą być potrzebne do ubezpieczenia)

## Podsumowanie

W 99% przypadków sauna ogrodowa nie wymaga pozwolenia na budowę ani zgłoszenia. Wystarczy wybrać odpowiednie miejsce w ogrodzie (z zachowaniem bezpiecznych odległości) i cieszyć się relaksem. W razie wątpliwości skontaktuj się z lokalnym urzędem gminy — procedura jest szybka i bezpłatna."""
    },
]


async def seed():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['test_database']
    
    for i, article in enumerate(ARTICLES):
        article["created_at"] = (datetime.now(timezone.utc) - timedelta(days=len(ARTICLES) - i)).isoformat()
        article["updated_at"] = article["created_at"]
        
        existing = await db.blog_articles.find_one({"slug": article["slug"]})
        if existing:
            await db.blog_articles.update_one({"slug": article["slug"]}, {"$set": article})
            print(f"  Updated: {article['title'][:60]}")
        else:
            await db.blog_articles.insert_one(article)
            print(f"  Created: {article['title'][:60]}")
    
    count = await db.blog_articles.count_documents({})
    print(f"\nTotal articles: {count}")


if __name__ == "__main__":
    asyncio.run(seed())
