import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  showAuthModal: boolean;
  authMode: 'login' | 'register';
  error: string | null;
  isLoading?: boolean;
  onClose: () => void;
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister: (userData: any) => Promise<void>;
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  showAuthModal,
  authMode,
  error,
  isLoading = false,
  onClose,
  onLogin,
  onRegister,
  onSwitchToLogin,
  onSwitchToRegister
}) => {
  return (
    <AnimatePresence>
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-w-md w-full"
          >
            <div className="relative rounded-xl p-1 shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-900 rounded-lg">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <img 
                        src="/logo.png" 
                        alt="ZgłośPomnik" 
                        className="w-10 h-10 sm:w-10 sm:h-10"
                      />
                      <h2 className="text-xl sm:text-xl font-bold text-white leading-none tracking-tight" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        <span className="text-blue-500">Zgłoś</span><span className="text-green-500">Pomnik</span>
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-green-400 hover:text-green-300 transition-colors duration-200 p-2 hover:bg-green-900/30 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {authMode === 'login' ? (
                      <LoginForm
                        onSubmit={onLogin}
                        onSwitchToRegister={onSwitchToRegister}
                        onClose={onClose}
                        error={error}
                      />
                    ) : (
                      <RegisterForm
                        onSubmit={onRegister}
                        onSwitchToLogin={onSwitchToLogin}
                        onClose={onClose}
                        error={error}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
