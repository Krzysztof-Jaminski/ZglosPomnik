import React, { useState } from 'react';
import { Check, X as XIcon, User } from 'lucide-react';
import { GlassButton } from '../UI/GlassButton';

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
  krs?: string;
  regon?: string;
  correspondence?: {
    poBox?: number;
    address?: string;
    postalCode?: string;
    city?: string;
  };
}

interface ProfileInfoProps {
  userData: {
    name: string;
    email: string;
    registrationDate: string;
  };
  additionalData: AdditionalUserData;
  organizationData?: OrganizationData;
  isEditing: boolean;
  editData: AdditionalUserData;
  editOrganizationData?: OrganizationData;
  isSaving: boolean;
  onEditToggle: () => void;
  onInputChange: (field: keyof AdditionalUserData, value: string) => void;
  onOrganizationInputChange?: (field: keyof OrganizationData, value: string | number | OrganizationData['correspondence']) => void;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

interface ValidationState {
  phone: { isValid: boolean; message: string };
  address: { isValid: boolean; message: string };
  city: { isValid: boolean; message: string };
  postalCode: { isValid: boolean; message: string };
  organizationPhone: { isValid: boolean; message: string };
  organizationAddress: { isValid: boolean; message: string };
  organizationCity: { isValid: boolean; message: string };
  organizationPostalCode: { isValid: boolean; message: string };
  organizationName: { isValid: boolean; message: string };
  organizationEmail: { isValid: boolean; message: string };
  organizationKrs: { isValid: boolean; message: string };
  organizationRegon: { isValid: boolean; message: string };
  organizationCorrespondenceAddress: { isValid: boolean; message: string };
  organizationCorrespondenceCity: { isValid: boolean; message: string };
  organizationCorrespondencePostalCode: { isValid: boolean; message: string };
  organizationCorrespondencePoBox: { isValid: boolean; message: string };
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  userData,
  additionalData,
  organizationData,
  isEditing,
  editData,
  editOrganizationData,
  isSaving,
  onEditToggle,
  onInputChange,
  onOrganizationInputChange,
  onSave,
  onCancel,
  className = ''
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    phone: { isValid: true, message: '' },
    address: { isValid: true, message: '' },
    city: { isValid: true, message: '' },
    postalCode: { isValid: true, message: '' },
    organizationPhone: { isValid: true, message: '' },
    organizationAddress: { isValid: true, message: '' },
    organizationCity: { isValid: true, message: '' },
    organizationPostalCode: { isValid: true, message: '' },
    organizationName: { isValid: true, message: '' },
    organizationEmail: { isValid: true, message: '' },
    organizationKrs: { isValid: true, message: '' },
    organizationRegon: { isValid: true, message: '' },
    organizationCorrespondenceAddress: { isValid: true, message: '' },
    organizationCorrespondenceCity: { isValid: true, message: '' },
    organizationCorrespondencePostalCode: { isValid: true, message: '' },
    organizationCorrespondencePoBox: { isValid: true, message: '' }
  });
  
  // Sprawdź, czy wszystkie wymagane pola organizacji są wypełnione
  const isOrganizationValid = () => {
    if (!editOrganizationData) return true; // Jeśli nie ma organizacji, walidacja przechodzi
    
    const email = editOrganizationData.email?.trim() || '';
    const krs = editOrganizationData.krs?.trim() || '';
    const regon = editOrganizationData.regon?.trim() || '';
    
    const emailValid = email !== '' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const krsValid = krs !== '' && krs.replace(/\D/g, '').length === 9;
    const regonValid = regon !== '' && regon.replace(/\D/g, '').length === 9;
    
    return emailValid && krsValid && regonValid;
  };
  
  const canSave = isOrganizationValid();
  
  const handleSaveClick = () => {
    if (!canSave) {
      return;
    }
    onSave();
  };

  const validateField = (fieldName: keyof AdditionalUserData, value: string) => {
    switch (fieldName) {
      case 'phone':
        // Telefon jest opcjonalny, więc walidujemy tylko jeśli jest wypełniony
        const phoneRegex = /^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/;
        const phoneValid = value === '' || (phoneRegex.test(value) && value.length <= 20);
        
        let phoneMessage = '';
        if (value && !phoneValid) {
          if (value.length > 20) {
            phoneMessage = 'Numer telefonu nie może mieć więcej niż 20 znaków';
          } else if (!phoneRegex.test(value)) {
            phoneMessage = 'Nieprawidłowy format numeru telefonu';
          }
        }
        
        setValidation(prev => ({
          ...prev,
          phone: {
            isValid: phoneValid,
            message: phoneMessage
          }
        }));
        break;
        
      case 'address':
        const addressValid = value.length <= 100;
        setValidation(prev => ({
          ...prev,
          address: {
            isValid: addressValid,
            message: addressValid ? '' : 'Adres nie może mieć więcej niż 100 znaków'
          }
        }));
        break;
        
      case 'city':
        const cityValid = value.length <= 50;
        setValidation(prev => ({
          ...prev,
          city: {
            isValid: cityValid,
            message: cityValid ? '' : 'Miasto nie może mieć więcej niż 50 znaków'
          }
        }));
        break;
        
      case 'postalCode':
        const postalCodeRegex = /^\d{2}-\d{3}$|^\d{5}$/;
        const postalCodeValid = value === '' || postalCodeRegex.test(value);
        setValidation(prev => ({
          ...prev,
          postalCode: {
            isValid: postalCodeValid,
            message: postalCodeValid ? '' : 'Nieprawidłowy format kodu pocztowego (np. 12-345 lub 12345)'
          }
        }));
        break;
    }
  };

  const validateOrganizationField = (fieldName: keyof OrganizationData, value: string | number | OrganizationData['correspondence']) => {
    if (fieldName === 'correspondence' && typeof value === 'object') {
      // Validate correspondence fields
      const corr = value;
      
      if (corr?.address !== undefined) {
        const addressValid = !corr.address || corr.address.length <= 150;
        setValidation(prev => ({
          ...prev,
          organizationCorrespondenceAddress: {
            isValid: addressValid,
            message: addressValid ? '' : 'Adres nie może mieć więcej niż 150 znaków'
          }
        }));
      }
      
      if (corr?.city !== undefined) {
        const cityValid = !corr.city || corr.city.length <= 100;
        setValidation(prev => ({
          ...prev,
          organizationCorrespondenceCity: {
            isValid: cityValid,
            message: cityValid ? '' : 'Miasto nie może mieć więcej niż 100 znaków'
          }
        }));
      }
      
      if (corr?.postalCode !== undefined) {
        const postalCodeRegex = /^\d{2}-\d{3}$|^\d{5}$/;
        const postalCodeValid = !corr.postalCode || postalCodeRegex.test(corr.postalCode);
        setValidation(prev => ({
          ...prev,
          organizationCorrespondencePostalCode: {
            isValid: postalCodeValid,
            message: postalCodeValid ? '' : 'Nieprawidłowy format kodu pocztowego (np. 12-345 lub 12345)'
          }
        }));
      }
      
      if (corr?.poBox !== undefined) {
        const poBoxValid = corr.poBox === undefined || corr.poBox === null || corr.poBox === 0 || (typeof corr.poBox === 'number' && corr.poBox > 0 && corr.poBox <= 999999);
        setValidation(prev => ({
          ...prev,
          organizationCorrespondencePoBox: {
            isValid: poBoxValid,
            message: poBoxValid ? '' : 'Skrytka pocztowa musi być liczbą od 1 do 999999'
          }
        }));
      }
      
      return;
    }
    
    if (typeof value !== 'string') return;
    
    switch (fieldName) {
      case 'phone':
        // Telefon organizacji - te same wymagania co dla użytkownika
        const phoneRegex = /^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/;
        const phoneValid = value === '' || (phoneRegex.test(value) && value.length <= 20);
        
        let phoneMessage = '';
        if (value && !phoneValid) {
          if (value.length > 20) {
            phoneMessage = 'Numer telefonu nie może mieć więcej niż 20 znaków';
          } else if (!phoneRegex.test(value)) {
            phoneMessage = 'Nieprawidłowy format numeru telefonu';
          }
        }
        
        setValidation(prev => ({
          ...prev,
          organizationPhone: {
            isValid: phoneValid,
            message: phoneMessage
          }
        }));
        break;
        
      case 'address':
        const addressValid = value.length <= 150;
        setValidation(prev => ({
          ...prev,
          organizationAddress: {
            isValid: addressValid,
            message: addressValid ? '' : 'Adres nie może mieć więcej niż 150 znaków'
          }
        }));
        break;
        
      case 'city':
        const cityValid = value.length <= 100;
        setValidation(prev => ({
          ...prev,
          organizationCity: {
            isValid: cityValid,
            message: cityValid ? '' : 'Miasto nie może mieć więcej niż 100 znaków'
          }
        }));
        break;
        
      case 'postalCode':
        const postalCodeRegex = /^\d{2}-\d{3}$|^\d{5}$/;
        const postalCodeValid = value === '' || postalCodeRegex.test(value);
        setValidation(prev => ({
          ...prev,
          organizationPostalCode: {
            isValid: postalCodeValid,
            message: postalCodeValid ? '' : 'Nieprawidłowy format kodu pocztowego (np. 12-345 lub 12345)'
          }
        }));
        break;
        
      case 'name':
        const nameValid = value.length <= 200;
        setValidation(prev => ({
          ...prev,
          organizationName: {
            isValid: nameValid,
            message: nameValid ? '' : 'Nazwa nie może mieć więcej niż 200 znaków'
          }
        }));
        break;
        
      case 'email':
        // Email jest wymagany - nie może być pusty
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emailValid = value !== '' && emailRegex.test(value) && value.length <= 255;
        setValidation(prev => ({
          ...prev,
          organizationEmail: {
            isValid: emailValid,
            message: emailValid ? '' : (value === '' ? 'Email jest wymagany' : (value.length > 255 ? 'Email nie może mieć więcej niż 255 znaków' : 'Nieprawidłowy format email'))
          }
        }));
        break;
        
      case 'krs':
        // KRS jest wymagany - musi składać się z dokładnie 9 cyfr
        const krsDigits = value.replace(/\D/g, '');
        const krsValid = value !== '' && krsDigits.length === 9;
        setValidation(prev => ({
          ...prev,
          organizationKrs: {
            isValid: krsValid,
            message: krsValid ? '' : (value === '' ? 'KRS jest wymagany' : 'KRS musi składać się z dokładnie 9 cyfr')
          }
        }));
        break;
        
      case 'regon':
        // REGON jest wymagany - musi składać się z dokładnie 9 cyfr
        const regonDigits = value.replace(/\D/g, '');
        const regonValid = value !== '' && regonDigits.length === 9;
        setValidation(prev => ({
          ...prev,
          organizationRegon: {
            isValid: regonValid,
            message: regonValid ? '' : (value === '' ? 'REGON jest wymagany' : 'REGON musi składać się z dokładnie 9 cyfr')
          }
        }));
        break;
    }
  };

  const handleInputChange = (field: keyof AdditionalUserData, value: string) => {
    onInputChange(field, value);
    validateField(field, value);
  };

  const handleOrganizationInputChange = (field: keyof OrganizationData, value: string | number | OrganizationData['correspondence']) => {
    if (onOrganizationInputChange) {
      onOrganizationInputChange(field, value);
    }
    validateOrganizationField(field, value);
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };
  return (
    <div className={`relative rounded-xl p-1 shadow-lg mb-2 sm:mb-3 ${className}`} style={{
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
      padding: '2px'
    }}>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="p-2 sm:p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                {userData.name}
              </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                Członek od {new Date(userData.registrationDate).toLocaleDateString('pl-PL')}
              </p>
            </div>
          </div>
          
          <GlassButton
            onClick={onEditToggle}
            variant="secondary"
              size="xs"
          >
              <span className="text-xs">
              {isEditing ? 'Anuluj' : 'Edytuj'}
            </span>
          </GlassButton>
        </div>

          {/* Sekcja informacyjna o prywatności */}
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <strong>Prywatność danych:</strong> Jedynymi danymi widocznymi dla innych użytkowników są Twoje imię i nazwisko, które wyświetlają się przy dodawanych przez Ciebie drzewach. 
              Pozostałe dane (telefon, adres, miasto, kod pocztowy) są całkowicie prywatne i używane wyłącznie do szybkiego tworzenia wniosków o ochronę drzew do gmin.
              </p>
            </div>
            
          {isEditing ? (
          <div className="space-y-2">
              <div className="relative">
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onFocus={() => handleFieldFocus('phone')}
                  onBlur={handleFieldBlur}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                    editData.phone && !validation.phone.isValid 
                    ? 'border-red-500 focus:border-red-500' 
                      : editData.phone && validation.phone.isValid 
                      ? 'border-green-500 focus:border-green-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                  placeholder="+48 123 456 789"
                />
                {editData.phone && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {validation.phone.isValid ? (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                    <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                )}
            </div>
            
              <div className="relative">
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onFocus={() => handleFieldFocus('address')}
                  onBlur={handleFieldBlur}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                    editData.address && !validation.address.isValid 
                    ? 'border-red-500 focus:border-red-500' 
                      : editData.address && validation.address.isValid 
                      ? 'border-green-500 focus:border-green-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                  placeholder="Ulica i numer"
                />
                {editData.address && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {validation.address.isValid ? (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                    <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={editData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onFocus={() => handleFieldFocus('city')}
                    onBlur={handleFieldBlur}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                      editData.city && !validation.city.isValid 
                      ? 'border-red-500 focus:border-red-500' 
                        : editData.city && validation.city.isValid 
                        ? 'border-green-500 focus:border-green-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                  } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                    placeholder="Miasto"
                  />
                  {editData.city && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {validation.city.isValid ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  )}
              </div>
              
                <div className="relative">
                  <input
                    type="text"
                    value={editData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    onFocus={() => handleFieldFocus('postalCode')}
                    onBlur={handleFieldBlur}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                      editData.postalCode && !validation.postalCode.isValid 
                      ? 'border-red-500 focus:border-red-500' 
                        : editData.postalCode && validation.postalCode.isValid 
                        ? 'border-green-500 focus:border-green-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                  } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                    placeholder="12-345"
                  />
                  {editData.postalCode && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {validation.postalCode.isValid ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Panel walidacji telefonu - tylko gdy pole jest aktywne */}
            {focusedField === 'phone' && editData.phone && (
              <div className="mt-2 p-2 sm:p-3 bg-white/10 dark:bg-gray-800/30 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wymagania numeru telefonu:
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Pole opcjonalne (można zostawić puste)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editData.phone.length <= 20 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editData.phone.length <= 20 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 20 znaków
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(editData.phone) ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(editData.phone) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Prawidłowy format: +48 123 456 789, 123456789, +1 234 567 890
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel walidacji adresu - tylko gdy pole jest aktywne */}
            {focusedField === 'address' && editData.address && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editData.address.length <= 100 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editData.address.length <= 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 100 znaków
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel walidacji miasta - tylko gdy pole jest aktywne */}
            {focusedField === 'city' && editData.city && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editData.city.length <= 50 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editData.city.length <= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 50 znaków
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel walidacji kodu pocztowego - tylko gdy pole jest aktywne */}
            {focusedField === 'postalCode' && editData.postalCode && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {/^\d{2}-\d{3}$|^\d{5}$/.test(editData.postalCode) ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${/^\d{2}-\d{3}$|^\d{5}$/.test(editData.postalCode) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Prawidłowy format: 12-345 lub 12345
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sekcja edycji organizacji */}
            {editOrganizationData && onOrganizationInputChange && (
              <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    Edycja organizacji
                  </h3>
                
                <div className="space-y-2">
                      <div className="relative">
                      <input
                        type="text"
                        value={editOrganizationData.name}
                          onChange={(e) => {
                            handleOrganizationInputChange('name', e.target.value);
                          }}
                          onFocus={() => handleFieldFocus('organizationName')}
                          onBlur={handleFieldBlur}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                            editOrganizationData.name && !validation.organizationName.isValid 
                            ? 'border-red-500 focus:border-red-500' 
                            : editOrganizationData.name && validation.organizationName.isValid 
                            ? 'border-green-500 focus:border-green-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                        placeholder="Nazwa organizacji"
                      />
                        {editOrganizationData.name && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {validation.organizationName.isValid ? (
                              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                  
                      <div className="relative">
                      <input
                        type="text"
                        value={editOrganizationData.address}
                          onChange={(e) => {
                            handleOrganizationInputChange('address', e.target.value);
                          }}
                          onFocus={() => handleFieldFocus('organizationAddress')}
                          onBlur={handleFieldBlur}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                            editOrganizationData.address && !validation.organizationAddress.isValid 
                            ? 'border-red-500 focus:border-red-500' 
                            : editOrganizationData.address && validation.organizationAddress.isValid 
                            ? 'border-green-500 focus:border-green-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                        placeholder="Adres organizacji"
                      />
                        {editOrganizationData.address && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {validation.organizationAddress.isValid ? (
                              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                        <input
                          type="text"
                          value={editOrganizationData.city}
                            onChange={(e) => {
                              handleOrganizationInputChange('city', e.target.value);
                            }}
                            onFocus={() => handleFieldFocus('organizationCity')}
                            onBlur={handleFieldBlur}
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                              editOrganizationData.city && !validation.organizationCity.isValid 
                              ? 'border-red-500 focus:border-red-500' 
                              : editOrganizationData.city && validation.organizationCity.isValid 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                            } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                          placeholder="Miasto"
                        />
                          {editOrganizationData.city && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {validation.organizationCity.isValid ? (
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                    
                        <div className="relative">
                        <input
                          type="text"
                          value={editOrganizationData.postalCode}
                            onChange={(e) => {
                              handleOrganizationInputChange('postalCode', e.target.value);
                            }}
                            onFocus={() => handleFieldFocus('organizationPostalCode')}
                            onBlur={handleFieldBlur}
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                              editOrganizationData.postalCode && !validation.organizationPostalCode.isValid 
                              ? 'border-red-500 focus:border-red-500' 
                              : editOrganizationData.postalCode && validation.organizationPostalCode.isValid 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                            } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                          placeholder="12-345"
                        />
                          {editOrganizationData.postalCode && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {validation.organizationPostalCode.isValid ? (
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="tel"
                          value={editOrganizationData.phone}
                          onChange={(e) => handleOrganizationInputChange('phone', e.target.value)}
                          onFocus={() => handleFieldFocus('organizationPhone')}
                          onBlur={handleFieldBlur}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                            editOrganizationData.phone && !validation.organizationPhone.isValid 
                            ? 'border-red-500 focus:border-red-500' 
                              : editOrganizationData.phone && validation.organizationPhone.isValid 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                          placeholder="+48 123 456 789"
                        />
                        {editOrganizationData.phone && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {validation.organizationPhone.isValid ? (
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            ) : (
                            <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        )}
                    </div>
                    
                        <div className="relative">
                        <input
                          type="email"
                          value={editOrganizationData.email}
                            onChange={(e) => {
                              handleOrganizationInputChange('email', e.target.value);
                            }}
                            onFocus={() => handleFieldFocus('organizationEmail')}
                            onBlur={handleFieldBlur}
                            required
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                              editOrganizationData.email && validation.organizationEmail.isValid 
                                ? 'border-green-500 focus:border-green-500' 
                                : editOrganizationData.email && !validation.organizationEmail.isValid 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                            } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                            placeholder="email@organizacja.pl (wymagane)"
                          />
                          {editOrganizationData.email && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {validation.organizationEmail.isValid ? (
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                              )}
                  </div>
                          )}
                </div>
              </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={editOrganizationData.krs || ''}
                          onChange={(e) => {
                            handleOrganizationInputChange('krs', e.target.value);
                          }}
                          onFocus={() => handleFieldFocus('organizationKrs')}
                          onBlur={handleFieldBlur}
                          required
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                            editOrganizationData.krs && validation.organizationKrs.isValid 
                              ? 'border-green-500 focus:border-green-500' 
                              : editOrganizationData.krs && !validation.organizationKrs.isValid 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                          placeholder="Numer KRS (9 cyfr - wymagane)"
                        />
                        {editOrganizationData.krs && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {validation.organizationKrs.isValid ? (
                              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                    
                      <div className="relative">
                        <input
                          type="text"
                          value={editOrganizationData.regon || ''}
                          onChange={(e) => {
                            handleOrganizationInputChange('regon', e.target.value);
                          }}
                          onFocus={() => handleFieldFocus('organizationRegon')}
                          onBlur={handleFieldBlur}
                          required
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                            editOrganizationData.regon && validation.organizationRegon.isValid 
                              ? 'border-green-500 focus:border-green-500' 
                              : editOrganizationData.regon && !validation.organizationRegon.isValid 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                          placeholder="Numer REGON (9 cyfr - wymagane)"
                        />
                        {editOrganizationData.regon && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {validation.organizationRegon.isValid ? (
                              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                  </div>
                  
                  {editOrganizationData.correspondence && (
                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Adres korespondencyjny:
                      </h4>
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={editOrganizationData.correspondence.poBox && editOrganizationData.correspondence.poBox > 0 ? editOrganizationData.correspondence.poBox.toString() : ''}
                            onChange={(e) => {
                              const inputValue = e.target.value.trim();
                              // Allow empty input or only digits
                              if (inputValue === '') {
                                const updatedCorrespondence = {
                                  ...editOrganizationData.correspondence,
                                  poBox: undefined
                                };
                                if (onOrganizationInputChange) {
                                  onOrganizationInputChange('correspondence', updatedCorrespondence);
                                }
                                validateOrganizationField('correspondence', updatedCorrespondence);
                                return;
                              }
                              
                              // Only allow digits
                              const digitsOnly = inputValue.replace(/\D/g, '');
                              if (digitsOnly !== inputValue) {
                                return; // Don't update if non-digits were entered
                              }
                              
                              const numValue = Number(digitsOnly);
                              if (isNaN(numValue) || numValue < 0) {
                                return;
                              }
                              
                              // Limit to max 999999
                              const poBoxValue = numValue > 999999 ? 999999 : (numValue > 0 ? numValue : undefined);
                              const updatedCorrespondence = {
                                ...editOrganizationData.correspondence,
                                poBox: poBoxValue
                              };
                              if (onOrganizationInputChange) {
                                onOrganizationInputChange('correspondence', updatedCorrespondence);
                              }
                              validateOrganizationField('correspondence', updatedCorrespondence);
                            }}
                            onFocus={() => handleFieldFocus('organizationCorrespondencePoBox')}
                            onBlur={handleFieldBlur}
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                              (editOrganizationData.correspondence.poBox !== undefined && editOrganizationData.correspondence.poBox !== null && editOrganizationData.correspondence.poBox !== 0) && !validation.organizationCorrespondencePoBox.isValid 
                              ? 'border-red-500 focus:border-red-500' 
                              : (editOrganizationData.correspondence.poBox !== undefined && editOrganizationData.correspondence.poBox !== null && editOrganizationData.correspondence.poBox !== 0) && validation.organizationCorrespondencePoBox.isValid 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                            } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                            placeholder="Skrytka pocztowa (1-999999)"
                          />
                          {(editOrganizationData.correspondence.poBox !== undefined && editOrganizationData.correspondence.poBox !== null && editOrganizationData.correspondence.poBox !== 0) && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {validation.organizationCorrespondencePoBox.isValid ? (
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={editOrganizationData.correspondence.address || ''}
                            onChange={(e) => {
                              const updatedCorrespondence = {
                                ...editOrganizationData.correspondence,
                                address: e.target.value
                              };
                              if (onOrganizationInputChange) {
                                onOrganizationInputChange('correspondence', updatedCorrespondence);
                              }
                              validateOrganizationField('correspondence', updatedCorrespondence);
                            }}
                            onFocus={() => handleFieldFocus('organizationCorrespondenceAddress')}
                            onBlur={handleFieldBlur}
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                              editOrganizationData.correspondence.address && !validation.organizationCorrespondenceAddress.isValid 
                              ? 'border-red-500 focus:border-red-500' 
                              : editOrganizationData.correspondence.address && validation.organizationCorrespondenceAddress.isValid 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                            } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                            placeholder="Ulica i numer"
                          />
                          {editOrganizationData.correspondence.address && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {validation.organizationCorrespondenceAddress.isValid ? (
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={editOrganizationData.correspondence.city || ''}
                              onChange={(e) => {
                                const updatedCorrespondence = {
                                  ...editOrganizationData.correspondence,
                                  city: e.target.value
                                };
                                if (onOrganizationInputChange) {
                                  onOrganizationInputChange('correspondence', updatedCorrespondence);
                                }
                                validateOrganizationField('correspondence', updatedCorrespondence);
                              }}
                              onFocus={() => handleFieldFocus('organizationCorrespondenceCity')}
                              onBlur={handleFieldBlur}
                              className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                                editOrganizationData.correspondence.city && !validation.organizationCorrespondenceCity.isValid 
                                ? 'border-red-500 focus:border-red-500' 
                                : editOrganizationData.correspondence.city && validation.organizationCorrespondenceCity.isValid 
                                ? 'border-green-500 focus:border-green-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                              } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                              placeholder="Miasto"
                            />
                            {editOrganizationData.correspondence.city && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                {validation.organizationCorrespondenceCity.isValid ? (
                                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                ) : (
                                  <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={editOrganizationData.correspondence.postalCode || ''}
                              onChange={(e) => {
                                const updatedCorrespondence = {
                                  ...editOrganizationData.correspondence,
                                  postalCode: e.target.value
                                };
                                if (onOrganizationInputChange) {
                                  onOrganizationInputChange('correspondence', updatedCorrespondence);
                                }
                                validateOrganizationField('correspondence', updatedCorrespondence);
                              }}
                              onFocus={() => handleFieldFocus('organizationCorrespondencePostalCode')}
                              onBlur={handleFieldBlur}
                              className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all ${
                                editOrganizationData.correspondence.postalCode && !validation.organizationCorrespondencePostalCode.isValid 
                                ? 'border-red-500 focus:border-red-500' 
                                : editOrganizationData.correspondence.postalCode && validation.organizationCorrespondencePostalCode.isValid 
                                ? 'border-green-500 focus:border-green-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                              } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-8`}
                              placeholder="12-345"
                            />
                            {editOrganizationData.correspondence.postalCode && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                {validation.organizationCorrespondencePostalCode.isValid ? (
                                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                ) : (
                                  <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji telefonu organizacji - tylko gdy pole jest aktywne */}
            {focusedField === 'organizationPhone' && editOrganizationData?.phone && (
              <div className="mt-2 p-2 sm:p-3 bg-white/10 dark:bg-gray-800/30 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wymagania numeru telefonu organizacji:
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Pole opcjonalne (można zostawić puste)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.phone.length <= 20 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.phone.length <= 20 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 20 znaków
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(editOrganizationData.phone) ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(editOrganizationData.phone) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Prawidłowy format: +48 123 456 789, 123456789, +1 234 567 890
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel walidacji nazwy organizacji */}
            {focusedField === 'organizationName' && editOrganizationData?.name && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.name.length <= 200 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.name.length <= 200 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 200 znaków ({editOrganizationData.name.length}/200)
                    </span>
                  </div>
                  {!validation.organizationName.isValid && validation.organizationName.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationName.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji adresu organizacji */}
            {focusedField === 'organizationAddress' && editOrganizationData?.address && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.address.length <= 150 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.address.length <= 150 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 150 znaków ({editOrganizationData.address.length}/150)
                    </span>
                  </div>
                  {!validation.organizationAddress.isValid && validation.organizationAddress.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationAddress.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji miasta organizacji */}
            {focusedField === 'organizationCity' && editOrganizationData?.city && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.city.length <= 100 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.city.length <= 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 100 znaków ({editOrganizationData.city.length}/100)
                    </span>
                  </div>
                  {!validation.organizationCity.isValid && validation.organizationCity.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationCity.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji kodu pocztowego organizacji */}
            {focusedField === 'organizationPostalCode' && editOrganizationData?.postalCode && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {/^\d{2}-\d{3}$|^\d{5}$/.test(editOrganizationData.postalCode) ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${/^\d{2}-\d{3}$|^\d{5}$/.test(editOrganizationData.postalCode) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Prawidłowy format: 12-345 lub 12345
                    </span>
                  </div>
                  {!validation.organizationPostalCode.isValid && validation.organizationPostalCode.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationPostalCode.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji email organizacji */}
            {focusedField === 'organizationEmail' && editOrganizationData?.email && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.email.length <= 255 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.email.length <= 255 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 255 znaków ({editOrganizationData.email.length}/255)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editOrganizationData.email) ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editOrganizationData.email) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Prawidłowy format email
                    </span>
                  </div>
                  {!validation.organizationEmail.isValid && validation.organizationEmail.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationEmail.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji KRS */}
            {focusedField === 'organizationKrs' && editOrganizationData?.krs && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const digitsOnly = editOrganizationData.krs.replace(/\D/g, '');
                      return digitsOnly.length === 9;
                    })() ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${(() => {
                      const digitsOnly = editOrganizationData.krs.replace(/\D/g, '');
                      return digitsOnly.length === 9;
                    })() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Musi składać się z dokładnie 9 cyfr (obecnie: {editOrganizationData.krs.replace(/\D/g, '').length})
                    </span>
                  </div>
                  {!validation.organizationKrs.isValid && validation.organizationKrs.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationKrs.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji REGON */}
            {focusedField === 'organizationRegon' && editOrganizationData?.regon && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const digitsOnly = editOrganizationData.regon.replace(/\D/g, '');
                      return digitsOnly.length === 9;
                    })() ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${(() => {
                      const digitsOnly = editOrganizationData.regon.replace(/\D/g, '');
                      return digitsOnly.length === 9;
                    })() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Musi składać się z dokładnie 9 cyfr (obecnie: {editOrganizationData.regon.replace(/\D/g, '').length})
                    </span>
                  </div>
                  {!validation.organizationRegon.isValid && validation.organizationRegon.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationRegon.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji skrytki pocztowej */}
            {focusedField === 'organizationCorrespondencePoBox' && editOrganizationData?.correspondence?.poBox && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.correspondence.poBox >= 1 && editOrganizationData.correspondence.poBox <= 999999 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.correspondence.poBox >= 1 && editOrganizationData.correspondence.poBox <= 999999 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Musi być liczbą od 1 do 999999
                    </span>
                  </div>
                  {!validation.organizationCorrespondencePoBox.isValid && validation.organizationCorrespondencePoBox.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationCorrespondencePoBox.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji adresu korespondencyjnego */}
            {focusedField === 'organizationCorrespondenceAddress' && editOrganizationData?.correspondence?.address && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.correspondence.address.length <= 150 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.correspondence.address.length <= 150 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 150 znaków ({editOrganizationData.correspondence.address.length}/150)
                    </span>
                  </div>
                  {!validation.organizationCorrespondenceAddress.isValid && validation.organizationCorrespondenceAddress.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationCorrespondenceAddress.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji miasta korespondencyjnego */}
            {focusedField === 'organizationCorrespondenceCity' && editOrganizationData?.correspondence?.city && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editOrganizationData.correspondence.city.length <= 100 ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${editOrganizationData.correspondence.city.length <= 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Maksymalnie 100 znaków ({editOrganizationData.correspondence.city.length}/100)
                    </span>
                  </div>
                  {!validation.organizationCorrespondenceCity.isValid && validation.organizationCorrespondenceCity.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationCorrespondenceCity.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel walidacji kodu pocztowego korespondencyjnego */}
            {focusedField === 'organizationCorrespondencePostalCode' && editOrganizationData?.correspondence?.postalCode && (
              <div className="mt-2 p-2 bg-white/10 dark:bg-gray-800/20 rounded-lg border border-gray-300 dark:border-gray-600/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {/^\d{2}-\d{3}$|^\d{5}$/.test(editOrganizationData.correspondence.postalCode) ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-xs ${/^\d{2}-\d{3}$|^\d{5}$/.test(editOrganizationData.correspondence.postalCode) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Prawidłowy format: 12-345 lub 12345
                    </span>
                  </div>
                  {!validation.organizationCorrespondencePostalCode.isValid && validation.organizationCorrespondencePostalCode.message && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {validation.organizationCorrespondencePostalCode.message}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 pt-3">
              <GlassButton
                onClick={onCancel}
                variant="secondary"
                size="xs"
                className="flex-1"
              >
                <span className="text-xs">Anuluj</span>
              </GlassButton>
              <GlassButton
                onClick={handleSaveClick}
                variant="primary"
                size="xs"
                className="flex-1"
                disabled={isSaving || !canSave}
              >
                <span className="text-xs">
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </span>
              </GlassButton>
            </div>
            
            {/* Informacja o wymaganych polach organizacji */}
            {editOrganizationData && onOrganizationInputChange && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Uwaga:</strong> Przy edycji organizacji wszystkie dane są wymagane. Proszę upewnić się, że wszystkie pola są wypełnione przed zapisem.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Email:</span> {userData.email}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Telefon:</span> {additionalData.phone}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Adres:</span> {additionalData.address}
              </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Miasto:</span> {additionalData.city}
              </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Kod pocztowy:</span> {additionalData.postalCode}
              </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Dołączył:</span> {new Date(userData.registrationDate).toLocaleDateString('pl-PL')}
            </div>
            
            {/* Sekcja informacyjna o organizacji */}
            {organizationData && (
              <div className="mb-2 mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                  <strong>Dane organizacji:</strong> Dane organizacji są całkowicie opcjonalne. Jeśli chciałbyś tworzyć wnioski z danymi innymi niż te z profilu, możesz użyć organizacji w wniosku.
                </p>
              </div>
            )}
            
            {/* Sekcja organizacji */}
            {organizationData && (
              <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Organizacja:
                </div>
                {/* Pierwsze 8 pól w układzie 2 kolumny (4 pola w każdej) */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Nazwa:</span> <span className="ml-1">{organizationData.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Adres:</span> <span className="ml-1">{organizationData.address}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Miasto:</span> <span className="ml-1">{organizationData.city}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Kod pocztowy:</span> <span className="ml-1">{organizationData.postalCode}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Telefon:</span> <span className="ml-1">{organizationData.phone}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span> <span className="ml-1">{organizationData.email}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">KRS:</span> <span className="ml-1">{organizationData.krs || 'Nie podano'}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">REGON:</span> <span className="ml-1">{organizationData.regon || 'Nie podano'}</span>
                  </div>
                </div>
                {/* Korespondencja - grupowanie pól */}
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                    Korespondencja:
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Skrytka pocztowa:</span> <span className="ml-1">{organizationData.correspondence?.poBox || 'Nie podano'}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Adres:</span> <span className="ml-1">{organizationData.correspondence?.address || 'Nie podano'}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Kod pocztowy:</span> <span className="ml-1">{organizationData.correspondence?.postalCode || 'Nie podano'}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Miasto:</span> <span className="ml-1">{organizationData.correspondence?.city || 'Nie podano'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
