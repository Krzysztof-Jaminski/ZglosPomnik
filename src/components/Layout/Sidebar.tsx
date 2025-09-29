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
    <aside className="hidden sm:block w-40 lg:w-48 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-2 sm:p-3">
        <nav className="space-y-0.5 sm:space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => triggerLightHaptic()}
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1 sm:py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-green-900/20 text-blue-900 dark:text-green-400 border-l-4 border-blue-600'
                    : 'text-blue-800 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium text-xs sm:text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export { Sidebar };