# ZgłośPomnik

Aplikacja mobilno-webowa do zgłaszania, katalogowania i przeglądania pomnikowych i zabytkowych drzew w Polsce.

## O Projekcie

**ZgłośPomnik** to platforma umożliwiająca:
- Mapowanie lokalizacji pomnikowych drzew
- Zgłaszanie nowych drzew z dokumentacją fotograficzną
- Przeglądanie encyklopedii gatunków drzew
- Społecznościowe dzielenie się odkryciami natury
- Zarządzanie zgłoszeniami
- Tworzenie spersonalizowanych wniosków

Aplikacja została stworzona z myślą o ochronie dziedzictwa przyrodniczego i zwiększeniu świadomości ekologicznej społeczeństwa.

## Główne Funkcjonalności

### Mapa Interaktywna
- Wyświetlanie wszystkich zatwierdzonych drzew na mapie Google Maps
- Filtrowanie według gatunku, regionu i statusu
- Szczegółowe informacje o każdym drzewie (obwód, wysokość, wiek, stan)
- Geolokalizacja użytkownika oraz zgłaszanie nowych drzew

### Zgłaszanie Drzew
- Formularz zgłoszeniowy z walidacją
- Możliwość dodania do 5 zdjęć (aparat lub galeria)
- Automatyczne pobieranie lokalizacji GPS
- Szczegółowe dane: gatunek, wymiary, opis, legendy

### Encyklopedia Gatunków
- Baza wiedzy o polskich gatunkach drzew
- Nazwy polskie i łacińskie
- Przewodnik identyfikacyjny
- Opis zmian sezonowych

### Aktualności (Feed)
- Chronologiczny strumień zatwierdzonych zgłoszeń
- System głosowania
- Przeglądanie opisów legend i zgłoszeń innych użytkowników
- Filtry i wyszukiwarka

### Profil Użytkownika
- Historia zgłoszeń
- Personalizacja danych
- Tryb jasny/ciemny
- Status zgłoszeń

### Generator zgłoszeń
- Automatyczne dostosowywanie wniosku do formularza gmin
- Automatyczne wypenianie pól użytkownika
- Wsparcie AI w szybkim wypełnieniu
- Automatyczne generowanie załączników do wniosków
- Instrukacja wysyłki przez epulap

### Panel Administracyjny
- Zarządzanie zgłoszeniami użytkowników
- Moderacja treści
- Statystyki platformy
- Zarządzanie gatunkami w encyklopedii

## Technologie

### Frontend
- **React 18.3** - biblioteka UI
- **TypeScript 5.5** - typowanie statyczne
- **Vite 5.4** - szybki build tool
- **React Router 7** - routing
- **Tailwind CSS 3.4** - stylowanie utility-first
- **Framer Motion** - animacje
- **Lucide React** - ikony
- **Google Maps API** - mapy interaktywne

### Mobile
- **Capacitor 7.4** - native wrapper dla iOS i Android
- **Camera Plugin** - dostęp do aparatu
- **Haptics** - wibracje haptyczne
- **Status Bar** - personalizacja paska statusu

### Narzędzia
- **ESLint** - linting kodu
- **PostCSS & Autoprefixer** - przetwarzanie CSS
- **Cordova Resources** - generowanie ikon i splash screenów

## Instalacja

### Wymagania
- **Node.js** w wersji 18.x lub wyższej
- **npm** lub **yarn**
- **Android Studio** (dla buildu Android)
- **Xcode** (dla buildu iOS, tylko macOS)

### Kroki instalacji

1. **Sklonuj repozytorium:**
```bash
git clone https://github.com/twoje-repo/zglospomnik.git
cd zglospomnik
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Skonfiguruj zmienne środowiskowe:**

Utwórz plik `.env` w głównym katalogu projektu:
```env
VITE_API_BASE_URL=twoje-api
```

**Uwaga:** Aplikacja używa teraz darmowej mapy OpenStreetMap zamiast Google Maps, więc nie potrzebujesz klucza API dla map.

4. **Uruchom aplikację w trybie deweloperskim:**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

## Build i Deployment

### Build dla Web
```bash
npm run build
```

Zbudowane pliki znajdą się w katalogu `dist/`.

### Preview buildu
```bash
npm run preview
```

### Build dla Android

1. **Przygotuj build webowy:**
```bash
npm run build
```

2. **Zsynchronizuj z Capacitor:**
```bash
npx cap sync android
```

3. **Otwórz w Android Studio:**
```bash
npx cap open android
```

4. **Zbuduj APK/AAB w Android Studio** lub przez CLI:
```bash
cd android
./gradlew assembleRelease
```

### Build dla iOS

1. **Przygotuj build webowy:**
```bash
npm run build
```

2. **Zsynchronizuj z Capacitor:**
```bash
npx cap sync ios
```

3. **Otwórz w Xcode:**
```bash
npx cap open ios
```

4. **Zbuduj aplikację w Xcode** (Product → Archive)

### Generowanie ikon i splash screenów
```bash
npm run resources
```

Wymaga plików źródłowych w `resources/icon.png` i `resources/splash.png`.

## Struktura Projektu

```
ZglosPomnik/
├── src/
│   ├── components/          # Komponenty React
│   │   ├── Admin/          # Panel administracyjny
│   │   ├── Applications/   # Zarządzanie zgłoszeniami
│   │   ├── Auth/           # Autoryzacja i logowanie
│   │   ├── Encyclopedia/   # Encyklopedia gatunków
│   │   ├── Feed/           # Aktualności
│   │   ├── Landing/        # Strona powitalna
│   │   ├── Layout/         # Nawigacja i layout
│   │   ├── Map/            # Komponenty mapy
│   │   ├── TreeReport/     # Formularze zgłoszeń
│   │   └── UI/             # Komponenty wielokrotnego użytku
│   ├── context/            # React Context (Auth, Theme, Modal)
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Główne strony aplikacji
│   ├── services/           # API i logika biznesowa
│   ├── types/              # Typy TypeScript
│   ├── utils/              # Funkcje pomocnicze
│   ├── App.tsx             # Główny komponent aplikacji
│   └── main.tsx            # Entry point
├── public/                 # Zasoby statyczne
├── android/                # Projekt Android (Capacitor)
├── ios/                    # Projekt iOS (Capacitor)
├── dist/                   # Build produkcyjny
└── capacitor.config.ts     # Konfiguracja Capacitor
```

## Skrypty NPM

- `npm run dev` - uruchom serwer deweloperski
- `npm run build` - zbuduj wersję produkcyjną
- `npm run preview` - podgląd wersji produkcyjnej
- `npm run lint` - sprawdź kod za pomocą ESLint
- `npm run resources` - wygeneruj ikony i splash screeny dla Android

## Funkcje UX/UI

- Responsywny design (mobile-first)
- Tryb jasny i ciemny z synchronizacją systemową
- Natywne wibracje haptyczne
- Adaptacja do klawiatury mobilnej
- Offline detection i obsługa błędów
- Dostępność (ARIA labels, semantyczny HTML)
- Płynne animacje i przejścia (Framer Motion)

## Autoryzacja

Aplikacja używa systemu JWT (JSON Web Tokens):
- Access Token (krótkotrwały) - do autoryzacji requestów
- Refresh Token (długotrwały) - do odnawiania sesji
- Automatyczne odświeżanie tokenów
- Bezpieczne przechowywanie w localStorage

## API Backend

Backend dostępny pod adresem: `https://drzewaapi.thankfulmoss-a87bb02c.polandcentral.azurecontainerapps.io/api`

Główne endpointy:
- `GET /trees` - lista wszystkich drzew
- `POST /trees` - zgłoś nowe drzewo
- `GET /species` - encyklopedia gatunków
- `POST /auth/login` - logowanie
- `POST /auth/register` - rejestracja
- `GET /applications` - zgłoszenia użytkownika
- `POST /admin/*` - operacje administracyjne

## Licencja

Ten projekt jest objęty licencją określoną w pliku [LICENSE](LICENSE).

## Kontakt

W przypadku pytań lub problemów, prosimy o otwarcie issue na GitHubie.

---

**Dziękujemy za zainteresowanie projektem ZgłośPomnik! Razem możemy chronić nasze drzewa!**
