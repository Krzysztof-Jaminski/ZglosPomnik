import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/:mode" element={<AuthPage />} />
          <Route path="/*" element={
            <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden flex flex-col max-w-full">
              <Header />
              
              <div className="flex flex-1 overflow-hidden w-full">
                <Sidebar />
                
                <main className="flex-1 overflow-hidden pb-10 sm:pb-0 w-full max-w-full">
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