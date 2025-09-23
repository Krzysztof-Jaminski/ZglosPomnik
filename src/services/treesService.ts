// Serwis do pobierania drzew z API
import { Tree, ApiTreeSubmission } from '../types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://drzewaapi-app-2024.azurewebsites.net/api';
console.log('TreesService API_BASE_URL:', API_BASE_URL);

class TreesService {
  // Pobierz wszystkie drzewa
  async getTrees(): Promise<Tree[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/trees`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token wygasł - spróbuj odświeżyć
          console.log('Token expired, attempting to refresh...');
          const newToken = await authService.refreshAccessToken();
          if (newToken) {
            // Spróbuj ponownie z nowym tokenem
            const retryResponse = await fetch(`${API_BASE_URL}/trees`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'accept': '*/*'
              }
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              return retryData;
            }
          }
          throw new Error('Authentication token expired and refresh failed');
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

      const response = await fetch(`${API_BASE_URL}/trees/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/trees/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
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

      const response = await fetch(`${API_BASE_URL}/trees/${treeId}/vote`, {
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

      const response = await fetch(`${API_BASE_URL}/trees/${treeId}/vote`, {
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

  // Submit tree report to API with multipart/form-data
  async submitTreeReport(treeData: ApiTreeSubmission, photos: File[]): Promise<any> {
    try {
      const token = authService.getToken();
      console.log('Token from authService:', token ? 'exists' : 'null');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Validate photos
      if (photos.length === 0) {
        throw new Error('At least one photo is required');
      }
      if (photos.length > 5) {
        throw new Error('Maximum 5 photos allowed');
      }

      // Validate photo formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      for (const photo of photos) {
        if (!allowedTypes.includes(photo.type)) {
          throw new Error(`Invalid photo format: ${photo.type}. Allowed: JPG, PNG, JPEG`);
        }
      }

      console.log('Submitting tree report to API:', treeData);
      console.log('Photos count:', photos.length);
      console.log('Request URL:', `${API_BASE_URL}/trees`);

      // Create FormData
      const formData = new FormData();
      
      // Add tree data fields
      formData.append('speciesId', treeData.speciesId);
      formData.append('location.lat', treeData.location.lat.toString());
      formData.append('location.lng', treeData.location.lng.toString());
      formData.append('location.address', treeData.location.address);
      formData.append('circumference', treeData.circumference.toString());
      formData.append('height', treeData.height.toString());
      formData.append('condition', treeData.condition);
      formData.append('estimatedAge', treeData.estimatedAge.toString());
      
      // Add optional fields
      if (treeData.isAlive !== undefined) {
        formData.append('isAlive', treeData.isAlive.toString());
      }
      if (treeData.description) {
        formData.append('description', treeData.description);
      }
      if (treeData.isMonument !== undefined) {
        formData.append('isMonument', treeData.isMonument.toString());
      }
      
      // Add photos
      console.log('Adding photos to FormData:');
      photos.forEach((photo, index) => {
        console.log(`Photo ${index + 1}:`, {
          name: photo.name,
          size: photo.size,
          type: photo.type
        });
        formData.append('images', photo);
      });
      
      // Debug FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await fetch(`${API_BASE_URL}/trees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
          // Don't set Content-Type, let browser set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication token expired');
        }
        if (response.status === 400) {
          throw new Error('Bad request - check photo requirements (1-5 photos, JPG/PNG/JPEG)');
        }
        if (response.status === 422) {
          throw new Error('Validation error - check all required fields');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Tree report submitted successfully:', data);
      console.log('Returned tree images:', data.imageUrls);
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
        url: `${API_BASE_URL}/trees/${treeId}`,
        token: token ? 'exists' : 'missing'
      });

      const response = await fetch(`${API_BASE_URL}/trees/${treeId}`, {
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
