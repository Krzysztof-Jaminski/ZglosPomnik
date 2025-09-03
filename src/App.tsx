import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
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

// Komponent do obsługi przycisku wstecz
const BackButtonHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = () => {
      // Jeśli jesteśmy na landing page, zamknij aplikację
      if (location.pathname === '/') {
        CapacitorApp.exitApp();
        return;
      }
      
      // W przeciwnym razie cofnij się w nawigacji
      navigate(-1);
    };

    // Nasłuchuj przycisku wstecz
    CapacitorApp.addListener('backButton', handleBackButton);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate, location.pathname]);

  return null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ThemeProvider>
      <Router>
        <BackButtonHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/:mode" element={<AuthPage />} />
          <Route path="/*" element={
            <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden flex flex-col max-w-full">
              <Header />
              
              <div className="flex flex-1 overflow-y-auto w-full">
                <Sidebar />
                
                <main className="flex-1 overflow-y-auto pb-20 sm:pb-0 w-full max-w-full">
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
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;