const API_BASE_URL = 'https://localhost:7274/api';

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
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
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
    const token = data.token || data.accessToken || data.access_token || data.jwt || data.authToken;
    
    if (token) {
      this.token = token;
      localStorage.setItem('auth_token', token);
    }

    return data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
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
    const token = data.token || data.accessToken || data.access_token || data.jwt || data.authToken;
    
    if (token) {
      this.token = token;
      localStorage.setItem('auth_token', token);
    }

    return data;
  }

  logout(): void {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') {
      return !!this.token;
    }
    
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && !this.token) {
      this.token = storedToken;
    }
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      if (typeof localStorage === 'undefined') {
        throw new Error('No authentication token');
      }
      
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        this.token = storedToken;
      } else {
        throw new Error('No authentication token');
      }
    }

    const response = await fetch(`${API_BASE_URL}/Auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          id: 'temp',
          email: 'user@example.com',
          name: 'User',
          avatar: '',
          registrationDate: new Date().toISOString(),
          submissionsCount: 0,
          verificationsCount: 0
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async validateToken(): Promise<boolean> {
    return !!this.token;
  }

  async refreshToken(): Promise<string> {
    if (!this.token) {
      throw new Error('No authentication token to refresh');
    }
    
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available, cannot refresh token');
    }

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
  }
}

// Eksportuj singleton instance
export const authService = new AuthService();
