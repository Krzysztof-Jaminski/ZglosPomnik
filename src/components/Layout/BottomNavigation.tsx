import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Rss, TreePine, FileText, BookOpen } from 'lucide-react';
import { GlassButton } from '../UI/GlassButton';

export const BottomNavigation: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { to: '/map', icon: Map, label: 'Mapa' },
    { to: '/report', icon: TreePine, label: 'Zgłoś' },
    { to: '/applications', icon: FileText, label: 'Wnioski' },
    { to: '/encyclopedia', icon: BookOpen, label: 'Gatunki' },
    { to: '/feed', icon: Rss, label: 'Feed' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 sm:hidden bottom-nav">
      <div className="flex justify-around items-center py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors focus:outline-none focus:ring-0 ${
                isActive
                  ? 'text-black dark:text-green-400'
                  : 'text-green-700 dark:text-gray-400'
              }`
            }
          >
            <Icon className="w-7 h-7 mb-1" />
            <span className="text-xs font-medium truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};