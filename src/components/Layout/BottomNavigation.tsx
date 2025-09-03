import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Rss, TreePine, FileText, BookOpen } from 'lucide-react';
import { GlassButton } from '../UI/GlassButton';

export const BottomNavigation: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { to: '/map', icon: Map, label: 'Mapa' },
    { to: '/report', icon: TreePine, label: 'Zgłoś' },
    { to: '/applications', icon: FileText, label: 'Wnioski' },
    { to: '/encyclopedia', icon: BookOpen, label: 'Gatunki' },
    { to: '/feed', icon: Rss, label: 'Feed' }
  ];

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Sprawdzamy czy fokus jest TYLKO na polach tekstowych
      if (target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      )) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Sprawdzamy czy tracimy fokus z pola tekstowego
      if (target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      )) {
        // Sprawdzamy po opóźnieniu czy nowy element też jest polem tekstowym
        setTimeout(() => {
          const newActiveElement = document.activeElement as HTMLElement;
          const isNewElementInput = newActiveElement && (
            newActiveElement.tagName === 'INPUT' || 
            newActiveElement.tagName === 'TEXTAREA' || 
            newActiveElement.contentEditable === 'true'
          );
          
          // Ukrywamy navbar tylko jeśli nowy element NIE jest polem tekstowym
          if (!isNewElementInput) {
            setIsKeyboardOpen(false);
          }
        }, 100);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Jeśli naciśnięto Enter w polu tekstowym, nie ukrywaj navbar
      if (e.key === 'Enter' && target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      )) {
        // Zatrzymaj propagację i nie ukrywaj navbar
        e.stopPropagation();
        return;
      }
    };

    // Nasłuchujemy fokus TYLKO na polach tekstowych
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 sm:hidden bottom-nav transition-all duration-300 ${
      isKeyboardOpen ? 'scale-y-0 origin-bottom' : 'scale-y-100'
    }`}>
      <div className="flex justify-around items-center py-3">
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