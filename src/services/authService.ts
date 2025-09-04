// Serwis autoryzacji do komunikacji z prawdziwym API
const API_BASE_URL = '/api';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    registrationDate: string;
    submissionsCount: number;
    verificationsCount: number;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  registrationDate: string;
  submissionsCount: number;
  verificationsCount: number;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Sprawdź czy token jest zapisany w localStorage
    this.token = localStorage.getItem('auth_token');
  }

  // Rejestracja użytkownika
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Zapisz token w localStorage
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logowanie użytkownika
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Zapisz token w localStorage
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Wylogowanie użytkownika
  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Sprawdź czy użytkownik jest zalogowany
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Pobierz token
  getToken(): string | null {
    return this.token;
  }

  // Pobierz dane aktualnego użytkownika
  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token wygasł - nie wylogowuj automatycznie, tylko rzuć błąd
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Odśwież token (jeśli API to obsługuje)
  async refreshToken(): Promise<string> {
    if (!this.token) {
      throw new Error('No authentication token to refresh');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        this.logout();
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }
}

// Eksportuj singleton instance
export const authService = new AuthService();
