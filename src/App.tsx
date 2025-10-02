import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { BottomNavigation } from './components/Layout/BottomNavigation';
import { MapPage } from './pages/MapPage';
import { ReportPage } from './pages/ReportPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { FeedPage } from './pages/FeedPage';
import { EncyclopediaPage } from './pages/EncyclopediaPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { App as CapacitorApp } from '@capacitor/app';
import { useKeyboardStatus } from './hooks/useKeyboardStatus';
import { useSystemTheme } from './hooks/useSystemTheme';

const MainContent: React.FC = () => {
  const isKeyboardOpen = useKeyboardStatus();
  const { actualTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Update system theme for main content (not landing page)
  useSystemTheme(actualTheme);

  // Obsługa przycisku wstecz
  useEffect(() => {
    const handleBackButton = () => {
      // Cofnij się w nawigacji
      navigate(-1);
    };

    // Nasłuchuj przycisku wstecz
    CapacitorApp.addListener('backButton', handleBackButton);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate]);

  return (
    <div id="app-layout" className="h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden flex flex-col max-w-full">
      <Header />
      
      <div className="flex flex-1 overflow-y-auto w-full">
        <Sidebar />
        
        <main className={`flex-1 overflow-y-auto w-full max-w-full transition-all duration-300 ${
          isKeyboardOpen ? 'pb-0' : 'pb-16 sm:pb-0'
        }`}>
          <Routes>
            <Route path="/map" element={<MapPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/encyclopedia" element={<EncyclopediaPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ModalProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/*" element={<MainContent />} />
              </Routes>
            </Router>
          </ModalProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;