// Serwis do pobierania drzew z API
import { Tree } from '../types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class TreesService {
  // Pobierz wszystkie drzewa
  async getTrees(): Promise<Tree[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Trees`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get trees error:', error);
      throw error;
    }
  }

  // Pobierz drzewo po ID
  async getTree(id: string): Promise<Tree> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Trees/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token wygasł - nie wylogowuj automatycznie, tylko rzuć błąd
          throw new Error('Authentication token expired');
        }
        if (response.status === 404) {
          throw new Error('Tree not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get tree error:', error);
      throw error;
    }
  }

  // Pobierz drzewa w okolicy (opcjonalne - jeśli API to obsługuje)
  async getTreesInArea(lat: number, lng: number, radius: number = 1000): Promise<Tree[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Jeśli API ma endpoint do pobierania drzew w okolicy
      const response = await fetch(`${API_BASE_URL}/Trees/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token wygasł - nie wylogowuj automatycznie, tylko rzuć błąd
          throw new Error('Authentication token expired');
        }
        if (response.status === 404) {
          // Endpoint nie istnieje, zwróć pustą tablicę
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get trees in area error:', error);
      // Jeśli endpoint nie istnieje, zwróć pustą tablicę
      return [];
    }
  }

  // Głosowanie na drzewo - PUT /api/Trees/{id}/vote
  async voteOnTree(treeId: string, voteType: 'like' | 'dislike'): Promise<{ like: number; dislike: number }> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Trees/${treeId}/vote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({ 
          type: voteType === 'like' ? 'Like' : 'Dislike' 
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Vote ${voteType} on tree ${treeId}:`, data);
      return data;
    } catch (error) {
      console.error('Vote on tree error:', error);
      throw error;
    }
  }

  // Usuwanie głosu na drzewo - DELETE /api/Trees/{id}/vote
  async removeVoteFromTree(treeId: string): Promise<{ like: number; dislike: number }> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Trees/${treeId}/vote`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Removed vote from tree ${treeId}:`, data);
      return data;
    } catch (error) {
      console.error('Remove vote from tree error:', error);
      throw error;
    }
  }

  // Submit tree report to API
  async submitTreeReport(treeData: any): Promise<any> {
    try {
      const token = authService.getToken();
      console.log('Token from authService:', token ? 'exists' : 'null');
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Submitting tree report to API:', treeData);
      console.log('Request URL:', '/api/Trees');
      console.log('Full URL would be:', window.location.origin + '/api/Trees');
      console.log('Vite proxy should redirect to: http://192.168.10.116:5174/api/Trees');

      const response = await fetch('/api/Trees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(treeData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      console.log('Tree report submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('Submit tree report error:', error);
      throw error;
    }
  }

  // Usuń post drzewa - DELETE /api/Trees/{id}
  async deleteTree(treeId: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Attempting to delete tree:', {
        treeId,
        url: `/api/Trees/${treeId}`,
        token: token ? 'exists' : 'missing'
      });

      const response = await fetch(`/api/Trees/${treeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      console.log('Delete tree response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        if (response.status === 403) {
          throw new Error('You can only delete your own tree posts');
        }
        if (response.status === 404) {
          throw new Error('Tree post not found');
        }
        if (response.status === 500) {
          // Try to get error details from response
          let errorMessage = 'Internal server error';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If we can't parse JSON, use default message
          }
          throw new Error(`Server error: ${errorMessage}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Deleted tree post ${treeId}`);
    } catch (error) {
      console.error('Delete tree error:', error);
      throw error;
    }
  }
}

// Eksportuj singleton instance
export const treesService = new TreesService();
