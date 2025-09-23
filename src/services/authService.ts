const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://drzewaapi-app-2024.azurewebsites.net/api';
console.log('AuthService API_BASE_URL:', API_BASE_URL);

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
  avatar: string | null;
  registrationDate: string;
  role: string;
  statistics: {
    submissionCount: number;
    applicationCount: number;
  };
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
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;
    
    if (accessToken) {
      this.token = accessToken;
      localStorage.setItem('auth_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }

    // User data will be fetched separately from /api/user/profile endpoint

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
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;
    console.log('Extracted accessToken:', accessToken ? 'found' : 'not found');
    console.log('Extracted refreshToken:', refreshToken ? 'found' : 'not found');
    
    if (accessToken) {
      this.token = accessToken;
      localStorage.setItem('auth_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      console.log('Tokens saved to localStorage');
    } else {
      console.error('No accessToken found in login response');
    }

    // User data will be fetched separately from /api/user/profile endpoint

    return data;
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.log('No refresh token available');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.accessToken;
      
      if (newAccessToken) {
        this.token = newAccessToken;
        localStorage.setItem('auth_token', newAccessToken);
        console.log('Access token refreshed successfully');
        return newAccessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  logout(): void {
    this.token = null;
    this.clearUser();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
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


  async validateToken(): Promise<boolean> {
    return !!this.token;
  }

  async getUserProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            // Retry with new token
            const retryResponse = await fetch(`${API_BASE_URL}/users/current`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'accept': '*/*'
              }
            });
            
            if (!retryResponse.ok) {
              throw new Error('Failed to fetch user profile after token refresh');
            }
            
            const userData = await retryResponse.json();
            this.saveUser(userData);
            return userData;
          } else {
            throw new Error('Authentication token expired and refresh failed');
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      this.saveUser(userData);
      return userData;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

}

// Eksportuj singleton instance
export const authService = new AuthService();
