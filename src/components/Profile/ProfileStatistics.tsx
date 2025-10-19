import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ProfileStatisticsProps {
  submissionsCount: number;
  applicationsCount: number;
  className?: string;
}

export const ProfileStatistics: React.FC<ProfileStatisticsProps> = ({
  submissionsCount,
  applicationsCount,
  className = ''
}) => {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg mb-4 sm:mb-6 border border-gray-700/50 ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white text-lg">
            Statystyki
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800/30">
            <div className="text-2xl font-bold text-green-400">
              {submissionsCount}
            </div>
            <div className="text-sm text-gray-300">
              Zgłoszeń
            </div>
          </div>
          <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <div className="text-2xl font-bold text-blue-400">
              {applicationsCount}
            </div>
            <div className="text-sm text-gray-300">
              Wniosków
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
