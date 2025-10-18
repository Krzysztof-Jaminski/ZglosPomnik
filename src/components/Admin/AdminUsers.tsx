import React from 'react';
import { Users, Calendar, BarChart3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminUser } from '../../services/adminService';
import { GlassButton } from '../UI/GlassButton';

interface AdminUsersProps {
  users: AdminUser[];
  onDeleteUser: (userId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onDeleteUser }) => {
  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Użytkownicy
            </h3>
          </div>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Brak użytkowników</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Użytkownicy
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {user.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Dołączył: {new Date(user.registeredAt).toLocaleDateString('pl-PL')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <BarChart3 className="w-4 h-4" />
                  <span>Zgłoszeń: {user.reportsCount || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  user.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {user.status === 'active' ? 'Aktywny' : user.status === 'banned' ? 'Zablokowany' : 'Nieaktywny'}
                </span>
                <GlassButton 
                  size="sm" 
                  variant="danger" 
                  onClick={() => onDeleteUser(user.id)}
                  title="Usuń użytkownika"
                >
                  <span className="text-xs">Usuń</span>
                </GlassButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
