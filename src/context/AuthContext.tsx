import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginRequest, RegisterRequest, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
        console.log('Initializing auth with token:', token ? 'exists' : 'not found');
        
        if (token) {
          // Jeśli mamy token, ustaw podstawowe dane użytkownika bez wywoływania API
          console.log('Token found, setting user as authenticated');
          setUser({
            id: 'temp',
            email: 'user@example.com',
            name: 'User',
            avatar: '',
            registrationDate: new Date().toISOString(),
            submissionsCount: 0,
            verificationsCount: 0
          });
        } else {
          console.log('No token found, user not authenticated');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Wyloguj tylko jeśli token jest nieprawidłowy przy inicjalizacji
        if (error instanceof Error && error.message.includes('Authentication token expired')) {
          console.log('Token expired, logging out');
          authService.logout();
        } else {
          // Dla innych błędów (np. sieciowych), nie wylogowuj automatycznie
          console.warn('Network error during auth initialization, keeping user logged in if token exists');
          // Jeśli mamy token ale nie możemy go zweryfikować z powodu błędu sieci,
          // ustaw użytkownika jako zalogowanego na podstawie tokenu
          const token = localStorage.getItem('auth_token');
          if (token) {
            console.log('Network error but token exists, setting user as authenticated');
            // Ustaw podstawowe dane użytkownika na podstawie tokenu
            setUser({
              id: 'temp',
              email: 'user@example.com',
              name: 'User',
              avatar: '',
              registrationDate: new Date().toISOString(),
              submissionsCount: 0,
              verificationsCount: 0
            });
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
      console.log('Starting login process...');
      const response: AuthResponse = await authService.login(credentials);
      console.log('Login successful, setting user:', response.user);
      setUser(response.user);
      
      // Sprawdź czy token został zapisany
      const savedToken = localStorage.getItem('auth_token');
      console.log('Token saved in localStorage:', savedToken ? 'YES' : 'NO');
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
      console.log('Starting registration process...');
      const response: AuthResponse = await authService.register(userData);
      console.log('Registration successful, setting user:', response.user);
      setUser(response.user);
      
      // Sprawdź czy token został zapisany
      const savedToken = localStorage.getItem('auth_token');
      console.log('Token saved in localStorage:', savedToken ? 'YES' : 'NO');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    // Nie wywołuj getCurrentUser - po prostu sprawdź czy użytkownik jest zalogowany
    if (authService.isAuthenticated()) {
      console.log('User is authenticated, no need to refresh data');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
