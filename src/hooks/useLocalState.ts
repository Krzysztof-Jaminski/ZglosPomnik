import { useState, useEffect, useCallback } from 'react';

/**
 * Hook do zarządzania lokalnym stanem z automatycznym zapisywaniem do localStorage
 * @param key - Klucz w localStorage
 * @param initialValue - Wartość początkowa
 * @param options - Opcje konfiguracyjne
 */
export function useLocalState<T>(
  key: string,
  initialValue: T,
  options: {
    /** Czy zapisywać do localStorage (domyślnie true) */
    persist?: boolean;
    /** Funkcja do serializacji (domyślnie JSON.stringify) */
    serialize?: (value: T) => string;
    /** Funkcja do deserializacji (domyślnie JSON.parse) */
    deserialize?: (value: string) => T;
    /** Czy wyczyścić stan przy inicjalizacji (domyślnie false) */
    clearOnInit?: boolean;
  } = {}
) {
  const {
    persist = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    clearOnInit = false
  } = options;

  // Stan z wartością z localStorage lub wartością początkową
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Sprawdź czy jesteśmy w przeglądarce
    if (typeof window === 'undefined') {
      return initialValue;
    }

    if (!persist) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      const parsed = deserialize(item);
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Funkcja do ustawiania wartości
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Użyj funkcji jeśli została przekazana
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Ustaw stan
      setStoredValue(valueToStore);
      
      // Zapisz do localStorage jeśli persist jest true
      if (persist && typeof window !== 'undefined') {
        localStorage.setItem(key, serialize(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, persist, serialize]);

  // Funkcja do czyszczenia stanu
  const clearValue = useCallback(() => {
    setStoredValue(initialValue);
    if (persist && typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }, [key, initialValue, persist]);

  // Funkcja do resetowania do wartości początkowej
  const resetValue = useCallback(() => {
    setStoredValue(initialValue);
    if (persist && typeof window !== 'undefined') {
      localStorage.setItem(key, serialize(initialValue));
    }
  }, [key, initialValue, persist, serialize]);

  // Inicjalizacja - sprawdź czy czyścić stan
  useEffect(() => {
    if (clearOnInit) {
      clearValue();
    }
  }, [clearOnInit, clearValue]);

  // Nasłuchuj zmian w localStorage z innych zakładek
  useEffect(() => {
    if (!persist || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}" from storage event:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, persist, deserialize]);

  return [storedValue, setValue, { clearValue, resetValue }] as const;
}


/**
 * Hook do zarządzania stanem wyszukiwania z automatycznym zapisywaniem
 * @param pageKey - Klucz strony (np. 'encyclopedia', 'feed')
 * @param initialValue - Wartość początkowa wyszukiwania
 */
export function useSearchState(pageKey: string, initialValue: string = '') {
  return useLocalState(`search_${pageKey}`, initialValue, {
    persist: true,
    clearOnInit: false
  });
}

/**
 * Hook do zarządzania stanem wybranego elementu z automatycznym zapisywaniem
 * @param pageKey - Klucz strony
 * @param itemKey - Klucz elementu (np. 'species', 'post')
 * @param initialValue - Wartość początkowa
 */
export function useSelectedState<T>(pageKey: string, itemKey: string, initialValue: T | null = null) {
  return useLocalState(`${pageKey}_selected_${itemKey}`, initialValue, {
    persist: true,
    clearOnInit: false
  });
}

/**
 * Hook do zarządzania stanem formularza z automatycznym zapisywaniem
 * @param formKey - Klucz formularza
 * @param initialValue - Wartość początkowa formularza
 */
export function useFormState<T extends Record<string, any>>(formKey: string, initialValue: T) {
  return useLocalState(`form_${formKey}`, initialValue, {
    persist: true,
    clearOnInit: false
  });
}

/**
 * Hook do zarządzania stanem UI z automatycznym zapisywaniem
 * @param pageKey - Klucz strony
 * @param uiKey - Klucz elementu UI (np. 'showComments', 'isExpanded')
 * @param initialValue - Wartość początkowa
 */
export function useUIState<T = boolean>(pageKey: string, uiKey: string, initialValue: T) {
  return useLocalState(`${pageKey}_ui_${uiKey}`, initialValue, {
    persist: true,
    clearOnInit: false
  });
}

/**
 * Hook do czyszczenia lokalnego stanu użytkownika
 * Czyści wszystkie dane związane z użytkownikiem z localStorage
 */
export function useClearUserState() {
  const clearUserState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Lista kluczy do wyczyszczenia
    const keysToRemove: string[] = [];
    
    // Przejdź przez wszystkie klucze w localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Usuń klucze związane z komentarzami, wyszukiwaniem, wybranymi elementami, formularzami i UI
        if (key.startsWith('comment_') || 
            key.startsWith('search_') || 
            key.startsWith('encyclopedia_selected_') ||
            key.startsWith('feed_selected_') ||
            key.startsWith('form_') ||
            key.startsWith('encyclopedia_ui_') ||
            key.startsWith('feed_ui_')) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Usuń wszystkie znalezione klucze
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleared ${keysToRemove.length} user state keys from localStorage`);
  }, []);
  
  return clearUserState;
}

/**
 * Hook do zarządzania stanem formularza z automatycznym zapisywaniem i walidacją
 * @param formKey - Klucz formularza
 * @param initialValue - Wartość początkowa formularza
 * @param validationSchema - Schemat walidacji (opcjonalny)
 */
export function useFormStateWithValidation<T extends Record<string, any>>(
  formKey: string, 
  initialValue: T,
  validationSchema?: (data: T) => { isValid: boolean; errors: Record<string, string> }
) {
  const [formData, setFormData, { clearValue: clearForm }] = useFormState(formKey, initialValue);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);
  
  // Walidacja przy zmianie danych
  useEffect(() => {
    if (validationSchema) {
      const validation = validationSchema(formData);
      setErrors(validation.errors);
      setIsValid(validation.isValid);
    } else {
      setErrors({});
      setIsValid(true);
    }
  }, [formData, validationSchema]);
  
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setFormData]);
  
  const resetForm = useCallback(() => {
    clearForm();
    setErrors({});
    setIsValid(true);
  }, [clearForm]);
  
  return {
    formData,
    setFormData,
    updateField,
    errors,
    isValid,
    resetForm,
    clearForm
  };
}


