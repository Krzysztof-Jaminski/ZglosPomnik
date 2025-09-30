import { Tree } from '../types';

// Mock data removed - using real API data only

// Mock comments removed - using real API data only

// Mock applications removed - using real API data only


// Mock data removed - using real API data only

export const api = {
  // Trees
  async getTrees(): Promise<Tree[]> {
    // Mock data for testing
    return [
      {
        id: '1',
        userData: {
          userName: 'Test User',
          avatar: '',
          userId: '1'
        },
        species: 'Dąb szypułkowy',
        speciesLatin: 'Quercus robur',
        location: {
          lat: 50.041187,
          lng: 21.999121,
          address: 'Rzeszów, Park'
        },
        circumference: 150,
        height: 25,
        condition: 'dobry',
        isAlive: true,
        estimatedAge: 100,
        description: 'Piękny dąb w parku miejskim',
        imageUrls: [],
        isMonument: true,
        status: 'approved',
        submissionDate: new Date().toISOString(),
        approvalDate: new Date().toISOString(),
        votes: {
          like: 5,
          dislike: 0
        }
      }
    ];
  },

  async getTree(_id: string) {
    // TODO: Implement real API call
    return null;
  },

  async createTree(_treeData: any) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },

  async addTree(_treeData: any) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },

  async updateTree(_id: string, _updates: any) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },

  async deleteTree(_id: string) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },

  // Applications
  async getApplications() {
    // TODO: Implement real API call
    return [];
  },

  async getApplication(_id: string) {
    // TODO: Implement real API call
    return null;
  },

  async createApplication(_applicationData: any) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },

  async updateApplication(_id: string, _updates: any) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },

  async deleteApplication(_id: string) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },


  // Application Templates
  async getApplicationTemplates() {
    // TODO: Implement real API call
    return [];
  },

  async generateApplication(_treeId: string, _templateId: string) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },

  // Communes
  async getCommunes() {
    // TODO: Implement real API call
    return [];
  },

  // User authentication - DEPRECATED: Use authService instead
  async login(email: string, password: string) {
    console.warn('api.login is deprecated. Use authService.login instead.');
    const { authService } = await import('./authService');
    return authService.login({ email, password });
  },

  async register(userData: any) {
    console.warn('api.register is deprecated. Use authService.register instead.');
    const { authService } = await import('./authService');
    return authService.register(userData);
  },

  async getCurrentUser() {
    console.warn('api.getCurrentUser is deprecated. Use authService.getCurrentUserData() instead.');
    const { authService } = await import('./authService');
    return authService.getCurrentUserData();
  },


};