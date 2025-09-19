const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  user: User;
  token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  avatar: string;
  registrationDate: string;
  submissionsCount?: number;
  verificationsCount?: number;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      this.user = this.getStoredUser();
    }
  }

  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('user_data');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  private saveUser(user: User): void {
    this.user = user;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  private clearUser(): void {
    this.user = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user_data');
    }
  }

  getCurrentUserData(): User | null {
    return this.user;
  }

  saveUserData(user: User): void {
    this.saveUser(user);
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

    // Save user data
    if (data.user) {
      this.saveUser(data.user);
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
    console.log('Login response data:', data);
    const token = data.token || data.accessToken || data.access_token || data.jwt || data.authToken;
    console.log('Extracted token:', token ? 'found' : 'not found');
    
    if (token) {
      this.token = token;
      localStorage.setItem('auth_token', token);
      console.log('Token saved to localStorage');
    } else {
      console.error('No token found in login response');
    }

    // Save user data
    if (data.user) {
      this.saveUser(data.user);
      console.log('User data saved to localStorage:', data.user);
    }

    return data;
  }

  logout(): void {
    this.token = null;
    this.clearUser();
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
    // Always get the latest token from localStorage to ensure synchronization
    if (typeof localStorage !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken !== this.token) {
        this.token = storedToken;
      }
      return storedToken;
    }
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
          phone: null,
          address: null,
          city: null,
          postalCode: null,
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
