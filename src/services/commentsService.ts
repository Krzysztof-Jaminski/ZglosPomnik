// Serwis do pobierania komentarzy z API
import { Comment } from '../types';
import { authService } from './authService';

const API_BASE_URL = '/api';

class CommentsService {
  // Pobierz komentarze dla konkretnego drzewa
  async getTreeComments(treeId: string): Promise<Comment[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/trees/${treeId}`, {
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
          // Brak komentarzy dla tego drzewa
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get tree comments error:', error);
      throw error;
    }
  }

  // Dodaj komentarz do drzewa (opcjonalne - jeśli API to obsługuje)
  async addTreeComment(treeId: string, content: string): Promise<Comment> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/trees/${treeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add tree comment error:', error);
      throw error;
    }
  }

  // Polub komentarz (opcjonalne - jeśli API to obsługuje)
  async likeComment(commentId: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Like comment error:', error);
      throw error;
    }
  }
}

// Eksportuj singleton instance
export const commentsService = new CommentsService();
