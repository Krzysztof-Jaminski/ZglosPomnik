import React from 'react';
import { Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-xl p-1 shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">
                    Zmień hasło
                  </h3>
                  <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
                  Wprowadź nowe hasło dla swojego konta.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {/* Aktualne hasło */}
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="Aktualne hasło"
                      value={passwordData.currentPassword}
                      onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => onTogglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Nowe hasło */}
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="Nowe hasło"
                      value={passwordData.newPassword}
                      onChange={(e) => onPasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => onTogglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Potwierdzenie hasła */}
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Potwierdź nowe hasło"
                      value={passwordData.confirmPassword}
                      onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => onTogglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Wymagania hasła */}
                  <div className="mt-3 p-2 sm:p-3 bg-white/10 dark:bg-gray-800/30 rounded-lg border border-gray-300 dark:border-gray-600/30">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wymagania hasła:
                    </h4>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center space-x-2">
                        {passwordValidation.minLength ? (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xs ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej 6 znaków (maksymalnie 100)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.hasUppercase ? (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xs ${passwordValidation.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej jedna wielka litera
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.hasLowercase ? (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xs ${passwordValidation.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej jedna mała litera
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.hasNumber ? (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xs ${passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej jedna cyfra
                        </span>
                      </div>
                      {passwordData.confirmPassword && (
                        <div className="flex items-center space-x-2">
                          {passwordValidation.passwordsMatch ? (
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                          )}
                          <span className={`text-xs ${passwordValidation.passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            Hasła są identyczne
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                  <GlassButton
                    onClick={onCancel}
                    variant="secondary"
                    size="xs"
                    className="flex-1"
                  >
                    <span className="text-xs">Anuluj</span>
                  </GlassButton>
                  <GlassButton
                    onClick={onSave}
                    variant="primary"
                    size="xs"
                    className="flex-1"
                    disabled={isChanging}
                  >
                    <span className="text-xs">
                      {isChanging ? 'Zmienianie...' : 'Zapisz'}
                    </span>
                  </GlassButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
