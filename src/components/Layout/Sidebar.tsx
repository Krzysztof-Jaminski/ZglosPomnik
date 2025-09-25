import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Rss, TreePine, FileText, BookOpen, User, Shield } from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { triggerLightHaptic } = useHapticFeedback();
  const { isAdmin } = useAuth();
  
  const navItems = [
    { to: '/map', icon: Map, label: 'Mapa' },
    { to: '/report', icon: TreePine, label: 'Zgłoś drzewo' },
    { to: '/feed', icon: Rss, label: 'Feed' },
    { to: '/applications', icon: FileText, label: 'Wnioski' },
    { to: '/encyclopedia', icon: BookOpen, label: 'Encyklopedia' },
    { to: '/profile', icon: User, label: 'Profil' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Panel administratora' }] : [])
  ];

  return (
    <aside className="hidden sm:block w-56 lg:w-72 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-3 sm:p-6">
        <nav className="space-y-1 sm:space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => triggerLightHaptic()}
              className={({ isActive }) =>
                `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-green-900/20 text-blue-900 dark:text-green-400 border-l-4 border-blue-600'
                    : 'text-blue-800 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export { Sidebar };