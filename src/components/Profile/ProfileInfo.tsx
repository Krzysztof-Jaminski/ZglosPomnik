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
  onOrganizationInputChange?: (field: keyof OrganizationData, value: string) => void;
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
    organizationPostalCode: { isValid: true, message: '' }
  });

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

  const validateOrganizationField = (fieldName: keyof OrganizationData, value: string) => {
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
        const addressValid = value.length <= 100;
        setValidation(prev => ({
          ...prev,
          organizationAddress: {
            isValid: addressValid,
            message: addressValid ? '' : 'Adres nie może mieć więcej niż 100 znaków'
          }
        }));
        break;
        
      case 'city':
        const cityValid = value.length <= 50;
        setValidation(prev => ({
          ...prev,
          organizationCity: {
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
          organizationPostalCode: {
            isValid: postalCodeValid,
            message: postalCodeValid ? '' : 'Nieprawidłowy format kodu pocztowego (np. 12-345 lub 12345)'
          }
        }));
        break;
    }
  };

  const handleInputChange = (field: keyof AdditionalUserData, value: string) => {
    onInputChange(field, value);
    validateField(field, value);
  };

  const handleOrganizationInputChange = (field: keyof OrganizationData, value: string) => {
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

          {/* Sekcja informacyjna o organizacji */}
          <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
              <strong>Dane organizacji:</strong> Dane organizacji są całkowicie opcjonalne. Jeśli chciałbyś tworzyć wnioski z danymi innymi niż te z profilu, możesz użyć organizacji w wniosku.
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
                      <input
                        type="text"
                        value={editOrganizationData.name}
                        onChange={(e) => onOrganizationInputChange('name', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Nazwa organizacji"
                      />
                  
                      <input
                        type="text"
                        value={editOrganizationData.address}
                        onChange={(e) => onOrganizationInputChange('address', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Adres organizacji"
                      />
                  
                  <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editOrganizationData.city}
                          onChange={(e) => onOrganizationInputChange('city', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Miasto"
                        />
                    
                        <input
                          type="text"
                          value={editOrganizationData.postalCode}
                          onChange={(e) => onOrganizationInputChange('postalCode', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="12-345"
                        />
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
                    
                        <input
                          type="email"
                          value={editOrganizationData.email}
                          onChange={(e) => onOrganizationInputChange('email', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white resize-none transition-all border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="email@organizacja.pl"
                        />
                  </div>
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
                onClick={onSave}
                variant="primary"
                size="xs"
                className="flex-1"
                disabled={isSaving}
              >
                <span className="text-xs">
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </span>
              </GlassButton>
            </div>
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
            
            {/* Sekcja organizacji */}
            {organizationData && (
              <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    Organizacja
                  </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Nazwa:</span> {organizationData.name}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Adres:</span> {organizationData.address}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Miasto:</span> {organizationData.city}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Kod pocztowy:</span> {organizationData.postalCode}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Telefon:</span> {organizationData.phone}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Email:</span> {organizationData.email}
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
