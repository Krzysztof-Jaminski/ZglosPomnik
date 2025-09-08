// Serwis do pobierania komentarzy z API z obsługą localStorage
import { Comment } from '../types';
import { authService } from './authService';

const API_BASE_URL = 'https://localhost:7274/api';
const COMMENTS_STORAGE_KEY = 'comments_cache';
const COMMENTS_LAST_SYNC_KEY = 'comments_last_sync';

class CommentsService {
  // Pobierz wszystkie komentarze z API i zapisz w localStorage
  async getAllComments(): Promise<Comment[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments`, {
        method: 'GET',
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

      const comments = await response.json();
      
      // Zapisz komentarze w localStorage
      this.saveCommentsToStorage(comments);
      
      return comments;
    } catch (error) {
      console.error('Get all comments error:', error);
      // W przypadku błędu, spróbuj załadować z localStorage
      return this.getCommentsFromStorage();
    }
  }

  // Pobierz komentarze z localStorage
  getCommentsFromStorage(): Comment[] {
    try {
      const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading comments from storage:', error);
      return [];
    }
  }

  // Zapisz komentarze w localStorage
  public saveCommentsToStorage(comments: Comment[]): void {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
      localStorage.setItem(COMMENTS_LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving comments to storage:', error);
    }
  }

  // Pobierz komentarze dla konkretnego drzewa (z localStorage)
  getTreeComments(treeId: string): Comment[] {
    const allComments = this.getCommentsFromStorage();
    console.log('Getting comments for treeId:', treeId, 'from', allComments.length, 'total comments');
    
    // Search by treeSubmissionId - this is the correct way
    const filteredComments = allComments.filter(comment => {
      const matches = comment.treeSubmissionId === treeId;
      if (matches) {
        console.log('Found matching comment:', comment);
      }
      return matches;
    });
    
    console.log('Found', filteredComments.length, 'comments for tree', treeId);
    return filteredComments;
  }

  // Głosuj na komentarz (like/dislike)
  async voteComment(commentId: string, voteType: 'Like' | 'Dislike'): Promise<{ like: number; dislike: number }> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({ type: voteType })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const votes = await response.json();
      
      // Aktualizuj lokalne dane
      this.updateCommentVotes(commentId, votes);
      
      return votes;
    } catch (error) {
      console.error('Vote comment error:', error);
      throw error;
    }
  }

  // Aktualizuj głosy komentarza w localStorage
  private updateCommentVotes(commentId: string, votes: { like: number; dislike: number }): void {
    try {
      const comments = this.getCommentsFromStorage();
      const commentIndex = comments.findIndex(comment => comment.id === commentId);
      
      if (commentIndex !== -1) {
        comments[commentIndex].votes = votes;
        this.saveCommentsToStorage(comments);
      }
    } catch (error) {
      console.error('Error updating comment votes:', error);
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
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newComment = await response.json();
      
      // Dodaj nowy komentarz do localStorage
      this.addCommentToStorage(newComment);
      
      return newComment;
    } catch (error) {
      console.error('Add tree comment error:', error);
      throw error;
    }
  }

  // Dodaj nowy komentarz do localStorage
  private addCommentToStorage(comment: Comment): void {
    try {
      const comments = this.getCommentsFromStorage();
      comments.unshift(comment); // Dodaj na początku listy
      this.saveCommentsToStorage(comments);
    } catch (error) {
      console.error('Error adding comment to storage:', error);
    }
  }

  // Sprawdź czy komentarze są aktualne (opcjonalne - do odświeżania)
  isCommentsStale(maxAgeMinutes: number = 30): boolean {
    try {
      const lastSync = localStorage.getItem(COMMENTS_LAST_SYNC_KEY);
      if (!lastSync) return true;
      
      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60);
      
      return diffMinutes > maxAgeMinutes;
    } catch (error) {
      console.error('Error checking comments staleness:', error);
      return true;
    }
  }

  // Wyczyść cache komentarzy
  clearCommentsCache(): void {
    try {
      localStorage.removeItem(COMMENTS_STORAGE_KEY);
      localStorage.removeItem(COMMENTS_LAST_SYNC_KEY);
    } catch (error) {
      console.error('Error clearing comments cache:', error);
    }
  }
}

// Eksportuj singleton instance
export const commentsService = new CommentsService();
