import React from 'react';
import { BarChart3, TreePine, Users, Leaf, MessageSquare } from 'lucide-react';

interface AdminNavigationProps {
  activeTab: 'stats' | 'trees' | 'users' | 'species' | 'comments';
  onTabChange: (tab: 'stats' | 'trees' | 'users' | 'species' | 'comments') => void;
  counts: {
    trees: number;
    users: number;
    species: number;
    comments: number;
  };
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  counts 
}) => {
  const navigationItems = [
    {
      id: 'stats' as const,
      label: 'Statystyki',
      icon: BarChart3,
      count: null
    },
    {
      id: 'trees' as const,
      label: 'Drzewa',
      icon: TreePine,
      count: counts.trees
    },
    {
      id: 'users' as const,
      label: 'Użytkownicy',
      icon: Users,
      count: counts.users
    },
    {
      id: 'species' as const,
      label: 'Gatunki',
      icon: Leaf,
      count: counts.species
    },
    {
      id: 'comments' as const,
      label: 'Komentarze',
      icon: MessageSquare,
      count: counts.comments
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Nawigacja
          </h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`aspect-square flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 shadow-lg'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md'
              }`}
            >
              <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${
                activeTab === item.id 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
              <span className={`text-xs font-medium text-center leading-tight ${
                activeTab === item.id 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {item.label}
              </span>
              {item.count !== null && item.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full mt-0.5 ${
                  activeTab === item.id
                    ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
