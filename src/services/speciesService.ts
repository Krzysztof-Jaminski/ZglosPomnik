// Serwis do pobierania gatunków drzew z API
import { Species } from '../types';
import { authService } from './authService';

const API_BASE_URL = 'http://192.168.10.117:5174/api/Species';

class SpeciesService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'accept': '*/*',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Failed to fetch species');
    }
    return response.json();
  }

  // Pobierz wszystkie gatunki drzew
  async getSpecies(): Promise<Species[]> {
    return this.fetchWithAuth(API_BASE_URL);
  }

  // Pobierz konkretny gatunek po ID (jeśli API to obsługuje)
  async getSpeciesById(id: string): Promise<Species> {
    return this.fetchWithAuth(`${API_BASE_URL}/${id}`);
  }
}

export const speciesService = new SpeciesService();
