import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  handleAuthError: (error: any) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  // Funkcja do czyszczenia lokalnego stanu użytkownika
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

  // Sprawdź czy użytkownik jest już zalogowany przy inicjalizacji
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Sprawdź czy localStorage jest dostępny
        if (typeof localStorage === 'undefined') {
          console.warn('localStorage is not available');
          setIsLoading(false);
          return;
        }

        // Sprawdź czy token istnieje w localStorage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Jeśli mamy token, sprawdź czy mamy zapisane dane użytkownika
          const cachedUserData = authService.getCurrentUserData();
          if (cachedUserData) {
            setUser(cachedUserData);
            console.log('User data loaded from cache:', cachedUserData);
          } else {
            // Jeśli nie mamy zapisanych danych, nie wywołuj API automatycznie
            // Użytkownik będzie musiał się zalogować ponownie
            console.log('No cached user data found, user needs to login');
            // Wyczyść nieprawidłowy token
            localStorage.removeItem('auth_token');
            authService.logout();
          }
        } else {
          // No token found
          console.log('No auth token found');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        
        // Wyloguj tylko jeśli token jest nieprawidłowy przy inicjalizacji
        if (error instanceof Error && error.message.includes('Authentication token expired')) {
          authService.logout();
        } else {
          // Dla innych błędów (np. sieciowych), nie wylogowuj automatycznie
          console.warn('Network error during auth initialization, keeping user logged in if token exists');
          // Jeśli mamy token ale nie możemy go zweryfikować z powodu błędu sieci,
          // ustaw użytkownika jako zalogowanego na podstawie tokenu
          const token = localStorage.getItem('auth_token');
          if (token) {
            // Sprawdź czy mamy zapisane dane użytkownika
            const userData = authService.getCurrentUserData();
            if (userData) {
              setUser(userData);
              console.log('User data loaded from localStorage (error fallback):', userData);
            } else {
              // Ustaw podstawowe dane użytkownika na podstawie tokenu
              const fallbackUser = {
                id: 'temp',
                email: 'user@example.com',
                name: 'User',
                phone: null,
                address: null,
                city: null,
                postalCode: null,
                avatar: null,
                registrationDate: new Date().toISOString(),
                role: 'User',
                statistics: {
                  submissionCount: 0,
                  applicationCount: 0
                }
              };
              setUser(fallbackUser);
              console.log('Using fallback user data for token (error fallback):', fallbackUser);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      await authService.login(credentials);
      
      // Fetch user data from API
      const userData = await authService.getUserProfile();
      setUser(userData);
      
      // Verify token was saved
      const savedToken = authService.getToken();
      console.log('Token after login:', savedToken ? 'saved' : 'not saved');
      console.log('User data from API:', userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      
      // Fetch user data from API
      const userDataFromAPI = await authService.getUserProfile();
      setUser(userDataFromAPI);
      
      // Token is automatically saved by authService
      console.log('User data from API:', userDataFromAPI);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    clearUserState(); // Wyczyść lokalny stan użytkownika
  };


  const handleAuthError = (error: any) => {
    console.log('Handling auth error:', error);
    if (error instanceof Error && error.message.includes('Brak autoryzacji')) {
      console.log('401 Unauthorized detected, logging out user');
      alert('Sesja wygasła lub ktoś inny zalogował się na to konto. Zostaniesz wylogowany.');
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    handleAuthError
  };

  // If there's a critical error during initialization, show error message
  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Błąd inicjalizacji
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
