# System Zarządzania Lokalnym Stanem

Ten system zapewnia automatyczne zapisywanie i przywracanie lokalnego stanu użytkownika w localStorage, co pozwala na zachowanie danych przy przechodzeniu między zakładkami lub odświeżaniu strony.

## Główne Hooki

### `useLocalState<T>(key, initialValue, options)`
Podstawowy hook do zarządzania stanem z localStorage.

```typescript
const [value, setValue, { clearValue, resetValue }] = useLocalState('myKey', 'initialValue');
```


### `useSearchState(pageKey, initialValue)`
Hook dla zapisywania stanu wyszukiwania na różnych stronach.

```typescript
const [searchQuery, setSearchQuery] = useSearchState('encyclopedia', '');
```

### `useSelectedState<T>(pageKey, itemKey, initialValue)`
Hook dla zapisywania wybranych elementów (np. gatunków, postów).

```typescript
const [selectedSpecies, setSelectedSpecies] = useSelectedState('encyclopedia', 'species', null);
```

### `useUIState<T>(pageKey, uiKey, initialValue)`
Hook dla zapisywania stanu UI (np. czy komentarze są otwarte, indeks obrazka).

```typescript
const [showComments, setShowComments] = useUIState('feed', 'showComments_post123', false);
const [imageIndex, setImageIndex] = useUIState('encyclopedia', 'selectedImageIndex', 0);
```

### `useFormState<T>(formKey, initialValue)`
Hook dla zapisywania stanu formularzy.

```typescript
const [formData, setFormData] = useFormState('contactForm', { name: '', email: '' });
```

### `useFormStateWithValidation<T>(formKey, initialValue, validationSchema)`
Hook dla formularzy z walidacją.

```typescript
const { formData, updateField, errors, isValid, resetForm } = useFormStateWithValidation(
  'contactForm',
  { name: '', email: '' },
  (data) => ({
    isValid: data.name.length > 0 && data.email.includes('@'),
    errors: {
      name: data.name.length === 0 ? 'Nazwa jest wymagana' : '',
      email: !data.email.includes('@') ? 'Nieprawidłowy email' : ''
    }
  })
);
```

### `useClearUserState()`
Hook do czyszczenia całego lokalnego stanu użytkownika (używany przy wylogowaniu).

```typescript
const clearUserState = useClearUserState();
// Wywołaj clearUserState() przy wylogowaniu
```

## Zaimplementowane Funkcjonalności

### ✅ Komentarze (TreePost)
- Stan komentarza jest zapisywany dla każdego posta osobno
- Po wysłaniu komentarza stan jest automatycznie czyszczony
- Stan jest przywracany przy powrocie do posta

### ✅ Wyszukiwanie (EncyclopediaPage, FeedPage)
- Zapytania wyszukiwania są zapisywane i przywracane
- Różne strony mają osobne stany wyszukiwania

### ✅ Wybrane elementy (EncyclopediaPage)
- Wybrany gatunek jest zapisywany i przywracany
- Indeks wybranego obrazka jest zapisywany
- Stan przeglądarki obrazków jest zapisywany

### ✅ Sortowanie (FeedPage)
- Preferencje sortowania są zapisywane i przywracane

### ✅ Stan UI
- Czy komentarze są otwarte dla każdego posta
- Różne stany interfejsu użytkownika

## Automatyczne Czyszczenie

System automatycznie czyści lokalny stan użytkownika przy:
- Wylogowaniu z aplikacji
- Błędach autoryzacji

## Struktura Kluczy w localStorage

```
search_{pageKey} - wyszukiwanie na konkretnej stronie
{pageKey}_selected_{itemKey} - wybrane elementy
{pageKey}_ui_{uiKey} - stany UI
form_{formKey} - dane formularzy
```

## Przykłady Użycia


### Zapisywanie wyszukiwania
```typescript
const [searchQuery, setSearchQuery] = useSearchState('encyclopedia');

// Użytkownik wpisuje "dąb"
setSearchQuery('dąb');

// Przechodzi na inną stronę i wraca - wyszukiwanie "dąb" jest przywrócone
```

### Zapisywanie wybranego gatunku
```typescript
const [selectedSpecies, setSelectedSpecies] = useSelectedState('encyclopedia', 'species');

// Użytkownik wybiera gatunek
setSelectedSpecies(speciesData);

// Przechodzi na inną stronę i wraca - wybrany gatunek jest przywrócony
```

## Korzyści

1. **Lepsze UX** - użytkownik nie traci wprowadzonych danych
2. **Automatyczne** - nie wymaga ręcznego zarządzania localStorage
3. **Bezpieczne** - automatyczne czyszczenie przy wylogowaniu
4. **Elastyczne** - łatwe do rozszerzania o nowe funkcjonalności
5. **Wydajne** - minimalne obciążenie localStorage

