import { Tree } from '../types';

// Mock data removed - using real API data only

// Mock comments removed - using real API data only

// Mock applications removed - using real API data only


// Mock data removed - using real API data only

export const api = {
  // Trees
  async getTrees(): Promise<Tree[]> {
    // TODO: Implement real API call
    return [];
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

  // Municipalities
  async getMunicipalities() {
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
    console.warn('api.getCurrentUser is deprecated. Use authService.getCurrentUser instead.');
    const { authService } = await import('./authService');
    return authService.getCurrentUser();
  },

  // Comments
  async getComments() {
    // TODO: Implement real API call
    return [];
  },

  // File upload - TYMCZASOWE: używa ImgBB
  async uploadPhoto(file: File) {
    // Import tymczasowego serwisu
    const { tempImageService } = await import('./tempImageService');
    
    const result = await tempImageService.uploadImage(file);
    
    if (result.success && result.url) {
      return result.url;
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  }
};