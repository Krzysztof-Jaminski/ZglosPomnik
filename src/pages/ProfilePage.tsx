import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { GlassButton } from '../components/UI/GlassButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { ProfileInfo } from '../components/Profile/ProfileInfo';
import { ProfileStatistics } from '../components/Profile/ProfileStatistics';
import { ProfileSettings } from '../components/Profile/ProfileSettings';
import { PasswordChangeModal } from '../components/Profile/PasswordChangeModal';
import { LogoutModal } from '../components/Profile/LogoutModal';

interface AdditionalUserData {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface OrganizationData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { triggerLightHaptic, triggerMediumHaptic, triggerNotificationHaptic } = useHapticFeedback();
  const [fullUserData, setFullUserData] = useState(user);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dane użytkownika z API (dostępne)
  const userData = fullUserData ? {
    name: fullUserData.name,
    email: fullUserData.email,
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
  
  // Dane organizacji z API
  const [organizationData, setOrganizationData] = useState({
    name: fullUserData?.organization?.name || 'Nie podano',
    address: fullUserData?.organization?.address || 'Nie podano',
    city: fullUserData?.organization?.city || 'Nie podano',
    postalCode: fullUserData?.organization?.postalCode || 'Nie podano',
    phone: fullUserData?.organization?.phone || 'Nie podano',
    email: fullUserData?.organization?.email || 'Nie podano'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(additionalData);
  const [editOrganizationData, setEditOrganizationData] = useState(organizationData);
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
      
      // Pokaż animację ładowania tylko po 500ms
      let loadingTimeout: NodeJS.Timeout | undefined;
      
      try {
        setIsLoadingProfile(true);
        
        loadingTimeout = setTimeout(() => {
          setShowLoadingAnimation(true);
        }, 500);
        
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
        
        setFullUserData(userData);
        
        // Aktualizuj dodatkowe dane - dla wyświetlania używamy "Nie podano" jeśli puste
        setAdditionalData({
          phone: userData.phone || 'Nie podano',
          address: userData.address || 'Nie podano',
          city: userData.city || 'Nie podano',
          postalCode: userData.postalCode || 'Nie podano'
        });
        
        // Aktualizuj dane organizacji - dla wyświetlania używamy "Nie podano" jeśli puste
        setOrganizationData({
          name: userData.organization?.name || 'Nie podano',
          address: userData.organization?.address || 'Nie podano',
          city: userData.organization?.city || 'Nie podano',
          postalCode: userData.organization?.postalCode || 'Nie podano',
          phone: userData.organization?.phone || 'Nie podano',
          email: userData.organization?.email || 'Nie podano'
        });
        
        // Dla edycji używamy pustych stringów jeśli dane są puste
        setEditData({
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          postalCode: userData.postalCode || ''
        });
        
        // Dla edycji organizacji używamy pustych stringów jeśli dane są puste
        setEditOrganizationData({
          name: userData.organization?.name || '',
          address: userData.organization?.address || '',
          city: userData.organization?.city || '',
          postalCode: userData.organization?.postalCode || '',
          phone: userData.organization?.phone || '',
          email: userData.organization?.email || ''
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
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          postalCode: user.postalCode || ''
        });
      } finally {
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        setShowLoadingAnimation(false);
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [user]);




  const handleSaveData = () => {
    triggerMediumHaptic();
    handleConfirmSave();
  };

  const handleConfirmSave = async () => {
    if (!fullUserData) return;
    
    try {
      setIsSaving(true);
      
      // Przygotuj dane do wysłania na serwer - API wymaga wszystkich pól
      const updateData: any = {};
      
      // Zawsze wysyłaj wszystkie pola, nawet jeśli są puste
      updateData.phone = editData.phone;
      updateData.address = editData.address;
      updateData.city = editData.city;
      updateData.postalCode = editData.postalCode;
      
      // Dodaj dane organizacji jeśli są dostępne
      if (fullUserData?.organization) {
        updateData.organization = {
          name: editOrganizationData.name,
          address: editOrganizationData.address,
          city: editOrganizationData.city,
          postalCode: editOrganizationData.postalCode,
          phone: editOrganizationData.phone,
          email: editOrganizationData.email
        };
      }

      console.log('ProfilePage: Preparing update data:', updateData);
      console.log('ProfilePage: Original editData:', editData);
      console.log('ProfilePage: Original editOrganizationData:', editOrganizationData);

      // Use the new API endpoint for updating user data
      const { authService } = await import('../services/authService');
      const updatedUserData = await authService.updateUserData({
        phone: updateData.phone,
        address: updateData.address,
        city: updateData.city,
        postalCode: updateData.postalCode,
        organization: updateData.organization
      });
      
      setFullUserData(updatedUserData);
      // Aktualizuj additionalData z "Nie podano" dla pustych pól
      setAdditionalData({
        phone: editData.phone || 'Nie podano',
        address: editData.address || 'Nie podano',
        city: editData.city || 'Nie podano',
        postalCode: editData.postalCode || 'Nie podano'
      });
      
      // Aktualizuj organizationData z "Nie podano" dla pustych pól
      if (updatedUserData.organization) {
        setOrganizationData({
          name: editOrganizationData.name || 'Nie podano',
          address: editOrganizationData.address || 'Nie podano',
          city: editOrganizationData.city || 'Nie podano',
          postalCode: editOrganizationData.postalCode || 'Nie podano',
          phone: editOrganizationData.phone || 'Nie podano',
          email: editOrganizationData.email || 'Nie podano'
        });
      }
      
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
    // Resetuj do pustych stringów zamiast "Nie podano"
    setEditData({
      phone: fullUserData?.phone || '',
      address: fullUserData?.address || '',
      city: fullUserData?.city || '',
      postalCode: fullUserData?.postalCode || ''
    });
    
    // Resetuj dane organizacji
    setEditOrganizationData({
      name: fullUserData?.organization?.name || '',
      address: fullUserData?.organization?.address || '',
      city: fullUserData?.organization?.city || '',
      postalCode: fullUserData?.organization?.postalCode || '',
      phone: fullUserData?.organization?.phone || '',
      email: fullUserData?.organization?.email || ''
    });
    
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof AdditionalUserData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrganizationInputChange = (field: keyof OrganizationData, value: string) => {
    setEditOrganizationData(prev => ({
      ...prev,
      [field]: value
    }));
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
      minLength: password.length >= 6 && password.length <= 100,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: true // Wyłączone - nie wymagamy znaków specjalnych
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
    
    if (passwordData.newPassword.length < 6 || passwordData.newPassword.length > 100) {
      alert('Nowe hasło musi mieć od 6 do 100 znaków');
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

      const loginData = await loginResponse.json();

      // Use the new API endpoint for changing password
      const { authService } = await import('../services/authService');
      await authService.changePassword({
        token: loginData.token, // Używamy tokenu z odpowiedzi logowania
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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

  // Jeśli ładujemy dane profilu i minęło wystarczająco czasu
  if (isLoadingProfile && showLoadingAnimation) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Ładowanie profilu...
          </h2>
          <p className="text-gray-300">
            Pobieranie danych użytkownika
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProfileHeader />

        <ProfileInfo
          userData={userData}
          additionalData={additionalData}
          organizationData={organizationData}
          isEditing={isEditing}
          editData={editData}
          editOrganizationData={editOrganizationData}
          isSaving={isSaving}
          onEditToggle={() => {
                   triggerLightHaptic();
                   setIsEditing(!isEditing);
                 }}
          onInputChange={handleInputChange}
          onOrganizationInputChange={handleOrganizationInputChange}
          onSave={handleSaveData}
          onCancel={handleCancelEdit}
        />

        <ProfileStatistics
          submissionsCount={userData.submissionsCount}
          applicationsCount={userData.applicationsCount}
        />

        <ProfileSettings
          onPasswordChange={() => {
                   triggerLightHaptic();
                   setShowChangePasswordModal(true);
                 }}
          onAdminPanel={() => {
                   triggerLightHaptic();
                   navigate('/admin');
                 }}
          onLogout={handleLogout}
        />

        <PasswordChangeModal
          isOpen={showChangePasswordModal}
          passwordData={passwordData}
          showPasswords={showPasswords}
          passwordValidation={passwordValidation}
          isChanging={isChangingPassword}
          onPasswordChange={(field: string, value: string) => handlePasswordChange(field as keyof typeof passwordData, value)}
          onTogglePasswordVisibility={(field: string) => togglePasswordVisibility(field as keyof typeof showPasswords)}
          onSave={() => {
            triggerMediumHaptic();
            handleChangePassword();
          }}
          onCancel={() => {
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
        />

        <LogoutModal
          isOpen={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={() => {
                    triggerLightHaptic();
                    setShowLogoutModal(false);
                  }}
        />
      </div>
    </div>
  );
};
