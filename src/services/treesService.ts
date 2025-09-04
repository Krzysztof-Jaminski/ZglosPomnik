// Serwis do pobierania drzew z API
import { Tree } from '../types';
import { authService } from './authService';

const API_BASE_URL = 'http://192.168.10.117:5174/api';

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

  // Głosowanie na drzewo (opcjonalne - jeśli API to obsługuje)
  async voteOnTree(treeId: string, vote: 'approve' | 'reject'): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Trees/${treeId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({ vote })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token wygasł - nie wylogowuj automatycznie, tylko rzuć błąd
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Vote on tree error:', error);
      throw error;
    }
  }
}

// Eksportuj singleton instance
export const treesService = new TreesService();
