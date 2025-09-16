import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginRequest, RegisterRequest, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  handleAuthError: (error: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          const userData = authService.getCurrentUserData();
          if (userData) {
            setUser(userData);
            console.log('User data loaded from localStorage:', userData);
          } else {
            // Fallback do podstawowych danych jeśli nie ma zapisanych danych
            setUser({
              id: 'temp',
              email: 'user@example.com',
              name: 'User',
              phone: null,
              address: null,
              city: null,
              postalCode: null,
              avatar: '',
              registrationDate: new Date().toISOString(),
              submissionsCount: 0,
              verificationsCount: 0
            });
          }
        } else {
          // No token found
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
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
            } else {
              // Ustaw podstawowe dane użytkownika na podstawie tokenu
              setUser({
                id: 'temp',
                email: 'user@example.com',
                name: 'User',
                phone: null,
                address: null,
                city: null,
                postalCode: null,
                avatar: '',
                registrationDate: new Date().toISOString(),
                submissionsCount: 0,
                verificationsCount: 0
              });
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
      const response: AuthResponse = await authService.login(credentials);
      setUser(response.user);
      
      // Verify token was saved
      const savedToken = authService.getToken();
      console.log('Token after login:', savedToken ? 'saved' : 'not saved');
      console.log('User data from login response:', response.user);
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
      const response: AuthResponse = await authService.register(userData);
      setUser(response.user);
      
      // Token is automatically saved by authService
      console.log('User data from register response:', response.user);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
