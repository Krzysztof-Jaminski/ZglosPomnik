import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';
import { useSystemTheme } from '../hooks/useSystemTheme';
import { AuthModal } from '../components/Auth/AuthModal';
import { EmailConfirmationModal } from '../components/Auth/EmailConfirmationModal';

export const MobileLandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Ref do przechowania stanu modala podczas błędów
  const showAuthModalRef = useRef(false);
  
  const { login, register, resendEmailVerification, isLoading } = useAuth();
  useSystemTheme('dark');

  // Debug: monitoruj zmiany w showAuthModal
  useEffect(() => {
    logger.log('MobileLandingPage: showAuthModal changed to:', showAuthModal);
    showAuthModalRef.current = showAuthModal;
  }, [showAuthModal]);

  // Debug: monitoruj zmiany w error
  useEffect(() => {
    logger.log('MobileLandingPage: error changed to:', error);
  }, [error]);

  // Debug: monitoruj zmiany w showEmailConfirmation
  useEffect(() => {
    logger.log('MobileLandingPage: showEmailConfirmation changed to:', showEmailConfirmation);
  }, [showEmailConfirmation]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      logger.log('MobileLandingPage: Starting login, showAuthModal:', showAuthModal);
      setError(null);
      await login(credentials);
      logger.log('MobileLandingPage: Login successful, closing modal');
      setShowAuthModal(false);
      navigate('/map');
    } catch (error: any) {
      logger.log('MobileLandingPage: Login failed, setting error');
      logger.log('MobileLandingPage: showAuthModal should still be true:', showAuthModal);
      logger.log('MobileLandingPage: showAuthModalRef.current:', showAuthModalRef.current);
      
      // Opóźnij ustawienie błędu żeby zobaczyć czy to pomoże
      setTimeout(() => {
        logger.log('MobileLandingPage: Setting error after timeout');
        setError('Sprawdź dane logowania'); // Ogólny komunikat dla bezpieczeństwa
        logger.log('MobileLandingPage: Error set after timeout');
        
        // Upewnij się, że modal pozostaje otwarty
        if (!showAuthModalRef.current) {
          logger.log('MobileLandingPage: Modal was closed, reopening it');
          setShowAuthModal(true);
        }
      }, 100);
      
      // Nie rzucamy błędu - Error Boundary by złapało i zresetowało komponent
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      logger.log('MobileLandingPage: Starting registration...');
      setError(null);
      const response = await register(userData);
      logger.log('MobileLandingPage: Registration response:', response);
      
      // Check if email verification is required
      if (response && response.requiresEmailVerification) {
        logger.log('MobileLandingPage: Email verification required, showing modal');
        logger.log('MobileLandingPage: Current showEmailConfirmation:', showEmailConfirmation);
        setUserEmail(userData.email); // Save user email for resend functionality
        
        // Use setTimeout to ensure state updates happen after current render
        setTimeout(() => {
          logger.log('MobileLandingPage: Setting showAuthModal to false');
          setShowAuthModal(false);
          logger.log('MobileLandingPage: Setting showEmailConfirmation to true');
          setShowEmailConfirmation(true);
          logger.log('MobileLandingPage: State updates queued');
        }, 0);
        
        logger.log('MobileLandingPage: Modal should be shown now');
      } else {
        logger.log('MobileLandingPage: Normal registration, redirecting to map');
        // Normal registration - redirect to map (this should rarely happen)
        setShowAuthModal(false);
        navigate('/map');
      }
    } catch (error: any) {
      logger.error('MobileLandingPage: Registration error:', error);
      setError('Sprawdź dane rejestracji'); // Ogólny komunikat dla bezpieczeństwa
    }
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  const closeEmailConfirmation = () => {
    setShowEmailConfirmation(false);
  };

  // Usunięto pełnoekranowy loading - teraz loading jest tylko w formularzu

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 pt-16">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="ZgłośPomnik Logo" 
            className="w-28 h-28 mx-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
          <span className="text-blue-600 dark:text-blue-500">Zgłoś</span>
          <span className="text-green-400">Pomnik</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-300 text-center max-w-sm">
          Najłatwiejszy sposób na zgłaszanie i ochronę pomników przyrody
        </p>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="px-6 pb-8">
        <div className="w-full max-w-sm space-y-3 mx-auto">
          <DarkGlassButton
            onClick={() => {
              setError(null); // Wyczyść błąd przy otwieraniu
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            variant="primary"
            size="md"
            className="w-full px-4 py-3 text-sm font-semibold"
          >
            Zaloguj się
          </DarkGlassButton>
          
          <DarkGlassButton
            onClick={() => {
              setError(null); // Wyczyść błąd przy otwieraniu
              setAuthMode('register');
              setShowAuthModal(true);
            }}
            variant="secondary"
            size="md"
            className="w-full px-4 py-3 text-sm font-semibold"
          >
            Zarejestruj się
          </DarkGlassButton>
        </div>
      </div>

      <AuthModal
        showAuthModal={showAuthModal}
        authMode={authMode}
        error={error}
        isLoading={isLoading}
        onClose={closeModal}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthMode('login')}
        onSwitchToRegister={() => setAuthMode('register')}
      />

      <EmailConfirmationModal
        showEmailConfirmation={showEmailConfirmation}
        email={userEmail}
        onClose={closeEmailConfirmation}
        onResendEmail={resendEmailVerification}
      />
    </div>
  );
};
