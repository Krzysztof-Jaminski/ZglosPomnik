import React from 'react';
import { Key, Shield, LogOut } from 'lucide-react';
import { GlassButton } from '../UI/GlassButton';

interface ProfileStatisticsAndSettingsProps {
  submissionsCount: number;
  applicationsCount: number;
  onPasswordChange: () => void;
  onAdminPanel?: () => void;
  onLogout: () => void;
  className?: string;
}

export const ProfileStatisticsAndSettings: React.FC<ProfileStatisticsAndSettingsProps> = ({
  submissionsCount,
  applicationsCount,
  onPasswordChange,
  onAdminPanel,
  onLogout,
  className = ''
}) => {
  return (
    <div className={`relative rounded-xl p-1 shadow-lg mb-2 sm:mb-3 ${className}`} style={{
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
      padding: '2px'
    }}>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="p-2 sm:p-3">
          {/* Statystyki */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-2">
              Statystyki
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                  {submissionsCount}
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Zgłoszeń
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {applicationsCount}
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Wniosków
                </div>
              </div>
            </div>
          </div>

          {/* Ustawienia konta */}
          <div className="pt-3 border-t border-gray-300 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-2">
              Ustawienia konta
            </h3>
            
            <div className="space-y-1">
              <GlassButton
                onClick={onPasswordChange}
                variant="secondary"
                size="xs"
                className="w-full"
                icon={Key}
              >
                <span className="text-xs">Zmień hasło</span>
              </GlassButton>
              
              {onAdminPanel && (
                <GlassButton
                  onClick={onAdminPanel}
                  variant="secondary"
                  size="xs"
                  className="w-full"
                  icon={Shield}
                >
                  <span className="text-xs">Panel administratora</span>
                </GlassButton>
              )}
              
              <GlassButton
                onClick={onLogout}
                variant="danger"
                size="xs"
                className="w-full"
                icon={LogOut}
              >
                <span className="text-xs">Wyloguj się</span>
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

