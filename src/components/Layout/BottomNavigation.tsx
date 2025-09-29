import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Rss, TreePine, FileText, BookOpen } from 'lucide-react';
import { useKeyboardStatus } from '../../hooks/useKeyboardStatus';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export const BottomNavigation: React.FC = () => {
  const isKeyboardOpen = useKeyboardStatus();
  const { triggerLightHaptic } = useHapticFeedback();

  const navItems = [
    { to: '/map', icon: Map, label: 'Mapa' },
    { to: '/report', icon: TreePine, label: 'Zgłoś' },
    { to: '/applications', icon: FileText, label: 'Wnioski' },
    { to: '/encyclopedia', icon: BookOpen, label: 'Gatunki' },
    { to: '/feed', icon: Rss, label: 'Feed' }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 sm:hidden bottom-nav transition-all duration-300 ${
      isKeyboardOpen ? 'hidden' : 'block'
    }`}>
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => triggerLightHaptic()}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 min-w-0 flex-1 transition-colors focus:outline-none focus:ring-0 ${
                isActive
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-blue-600 dark:text-gray-400'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-xs font-medium truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};