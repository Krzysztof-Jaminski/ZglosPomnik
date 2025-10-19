import React from 'react';
import { Settings, Key, Shield, LogOut } from 'lucide-react';
import { GlassButton } from '../UI/GlassButton';

interface ProfileSettingsProps {
  onPasswordChange: () => void;
  onAdminPanel: () => void;
  onLogout: () => void;
  className?: string;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  onPasswordChange,
  onAdminPanel,
  onLogout,
  className = ''
}) => {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50 ${className}`}>
      <div className="p-2 sm:p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-4 h-4 text-green-400" />
          <h3 className="font-semibold text-white text-sm">
            Ustawienia konta
          </h3>
        </div>
        
        <div className="space-y-1">
          <GlassButton
            onClick={onPasswordChange}
            variant="secondary"
            size="xs"
            className="w-full text-left py-1"
            icon={Key}
          >
            <span className="text-gray-300 text-xs">
              Zmień hasło
            </span>
          </GlassButton>
          
          <GlassButton
            onClick={onAdminPanel}
            variant="secondary"
            size="xs"
            className="w-full text-left py-1"
            icon={Shield}
          >
            <span className="text-gray-300 text-xs">
              Panel administratora
            </span>
          </GlassButton>
          
          <GlassButton
            onClick={onLogout}
            variant="danger"
            size="xs"
            className="w-full text-left py-1"
            icon={LogOut}
          >
            <span className="text-gray-300 text-xs">
              Wyloguj się
            </span>
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
