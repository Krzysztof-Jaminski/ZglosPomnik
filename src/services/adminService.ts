// Serwis administratora - używa prawdziwych API
import { Tree, Species, Comment, User } from '../types';
import { applicationsService } from './applicationsService';
import { treesService } from './treesService';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'ecologist' | 'citizen';
  registeredAt: string;
  lastActive: string;
  reportsCount: number;
  status: 'active' | 'suspended' | 'banned';
}

export interface AdminStats {
  totalUsers: number;
  totalTrees: number;
  totalComments: number;
  pendingTrees: number;
  activeUsers: number;
}

export interface SpeciesFormData {
  polishName: string;
  latinName: string;
  family: string;
  description?: string;
  identificationGuide?: string[];
  seasonalChanges: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  traits: {
    maxHeight?: number;
    lifespan?: string;
    nativeToPoland?: boolean;
  };
  treeImage?: File;
  leafImage?: File;
  barkImage?: File;
  fruitImage?: File;
}

class AdminService {
  private baseUrl = 'https://localhost:7000/api';

  // Pobierz wszystkie drzewa (używa prawdziwego API)
  async getAllTrees(): Promise<Tree[]> {
    try {
      console.log('API Call: getAllTrees (admin)');
      return await applicationsService.getAllTrees();
    } catch (error) {
      console.error('Error fetching trees:', error);
      throw error;
    }
  }

  // Pobierz wszystkich użytkowników (prawdziwe API)
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('API Call: getAllUsers (admin)');
      const response = await fetch(`${this.baseUrl}/Users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      return users.map((user: any) => ({
        id: user.id,
        name: user.name || user.userName || 'Nieznany',
        email: user.email,
        role: user.role || 'citizen',
        registeredAt: user.registeredAt || user.createdAt || new Date().toISOString(),
        lastActive: user.lastActive || user.updatedAt || new Date().toISOString(),
        reportsCount: user.reportsCount || 0,
        status: user.status || 'active'
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Pobierz wszystkie komentarze (prawdziwe API)
  async getAllComments(): Promise<Comment[]> {
    try {
      console.log('API Call: getAllComments (admin)');
      const response = await fetch(`${this.baseUrl}/Comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const comments = await response.json();
      return comments.map((comment: any) => ({
        id: comment.id,
        treeSubmissionId: comment.treeSubmissionId,
        treePolishName: comment.treePolishName || 'Nieznane drzewo',
        userId: comment.userId,
        userData: {
          userName: comment.userData?.userName || comment.userName || 'Nieznany użytkownik',
          avatar: comment.userData?.avatar || comment.avatar || ''
        },
        content: comment.content,
        datePosted: comment.datePosted || comment.createdAt,
        isLegend: comment.isLegend || false,
        votes: {
          like: comment.votes?.like || 0,
          dislike: comment.votes?.dislike || 0
        },
        userVote: comment.userVote || null
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Pobierz wszystkie gatunki (prawdziwe API)
  async getAllSpecies(): Promise<Species[]> {
    try {
      console.log('API Call: getAllSpecies (admin)');
      const response = await fetch(`${this.baseUrl}/Species`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const species = await response.json();
      return species.map((spec: any) => ({
        id: spec.id,
        polishName: spec.polishName,
        latinName: spec.latinName,
        family: spec.family,
        description: spec.description || '',
        identificationGuide: spec.identificationGuide || [],
        seasonalChanges: {
          spring: spec.seasonalChanges?.spring || '',
          summer: spec.seasonalChanges?.summer || '',
          autumn: spec.seasonalChanges?.autumn || '',
          winter: spec.seasonalChanges?.winter || ''
        },
        images: spec.images || [],
        traits: {
          maxHeight: spec.traits?.maxHeight || 0,
          lifespan: spec.traits?.lifespan || '',
          nativeToPoland: spec.traits?.nativeToPoland || false
        }
      }));
    } catch (error) {
      console.error('Error fetching species:', error);
      throw error;
    }
  }


  // Dodaj nowy gatunek
  async createSpecies(speciesData: SpeciesFormData): Promise<Species> {
    try {
      console.log('API Call: createSpecies (admin)');
      const formData = new FormData();
      
      formData.append('PolishName', speciesData.polishName);
      formData.append('LatinName', speciesData.latinName);
      formData.append('Family', speciesData.family);
      if (speciesData.description) formData.append('Description', speciesData.description);
      if (speciesData.identificationGuide) {
        speciesData.identificationGuide.forEach(guide => {
          formData.append('IdentificationGuide', guide);
        });
      }
      formData.append('SeasonalChanges.Spring', speciesData.seasonalChanges.spring);
      formData.append('SeasonalChanges.Summer', speciesData.seasonalChanges.summer);
      formData.append('SeasonalChanges.Autumn', speciesData.seasonalChanges.autumn);
      formData.append('SeasonalChanges.Winter', speciesData.seasonalChanges.winter);
      
      if (speciesData.traits.maxHeight) formData.append('Traits.MaxHeight', speciesData.traits.maxHeight.toString());
      if (speciesData.traits.lifespan) formData.append('Traits.Lifespan', speciesData.traits.lifespan);
      if (speciesData.traits.nativeToPoland !== undefined) formData.append('Traits.NativeToPoland', speciesData.traits.nativeToPoland.toString());
      
      if (speciesData.treeImage) formData.append('treeImage', speciesData.treeImage);
      if (speciesData.leafImage) formData.append('leafImage', speciesData.leafImage);
      if (speciesData.barkImage) formData.append('barkImage', speciesData.barkImage);
      if (speciesData.fruitImage) formData.append('fruitImage', speciesData.fruitImage);

      const response = await fetch(`${this.baseUrl}/Species`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating species:', error);
      throw error;
    }
  }

  // Edytuj gatunek
  async updateSpecies(speciesId: string, speciesData: SpeciesFormData): Promise<Species> {
    try {
      console.log(`API Call: updateSpecies ${speciesId} (admin)`);
      const formData = new FormData();
      
      formData.append('PolishName', speciesData.polishName);
      formData.append('LatinName', speciesData.latinName);
      formData.append('Family', speciesData.family);
      if (speciesData.description) formData.append('Description', speciesData.description);
      if (speciesData.identificationGuide) {
        speciesData.identificationGuide.forEach(guide => {
          formData.append('IdentificationGuide', guide);
        });
      }
      formData.append('SeasonalChanges.Spring', speciesData.seasonalChanges.spring);
      formData.append('SeasonalChanges.Summer', speciesData.seasonalChanges.summer);
      formData.append('SeasonalChanges.Autumn', speciesData.seasonalChanges.autumn);
      formData.append('SeasonalChanges.Winter', speciesData.seasonalChanges.winter);
      
      if (speciesData.traits.maxHeight) formData.append('Traits.MaxHeight', speciesData.traits.maxHeight.toString());
      if (speciesData.traits.lifespan) formData.append('Traits.Lifespan', speciesData.traits.lifespan);
      if (speciesData.traits.nativeToPoland !== undefined) formData.append('Traits.NativeToPoland', speciesData.traits.nativeToPoland.toString());
      
      if (speciesData.treeImage) formData.append('treeImage', speciesData.treeImage);
      if (speciesData.leafImage) formData.append('leafImage', speciesData.leafImage);
      if (speciesData.barkImage) formData.append('barkImage', speciesData.barkImage);
      if (speciesData.fruitImage) formData.append('fruitImage', speciesData.fruitImage);

      const response = await fetch(`${this.baseUrl}/Species/${speciesId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating species:', error);
      throw error;
    }
  }

  // Usuń gatunek
  async deleteSpecies(speciesId: string): Promise<void> {
    try {
      console.log(`API Call: deleteSpecies ${speciesId} (admin)`);
      const response = await fetch(`${this.baseUrl}/Species/${speciesId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting species:', error);
      throw error;
    }
  }

  // Usuń komentarz
  async deleteComment(commentId: string): Promise<void> {
    try {
      console.log(`API Call: deleteComment ${commentId} (admin)`);
      const response = await fetch(`${this.baseUrl}/Comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Usuń drzewo (używa istniejącego API)
  async deleteTree(treeId: string): Promise<void> {
    try {
      console.log(`API Call: deleteTree ${treeId} (admin)`);
      await treesService.deleteTree(treeId);
    } catch (error) {
      console.error('Error deleting tree:', error);
      throw error;
    }
  }

  // Usuń użytkownika (prawdziwe API)
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log(`API Call: deleteUser ${userId} (admin)`);
      const response = await fetch(`${this.baseUrl}/Users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Zawieś/odblokuj użytkownika (prawdziwe API)
  async toggleUserStatus(userId: string, status: 'active' | 'suspended' | 'banned'): Promise<void> {
    try {
      console.log(`API Call: toggleUserStatus ${userId} to ${status} (admin)`);
      const response = await fetch(`${this.baseUrl}/Users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Weryfikuj hasło administratora
  async verifyAdminPassword(password: string): Promise<boolean> {
    try {
      console.log('API Call: verifyAdminPassword (admin)');
      // TODO: Implement real API call for password verification
      // For now, return false to disable admin functions
      return false;
    } catch (error) {
      console.error('Error verifying admin password:', error);
      return false;
    }
  }

  // Pobierz statystyki administratora (obliczane z prawdziwych danych)
  async getAdminStats(): Promise<AdminStats> {
    try {
      console.log('API Call: getAdminStats (admin) - calculated from real data');
      const [trees, users] = await Promise.all([
        this.getAllTrees(),
        this.getAllUsers()
      ]);
      
      const totalComments = trees.reduce((sum, tree) => sum + (tree.commentCount || 0), 0);
      
      return {
        totalUsers: users.length,
        totalTrees: trees.length,
        totalComments: totalComments,
        pendingTrees: trees.filter(tree => tree.status === 'pending').length,
        activeUsers: users.filter(user => user.status === 'active').length
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
}

// Eksportuj singleton
export const adminService = new AdminService();
