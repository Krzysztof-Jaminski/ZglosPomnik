import React from 'react';
import { BarChart3, Users, TreePine, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminStats as AdminStatsType } from '../../services/adminService';

interface AdminStatsProps {
  stats: AdminStatsType | null;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Statystyki systemu
            </h3>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Brak danych statystycznych</p>
          </div>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      icon: Users,
      value: stats.totalUsers,
      label: 'Użytkownicy',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: TreePine,
      value: stats.totalTrees,
      label: 'Drzewa',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: MessageSquare,
      value: stats.totalComments,
      label: 'Komentarze',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Clock,
      value: stats.pendingTrees,
      label: 'Oczekujące',
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Statystyki systemu
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${item.bgColor} rounded-lg p-3 sm:p-4 aspect-square flex flex-col items-center justify-center`}
            >
              <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${item.textColor} mb-2`} />
              <div className={`text-xl sm:text-2xl font-bold ${item.textColor}`}>
                {item.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
