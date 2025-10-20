import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
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
    console.log('MobileLandingPage: showAuthModal changed to:', showAuthModal);
    showAuthModalRef.current = showAuthModal;
  }, [showAuthModal]);

  // Debug: monitoruj zmiany w error
  useEffect(() => {
    console.log('MobileLandingPage: error changed to:', error);
  }, [error]);

  // Debug: monitoruj zmiany w showEmailConfirmation
  useEffect(() => {
    console.log('MobileLandingPage: showEmailConfirmation changed to:', showEmailConfirmation);
  }, [showEmailConfirmation]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      console.log('MobileLandingPage: Starting login, showAuthModal:', showAuthModal);
      setError(null);
      await login(credentials);
      console.log('MobileLandingPage: Login successful, closing modal');
      setShowAuthModal(false);
      navigate('/map');
    } catch (error: any) {
      console.log('MobileLandingPage: Login failed, setting error');
      console.log('MobileLandingPage: showAuthModal should still be true:', showAuthModal);
      console.log('MobileLandingPage: showAuthModalRef.current:', showAuthModalRef.current);
      
      // Opóźnij ustawienie błędu żeby zobaczyć czy to pomoże
      setTimeout(() => {
        console.log('MobileLandingPage: Setting error after timeout');
        setError('Sprawdź dane logowania'); // Ogólny komunikat dla bezpieczeństwa
        console.log('MobileLandingPage: Error set after timeout');
        
        // Upewnij się, że modal pozostaje otwarty
        if (!showAuthModalRef.current) {
          console.log('MobileLandingPage: Modal was closed, reopening it');
          setShowAuthModal(true);
        }
      }, 100);
      
      // Nie rzucamy błędu - Error Boundary by złapało i zresetowało komponent
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      console.log('MobileLandingPage: Starting registration...');
      setError(null);
      const response = await register(userData);
      console.log('MobileLandingPage: Registration response:', response);
      
      // Check if email verification is required
      if (response && response.requiresEmailVerification) {
        console.log('MobileLandingPage: Email verification required, showing modal');
        setUserEmail(userData.email); // Save user email for resend functionality
        setShowAuthModal(false);
        setShowEmailConfirmation(true);
        // Don't redirect - user needs to verify email first
        console.log('MobileLandingPage: Modal should be shown now');
      } else {
        console.log('MobileLandingPage: Normal registration, redirecting to map');
        // Normal registration - redirect to map (this should rarely happen)
        setShowAuthModal(false);
        navigate('/map');
      }
    } catch (error: any) {
      console.error('MobileLandingPage: Registration error:', error);
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
          <span className="text-green-600 dark:text-green-400">Pomnik</span>
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
