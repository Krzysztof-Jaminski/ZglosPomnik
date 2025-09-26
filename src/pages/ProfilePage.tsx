import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Bell, Settings, Edit, Save, X, LogOut, Calendar, BarChart3, Key, Shield, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface AdditionalUserData {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { triggerLightHaptic, triggerMediumHaptic, triggerNotificationHaptic } = useHapticFeedback();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false
  });
  const [fullUserData, setFullUserData] = useState(user);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dane użytkownika z API (dostępne)
  const userData = fullUserData ? {
    name: fullUserData.name,
    email: fullUserData.email,
    avatar: fullUserData.avatar,
    registrationDate: fullUserData.registrationDate,
    submissionsCount: fullUserData.statistics.submissionCount,
    applicationsCount: fullUserData.statistics.applicationCount
  } : null;
  
  // Dane użytkownika z API
  const [additionalData, setAdditionalData] = useState({
    phone: fullUserData?.phone || 'Nie podano',
    address: fullUserData?.address || 'Nie podano',
    city: fullUserData?.city || 'Nie podano',
    postalCode: fullUserData?.postalCode || 'Nie podano'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(additionalData);
  const [editBasicData, setEditBasicData] = useState({
    name: '',
    email: ''
  });
  const [editAvatar, setEditAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  // Pobierz pełne dane użytkownika z endpointu /api/Users/current
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoadingProfile(true);
        console.log('Fetching user data from /api/Users/current...');
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Users/current`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        console.log('User data received from /api/Users/current:', userData);
        
        setFullUserData(userData);
        
        // Aktualizuj dodatkowe dane
        setAdditionalData({
          phone: userData.phone || 'Nie podano',
          address: userData.address || 'Nie podano',
          city: userData.city || 'Nie podano',
          postalCode: userData.postalCode || 'Nie podano'
        });
        
        setEditData({
          phone: userData.phone || 'Nie podano',
          address: userData.address || 'Nie podano',
          city: userData.city || 'Nie podano',
          postalCode: userData.postalCode || 'Nie podano'
        });
        
        setEditAvatar(userData.avatar || '');
        setEditBasicData({
          name: userData.name || '',
          email: userData.email || ''
        });

        // Zapisz zaktualizowane dane do localStorage
        localStorage.setItem('user_data', JSON.stringify(userData));
        
      } catch (error) {
        console.error('Failed to fetch user data from /api/Users/current:', error);
        // W przypadku błędu, użyj danych z kontekstu
        setFullUserData(user);
        
        setAdditionalData({
          phone: user.phone || 'Nie podano',
          address: user.address || 'Nie podano',
          city: user.city || 'Nie podano',
          postalCode: user.postalCode || 'Nie podano'
        });
        
        setEditData({
          phone: user.phone || 'Nie podano',
          address: user.address || 'Nie podano',
          city: user.city || 'Nie podano',
          postalCode: user.postalCode || 'Nie podano'
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleNotificationToggle = (type: 'push' | 'email') => {
    triggerLightHaptic();
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };



  const handleSaveData = () => {
    triggerMediumHaptic();
    handleConfirmSave();
  };

  const handleConfirmSave = async () => {
    if (!fullUserData) return;
    
    try {
      setIsSaving(true);
      
      // Upload avatara jeśli został wybrany nowy plik
      let avatarUrl = editAvatar;
      if (avatarFile) {
        setIsUploadingAvatar(true);
        // TODO: Implement avatar upload to backend API
        // For now, create a local URL for preview
        avatarUrl = URL.createObjectURL(avatarFile);
        console.log('Avatar prepared for upload:', avatarUrl);
        setIsUploadingAvatar(false);
      }
      
      // Przygotuj dane do wysłania na serwer
      const updateData: any = {};
      
      // Podstawowe dane
      if (editBasicData.name.trim() !== '') {
        updateData.name = editBasicData.name;
      }
      
      if (editBasicData.email.trim() !== '') {
        updateData.email = editBasicData.email;
      }
      
      // Dodatkowe dane
      if (editData.phone !== 'Nie podano' && editData.phone.trim() !== '') {
        updateData.phone = editData.phone;
      }
      
      if (editData.address !== 'Nie podano' && editData.address.trim() !== '') {
        updateData.address = editData.address;
      }
      
      if (editData.city !== 'Nie podano' && editData.city.trim() !== '') {
        updateData.city = editData.city;
      }
      
      if (editData.postalCode !== 'Nie podano' && editData.postalCode.trim() !== '') {
        updateData.postalCode = editData.postalCode;
      }
      
      if (avatarUrl && avatarUrl.trim() !== '') {
        updateData.avatar = avatarUrl;
      }

      console.log('Sending user update to server:', updateData);

      // Use the new API endpoint for updating user data
      const { authService } = await import('../services/authService');
      const updatedUserData = await authService.updateUserData({
        phone: updateData.phone,
        address: updateData.address,
        city: updateData.city,
        postalCode: updateData.postalCode,
        avatar: updateData.avatar
      });
      
      setFullUserData(updatedUserData);
      setAdditionalData(editData);
      
      // Zapisz do localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUserData));
      
      setIsEditing(false);
      
      // Pokaż komunikat o udanym zapisie
      triggerNotificationHaptic('success');
      alert('Zmiany zostały pomyślnie zapisane na serwerze!');
      
    } catch (error) {
      console.error('Failed to update user data:', error);
      triggerNotificationHaptic('error');
      alert('Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    triggerLightHaptic();
    setEditData(additionalData);
    setEditAvatar(fullUserData?.avatar || '');
    setEditBasicData({
      name: fullUserData?.name || '',
      email: fullUserData?.email || ''
    });
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof AdditionalUserData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Sprawdź czy to obraz
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Proszę wybrać plik obrazu (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      // Sprawdź rozmiar pliku (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Plik jest za duży. Maksymalny rozmiar to 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Utwórz podgląd
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    triggerMediumHaptic();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    triggerNotificationHaptic('success');
    logout(true); // true = ręczne wylogowanie, wyczyści localStorage
    navigate('/');
  };

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Walidacja w czasie rzeczywistym
    if (field === 'newPassword') {
      validatePassword(value);
    } else if (field === 'confirmPassword') {
      validatePasswordMatch(passwordData.newPassword, value);
    }
  };

  const validatePassword = (password: string) => {
    setPasswordValidation(prev => ({
      ...prev,
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }));
  };

  const validatePasswordMatch = (newPassword: string, confirmPassword: string) => {
    setPasswordValidation(prev => ({
      ...prev,
      passwordsMatch: newPassword === confirmPassword && newPassword.length > 0
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    // Walidacja
    if (!passwordData.currentPassword.trim()) {
      alert('Wprowadź aktualne hasło');
      return;
    }
    
    if (!passwordData.newPassword.trim()) {
      alert('Wprowadź nowe hasło');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Nowe hasło musi mieć co najmniej 8 znaków');
      return;
    }
    
    // Sprawdź wszystkie warunki hasła
    const allConditionsMet = Object.values(passwordValidation).every(condition => condition);
    if (!allConditionsMet) {
      alert('Nowe hasło nie spełnia wszystkich wymagań');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Nowe hasła nie są identyczne');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      alert('Nowe hasło musi być inne od aktualnego');
      return;
    }

    try {
      setIsChangingPassword(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Brak tokenu autoryzacji');
        return;
      }

      // Sprawdź czy aktualne hasło jest poprawne - logujemy się ponownie
      const loginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({
          email: fullUserData?.email,
          password: passwordData.currentPassword
        })
      });

      if (!loginResponse.ok) {
        alert('Aktualne hasło jest niepoprawne');
        return;
      }

      // Use the new API endpoint for changing password
      const { authService } = await import('../services/authService');
      await authService.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword
      });

      // Wyczyść formularz i zamknij modal
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordValidation({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
      setShowChangePasswordModal(false);
      
      triggerNotificationHaptic('success');
      alert('Hasło zostało pomyślnie zmienione!');
      
    } catch (error) {
      console.error('Failed to change password:', error);
      triggerNotificationHaptic('error');
      alert('Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.');
    } finally {
      setIsChangingPassword(false);
    }
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

  // Jeśli ładujemy dane profilu
  if (isLoadingProfile) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Ładowanie profilu...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Pobieranie danych użytkownika
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                onClick={() => {
                  triggerLightHaptic();
                  setIsEditing(!isEditing);
                }}
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
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Informacja:</strong> Możesz edytować wszystkie swoje dane. 
                    Zmiany są zapisywane na serwerze.
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    value={editBasicData.name}
                    onChange={(e) => setEditBasicData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editBasicData.email}
                    onChange={(e) => setEditBasicData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-base">
                    Avatar
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Obsługiwane formaty: JPEG, PNG, GIF, WebP. Maksymalny rozmiar: 5MB
                    </p>
                    {editAvatar && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Podgląd:</p>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={editAvatar} 
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              const nextElement = target.nextElementSibling as HTMLElement;
                              target.style.display = 'none';
                              if (nextElement) nextElement.style.display = 'flex';
                            }}
                          />
                          <User className="w-6 h-6 text-gray-400 hidden" />
                        </div>
                      </div>
                    )}
                  </div>
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
                    <span className="text-sm">Anuluj</span>
                  </GlassButton>
                  <GlassButton
                    onClick={handleSaveData}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    icon={Save}
                    disabled={isSaving}
                  >
                    <span className="text-base">
                      {isSaving ? (isUploadingAvatar ? 'Przesyłanie avatara...' : 'Zapisywanie...') : 'Zapisz'}
                    </span>
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
                  <span className="text-gray-700 dark:text-gray-300 text-base">
                    {additionalData.phone}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">
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
                  {userData.applicationsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Wniosków
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
                onClick={() => {
                  triggerLightHaptic();
                  setShowChangePasswordModal(true);
                }}
                variant="secondary"
                size="xs"
                className="w-full text-left"
                icon={Key}
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Zmień hasło
                </span>
              </GlassButton>
              
              <GlassButton
                onClick={() => {
                  triggerLightHaptic();
                  navigate('/admin');
                }}
                variant="secondary"
                size="xs"
                className="w-full text-left"
                icon={Shield}
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Panel administratora
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



        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-gray-900 dark:text-white mb-3 font-semibold text-lg">
                Zmień hasło
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                Wprowadź nowe hasło dla swojego konta.
              </p>
              <div className="space-y-4">
                {/* Aktualne hasło */}
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Aktualne hasło"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base" 
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Nowe hasło */}
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Nowe hasło"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base" 
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Potwierdzenie hasła */}
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Potwierdź nowe hasło"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base" 
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Wymagania hasła */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Wymagania hasła:
                  </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {passwordValidation.minLength ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <XIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej 8 znaków
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.hasUppercase ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <XIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${passwordValidation.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej jedna wielka litera
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.hasLowercase ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <XIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${passwordValidation.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej jedna mała litera
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.hasNumber ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <XIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej jedna cyfra
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.hasSpecialChar ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <XIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Co najmniej jeden znak specjalny
                        </span>
                      </div>
                      {passwordData.confirmPassword && (
                        <div className="flex items-center space-x-2">
                          {passwordValidation.passwordsMatch ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <XIcon className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordValidation.passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            Hasła są identyczne
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <GlassButton
                  onClick={() => {
                    triggerLightHaptic();
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordValidation({
                      minLength: false,
                      hasUppercase: false,
                      hasLowercase: false,
                      hasNumber: false,
                      hasSpecialChar: false,
                      passwordsMatch: false
                    });
                    setShowPasswords({
                      current: false,
                      new: false,
                      confirm: false
                    });
                    setShowChangePasswordModal(false);
                  }}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <span className="text-sm">Anuluj</span>
                </GlassButton>
                <GlassButton
                  onClick={() => {
                    triggerMediumHaptic();
                    handleChangePassword();
                  }}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  icon={Save}
                  disabled={isChangingPassword}
                >
                  <span className="text-base">
                    {isChangingPassword ? 'Zmienianie...' : 'Zapisz'}
                  </span>
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-gray-900 dark:text-white mb-3 font-semibold text-lg">
                Potwierdź wylogowanie
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                Czy na pewno chcesz się wylogować?
              </p>
              <div className="flex space-x-3">
                <GlassButton
                  onClick={() => {
                    triggerLightHaptic();
                    setShowLogoutModal(false);
                  }}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <span className="text-sm">Anuluj</span>
                </GlassButton>
                <GlassButton
                  onClick={confirmLogout}
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  icon={LogOut}
                >
                  <span className="text-xs">Wyloguj się</span>
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
