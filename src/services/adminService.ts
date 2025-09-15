// Serwis administratora - używa prawdziwych API
import { Tree } from '../types';
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

class AdminService {
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


  // Pobierz wszystkich użytkowników (mock data - nie ma API)
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('API Call: getAllUsers (admin) - mock data');
      // Mock data bo nie ma API dla użytkowników
      return [
        {
          id: '1',
          name: 'Jan Kowalski',
          email: 'jan.kowalski@example.com',
          role: 'citizen',
          registeredAt: '2024-01-15T10:00:00Z',
          lastActive: '2024-01-20T14:30:00Z',
          reportsCount: 5,
          status: 'active'
        },
        {
          id: '2',
          name: 'Anna Nowak',
          email: 'anna.nowak@example.com',
          role: 'ecologist',
          registeredAt: '2024-01-10T09:00:00Z',
          lastActive: '2024-01-19T16:45:00Z',
          reportsCount: 12,
          status: 'active'
        },
        {
          id: '3',
          name: 'Piotr Wiśniewski',
          email: 'piotr.wisniewski@example.com',
          role: 'citizen',
          registeredAt: '2024-01-05T08:00:00Z',
          lastActive: '2024-01-18T12:20:00Z',
          reportsCount: 3,
          status: 'suspended'
        }
      ];
    } catch (error) {
      console.error('Error fetching users:', error);
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


  // Usuń użytkownika (mock - nie ma API)
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log(`API Call: deleteUser ${userId} (admin) - mock`);
      // Mock operation - w prawdziwej aplikacji byłoby API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`User ${userId} deleted successfully (mock)`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Zawieś/odblokuj użytkownika (mock - nie ma API)
  async toggleUserStatus(userId: string, status: 'active' | 'suspended' | 'banned'): Promise<void> {
    try {
      console.log(`API Call: toggleUserStatus ${userId} to ${status} (admin) - mock`);
      // Mock operation - w prawdziwej aplikacji byłoby API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`User ${userId} status updated to ${status} (mock)`);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
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
