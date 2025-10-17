const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  expiresAt: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  expiresAt: string;
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

  // Update user data
  async updateUserData(userData: {
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    avatar?: string;
    avatarFile?: File;
  }): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const currentUser = this.getCurrentUserData();
    if (!currentUser) {
      throw new Error('No current user found');
    }

    console.log('updateUserData called with:', userData);
    console.log('Current user ID:', currentUser.id);

    try {
      // Create FormData for multipart/form-data - ALL fields must be sent
      const formData = new FormData();
      
      // Always send all text fields, even if empty
      formData.append('Phone', userData.phone || '');
      formData.append('Address', userData.address || '');
      formData.append('City', userData.city || '');
      formData.append('PostalCode', userData.postalCode || '');
      
      // Always send image field - null if not provided
      if (userData.avatarFile) {
        formData.append('image', userData.avatarFile);
      } else {
        formData.append('image', 'null');
      }

      console.log('Updating user data with FormData:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await fetch(`${API_BASE_URL}/Users/data/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
        body: formData
      });

      if (!response.ok) {
        // Log error details for debugging
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          // Try to refresh token
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            // Retry with new token
            const retryResponse = await fetch(`${API_BASE_URL}/Users/data/${currentUser.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'accept': '*/*'
              },
              body: formData
            });
            
            if (!retryResponse.ok) {
              const retryErrorText = await retryResponse.text();
              console.error('API Retry Error Response:', {
                status: retryResponse.status,
                statusText: retryResponse.statusText,
                body: retryErrorText
              });
              throw new Error('Failed to update user data after token refresh');
            }
            
            const updatedUserData = await retryResponse.json();
            this.saveUser(updatedUserData);
            return updatedUserData;
          } else {
            throw new Error('Authentication token expired and refresh failed');
          }
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const updatedUserData = await response.json();
      console.log('User data updated successfully:', updatedUserData);
      this.saveUser(updatedUserData);
      return updatedUserData;
    } catch (error) {
      console.error('Update user data error:', error);
      throw error;
    }
  }

  // Forgot password - send reset email
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/EmailVerification/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different error types with user-friendly messages
        switch (response.status) {
          case 400:
            throw new Error(errorData.message || 'Nieprawidłowy format email');
          case 404:
            throw new Error('Nie znaleziono konta z podanym adresem email');
          case 429:
            throw new Error('Zbyt wiele prób. Spróbuj ponownie za kilka minut');
          case 500:
          case 502:
          case 503:
            throw new Error('Problem z serwerem. Spróbuj ponownie za chwilę');
          default:
            throw new Error(errorData.message || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie');
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      // If it's already our custom error message, re-throw it
      if (error.message && !error.message.includes('HTTP error!')) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Problem z połączeniem internetowym. Sprawdź połączenie i spróbuj ponownie');
      }
      
      // Default fallback
      throw new Error('Wystąpił błąd podczas wysyłania emaila. Spróbuj ponownie');
    }
  }

  // Reset password with token
  async resetPassword(passwordData: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/EmailVerification/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different error types with user-friendly messages
        switch (response.status) {
          case 400:
            throw new Error(errorData.message || 'Nieprawidłowe dane. Sprawdź hasło i spróbuj ponownie');
          case 401:
            throw new Error('Token resetowania hasła wygasł lub jest nieprawidłowy');
          case 404:
            throw new Error('Link do resetowania hasła jest nieprawidłowy lub wygasł');
          case 500:
          case 502:
          case 503:
            throw new Error('Problem z serwerem. Spróbuj ponownie za chwilę');
          default:
            throw new Error(errorData.message || 'Wystąpił błąd podczas resetowania hasła');
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // If it's already our custom error message, re-throw it
      if (error.message && !error.message.includes('HTTP error!')) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Problem z połączeniem internetowym. Sprawdź połączenie i spróbuj ponownie');
      }
      
      // Default fallback
      throw new Error('Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie');
    }
  }

  // Verify reset password token
  async verifyResetToken(token: string): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/EmailVerification/reset-password?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'accept': 'text/plain'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different error types with user-friendly messages
        switch (response.status) {
          case 400:
            throw new Error('Nieprawidłowy token resetowania hasła');
          case 401:
            throw new Error('Token resetowania hasła wygasł');
          case 404:
            throw new Error('Token resetowania hasła nie został znaleziony');
          case 500:
          case 502:
          case 503:
            throw new Error('Problem z serwerem. Spróbuj ponownie za chwilę');
          default:
            throw new Error(errorData.message || 'Wystąpił błąd podczas weryfikacji tokenu');
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Verify reset token error:', error);
      
      // If it's already our custom error message, re-throw it
      if (error.message && !error.message.includes('HTTP error!')) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Problem z połączeniem internetowym. Sprawdź połączenie i spróbuj ponownie');
      }
      
      // Default fallback
      throw new Error('Wystąpił błąd podczas weryfikacji linku resetowania hasła');
    }
  }

  // Change password
  async changePassword(passwordData: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    const authToken = this.getToken();
    if (!authToken) {
      throw new Error('No authentication token');
    }

    try {
      console.log('Changing password with new API format:', {
        token: passwordData.token,
        newPassword: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      const response = await fetch(`${API_BASE_URL}/Users/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({
          token: passwordData.token,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            // Retry with new token
            const retryResponse = await fetch(`${API_BASE_URL}/Users/password`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
                'accept': '*/*'
              },
              body: JSON.stringify({
                token: passwordData.token,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
              })
            });
            
            if (!retryResponse.ok) {
              throw new Error('Failed to change password after token refresh');
            }
            
            console.log('Password changed successfully');
            return; // Password change successful
          } else {
            throw new Error('Authentication token expired and refresh failed');
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

}

// Eksportuj singleton instance
export const authService = new AuthService();
