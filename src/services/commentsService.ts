// Serwis do pobierania komentarzy z API z obsługą localStorage
import { Comment } from '../types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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

  // Pobierz komentarze dla konkretnego drzewa z API
  async getTreeCommentsFromAPI(treeId: string): Promise<Comment[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/tree/${treeId}`, {
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
        if (response.status === 404) {
          // No comments for this tree
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const comments = await response.json();
      
      return comments;
    } catch (error) {
      console.error('Get tree comments error:', error);
      // Fallback to localStorage
      return this.getTreeComments(treeId);
    }
  }

  // Pobierz komentarze dla konkretnego drzewa (z localStorage)
  getTreeComments(treeId: string): Comment[] {
    const allComments = this.getCommentsFromStorage();
    
    // Search by treeSubmissionId - this is the correct way
    const filteredComments = allComments.filter(comment => {
      const matches = comment.treeSubmissionId === treeId;
      if (matches) {
      }
      return matches;
    });
    
    return filteredComments;
  }

  // Głosuj na komentarz - PUT /api/Comments/{id}/vote
  async voteComment(commentId: string, voteType: 'Like' | 'Dislike'): Promise<{ like: number; dislike: number }> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/${commentId}/vote`, {
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
      console.log(`Vote ${voteType} on comment ${commentId}:`, votes);
      
      // Aktualizuj lokalne dane
      this.updateCommentVotes(commentId, votes);
      
      return votes;
    } catch (error) {
      console.error('Vote comment error:', error);
      throw error;
    }
  }

  // Usuń głos z komentarza - DELETE /api/Comments/{id}/vote
  async removeVoteFromComment(commentId: string): Promise<{ like: number; dislike: number }> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/${commentId}/vote`, {
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

      const votes = await response.json();
      console.log(`Removed vote from comment ${commentId}:`, votes);
      
      // Aktualizuj lokalne dane
      this.updateCommentVotes(commentId, votes);
      
      return votes;
    } catch (error) {
      console.error('Remove vote from comment error:', error);
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
  async addTreeComment(treeId: string, content: string, userId?: string): Promise<Comment> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/Comments/tree/${treeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({ 
          content: content,
          isLegend: false
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newComment = await response.json();
      
      // Add userId to the comment if not present
      if (!newComment.userId && userId) {
        newComment.userId = userId;
      }
      
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

  // Usuń komentarz - DELETE /api/Comments/{id}
  async deleteComment(commentId: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Attempting to delete comment:', {
        commentId,
        url: `/api/Comments/${commentId}`,
        token: token ? 'exists' : 'missing',
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });

      const response = await fetch(`/api/Comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      console.log('Delete comment response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        if (response.status === 403) {
          throw new Error('You can only delete your own comments');
        }
        if (response.status === 404) {
          // Try to get error details from response
          let errorMessage = 'Comment not found';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            // If we can't parse JSON, use default message
          }
          throw new Error(`Comment not found: ${errorMessage}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Deleted comment ${commentId}`);
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
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
