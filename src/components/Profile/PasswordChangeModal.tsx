import React from 'react';
import { Eye, EyeOff, Check, X as XIcon, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';

interface PasswordChangeModalProps {
  isOpen: boolean;
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  showPasswords: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  passwordValidation: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    passwordsMatch: boolean;
  };
  isChanging: boolean;
  onPasswordChange: (field: string, value: string) => void;
  onTogglePasswordVisibility: (field: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  passwordData,
  showPasswords,
  passwordValidation,
  isChanging,
  onPasswordChange,
  onTogglePasswordVisibility,
  onSave,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-md w-full"
      >
        <div className="relative rounded-xl p-1 shadow-lg" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
          padding: '2px'
        }}>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-white mb-3 font-semibold text-lg">
              Zmień hasło
            </h3>
            <p className="text-gray-300 mb-4 text-base">
              Wprowadź nowe hasło dla swojego konta.
            </p>
        <div className="space-y-4">
          {/* Aktualne hasło */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPasswords.current ? "text" : "password"}
              placeholder="Aktualne hasło"
              value={passwordData.currentPassword}
              onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 border-gray-600/50" 
            />
            <button
              type="button"
              onClick={() => onTogglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Nowe hasło */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPasswords.new ? "text" : "password"}
              placeholder="Nowe hasło"
              value={passwordData.newPassword}
              onChange={(e) => onPasswordChange('newPassword', e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 border-gray-600/50" 
            />
            <button
              type="button"
              onClick={() => onTogglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Potwierdzenie hasła */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPasswords.confirm ? "text" : "password"}
              placeholder="Potwierdź nowe hasło"
              value={passwordData.confirmPassword}
              onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 border-gray-600/50" 
            />
            <button
              type="button"
              onClick={() => onTogglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Wymagania hasła */}
          <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
            <h4 className="text-xs font-medium text-gray-300 mb-2">
              Wymagania hasła:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {passwordValidation.minLength ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <XIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.minLength ? 'text-green-400' : 'text-red-400'}`}>
                  Co najmniej 8 znaków
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.hasUppercase ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <XIcon className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.hasUppercase ? 'text-green-400' : 'text-red-400'}`}>
                  Co najmniej jedna wielka litera
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.hasLowercase ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <XIcon className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.hasLowercase ? 'text-green-400' : 'text-red-400'}`}>
                  Co najmniej jedna mała litera
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.hasNumber ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <XIcon className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.hasNumber ? 'text-green-400' : 'text-red-400'}`}>
                  Co najmniej jedna cyfra
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.hasSpecialChar ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <XIcon className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-red-400'}`}>
                  Co najmniej jeden znak specjalny
                </span>
              </div>
              {passwordData.confirmPassword && (
                <div className="flex items-center space-x-2">
                  {passwordValidation.passwordsMatch ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${passwordValidation.passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                    Hasła są identyczne
                  </span>
                </div>
              )}
            </div>
          </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <GlassButton
                onClick={onCancel}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <span className="text-sm">Anuluj</span>
              </GlassButton>
              <GlassButton
                onClick={onSave}
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={isChanging}
              >
                <span className="text-sm">
                  {isChanging ? 'Zmienianie...' : 'Zapisz'}
                </span>
              </GlassButton>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
