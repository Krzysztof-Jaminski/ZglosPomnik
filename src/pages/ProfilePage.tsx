import React, { useState } from 'react';
import { User, Mail, Phone, Bell, Settings, Edit, Save, X, LogOut, Calendar, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdditionalUserData {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false
  });
  
  // Dane użytkownika z API (dostępne)
  const userData = user ? {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    registrationDate: user.registrationDate,
    submissionsCount: user.submissionsCount,
    verificationsCount: user.verificationsCount
  } : null;
  
  // Dane użytkownika (nie dostępne w API - placeholder)
  const [additionalData, setAdditionalData] = useState({
    phone: 'Nie podano',
    address: 'Nie podano',
    city: 'Nie podano',
    postalCode: 'Nie podano'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(additionalData);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNotificationToggle = (type: 'push' | 'email') => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };



  const handleSaveData = () => {
    setShowPasswordModal(true);
  };

  const handleConfirmSave = () => {
    setAdditionalData(editData);
    setIsEditing(false);
    setShowPasswordModal(false);
    setConfirmPassword('');
  };

  const handleCancelEdit = () => {
    setEditData(additionalData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof AdditionalUserData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
  if (!userData) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nie jesteś zalogowany
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Zaloguj się aby zobaczyć swój profil
          </p>
          <GlassButton
            onClick={() => navigate('/?action=login')}
            variant="primary"
            size="md"
          >
            Zaloguj się
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
      <div className="max-w-2xl sm:max-w-none mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 sm:mb-4"
        >
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-green-900 dark:text-white">
              Profil użytkownika
            </h1>
          </div>
          <p className="text-base sm:text-lg text-green-800 dark:text-gray-400">
            Zarządzaj swoim kontem i ustawieniami
          </p>
        </motion.div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center overflow-hidden">
                  {userData.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {userData.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-base">
                    Członek od {new Date(userData.registrationDate).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
              
              <GlassButton
                onClick={() => setIsEditing(!isEditing)}
                variant="secondary"
                size="sm"
                icon={isEditing ? X : Edit}
              >
                <span className="text-base">
                  {isEditing ? 'Anuluj' : 'Edytuj'}
                </span>
              </GlassButton>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Uwaga:</strong> Imię, nazwisko i email można zmienić tylko przez administratora. 
                    Poniżej możesz edytować tylko dodatkowe informacje.
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    value={userData.name}
                    disabled
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                    Adres
                  </label>
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                      Miasto
                    </label>
                    <input
                      type="text"
                      value={editData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                      Kod pocztowy
                    </label>
                    <input
                      type="text"
                      value={editData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <GlassButton
                    onClick={handleCancelEdit}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    <span className="text-base">Anuluj</span>
                  </GlassButton>
                  <GlassButton
                    onClick={handleSaveData}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    icon={Save}
                  >
                    <span className="text-base">Zapisz</span>
                  </GlassButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">
                    {userData.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-500 text-base">
                    {additionalData.phone}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-500 text-base">
                    {additionalData.address}, {additionalData.city} {additionalData.postalCode}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">
                    Dołączył: {new Date(userData.registrationDate).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Statystyki
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userData.submissionsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Zgłoszeń
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userData.verificationsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Weryfikacji
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Powiadomienia
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Powiadomienia push
                </span>
                <button
                  onClick={() => handleNotificationToggle('push')}
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    notifications.push ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Powiadomienia email
                </span>
                <button
                  onClick={() => handleNotificationToggle('email')}
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    notifications.email ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Ustawienia konta
              </h3>
            </div>
            
            <div className="space-y-3">
              <GlassButton
                variant="secondary"
                size="xs"
                className="w-full text-left"
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Zmień hasło
                </span>
              </GlassButton>
              
              <GlassButton
                onClick={handleLogout}
                variant="danger"
                size="xs"
                className="w-full text-left"
                icon={LogOut}
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Wyloguj się
                </span>
              </GlassButton>
            </div>
          </div>
        </div>


        {/* Password Confirmation Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-800/20 backdrop-blur-md border border-green-400/20 rounded-xl shadow-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-green-900 dark:text-green-200 mb-3 font-semibold text-lg">
                Potwierdź zmiany
              </h3>
              <p className="text-green-800 dark:text-green-300 mb-4 text-base">
                Wprowadź hasło aby potwierdzić zmiany.
              </p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Hasło"
                className="w-full px-4 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 mb-4 text-base" 
              />
              <div className="flex space-x-3">
                <GlassButton
                  onClick={() => setShowPasswordModal(false)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <span className="text-base">Anuluj</span>
                </GlassButton>
                <GlassButton
                  onClick={handleConfirmSave}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  icon={Save}
                >
                  <span className="text-base">Potwierdź</span>
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};