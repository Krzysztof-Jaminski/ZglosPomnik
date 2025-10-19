import React, { useState } from 'react';
import { User, Mail, Phone, Edit, X, Calendar, MapPin, Building, Hash, Check, X as XIcon } from 'lucide-react';
import { GlassButton } from '../UI/GlassButton';

interface AdditionalUserData {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface ProfileInfoProps {
  userData: {
    name: string;
    email: string;
    registrationDate: string;
  };
  additionalData: AdditionalUserData;
  isEditing: boolean;
  editData: AdditionalUserData;
  isSaving: boolean;
  onEditToggle: () => void;
  onInputChange: (field: keyof AdditionalUserData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

interface ValidationState {
  phone: { isValid: boolean; message: string };
  address: { isValid: boolean; message: string };
  city: { isValid: boolean; message: string };
  postalCode: { isValid: boolean; message: string };
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  userData,
  additionalData,
  isEditing,
  editData,
  isSaving,
  onEditToggle,
  onInputChange,
  onSave,
  onCancel,
  className = ''
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    phone: { isValid: true, message: '' },
    address: { isValid: true, message: '' },
    city: { isValid: true, message: '' },
    postalCode: { isValid: true, message: '' }
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

  const handleInputChange = (field: keyof AdditionalUserData, value: string) => {
    onInputChange(field, value);
    validateField(field, value);
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };
  return (
    <div className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg mb-4 sm:mb-6 border border-gray-200/50 dark:border-gray-700/50 ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                {userData.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Członek od {new Date(userData.registrationDate).toLocaleDateString('pl-PL')}
              </p>
            </div>
          </div>
          
          <GlassButton
            onClick={onEditToggle}
            variant="secondary"
            size="sm"
            icon={isEditing ? X : Edit}
          >
            <span className="text-sm">
              {isEditing ? 'Anuluj' : 'Edytuj'}
            </span>
          </GlassButton>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="p-4 py-5 bg-blue-900/20 border border-blue-800/50 rounded-lg">
              <p className="text-sm text-blue-200 leading-relaxed">
                <strong>Informacja:</strong> Możesz edytować wszystkie swoje dane. 
                Zmiany są zapisywane na serwerze.
              </p>
            </div>
            
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onFocus={() => handleFieldFocus('phone')}
                  onBlur={handleFieldBlur}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 ${
                    editData.phone && !validation.phone.isValid 
                      ? 'border-red-500/50' 
                      : editData.phone && validation.phone.isValid 
                        ? 'border-green-500/50' 
                        : 'border-gray-600/50'
                  }`}
                  placeholder="+48 123 456 789"
                />
                {editData.phone && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validation.phone.isValid ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <XIcon className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onFocus={() => handleFieldFocus('address')}
                  onBlur={handleFieldBlur}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 ${
                    editData.address && !validation.address.isValid 
                      ? 'border-red-500/50' 
                      : editData.address && validation.address.isValid 
                        ? 'border-green-500/50' 
                        : 'border-gray-600/50'
                  }`}
                  placeholder="Ulica i numer"
                />
                {editData.address && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validation.address.isValid ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <XIcon className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onFocus={() => handleFieldFocus('city')}
                    onBlur={handleFieldBlur}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 ${
                      editData.city && !validation.city.isValid 
                        ? 'border-red-500/50' 
                        : editData.city && validation.city.isValid 
                          ? 'border-green-500/50' 
                          : 'border-gray-600/50'
                    }`}
                    placeholder="Miasto"
                  />
                  {editData.city && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {validation.city.isValid ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <XIcon className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    onFocus={() => handleFieldFocus('postalCode')}
                    onBlur={handleFieldBlur}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 ${
                      editData.postalCode && !validation.postalCode.isValid 
                        ? 'border-red-500/50' 
                        : editData.postalCode && validation.postalCode.isValid 
                          ? 'border-green-500/50' 
                          : 'border-gray-600/50'
                    }`}
                    placeholder="12-345"
                  />
                  {editData.postalCode && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {validation.postalCode.isValid ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <XIcon className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel walidacji telefonu - tylko gdy pole jest aktywne */}
            {focusedField === 'phone' && editData.phone && (
              <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
                <h4 className="text-xs font-medium text-gray-300 mb-2">
                  Wymagania numeru telefonu:
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-400">
                      Pole opcjonalne (można zostawić puste)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editData.phone.length <= 20 ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${editData.phone.length <= 20 ? 'text-green-400' : 'text-red-400'}`}>
                      Maksymalnie 20 znaków
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(editData.phone) ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(editData.phone) ? 'text-green-400' : 'text-red-400'}`}>
                      Prawidłowy format: +48 123 456 789, 123456789, +1 234 567 890
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel walidacji adresu - tylko gdy pole jest aktywne */}
            {focusedField === 'address' && editData.address && (
              <div className="mt-2 p-2 bg-gray-800/20 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editData.address.length <= 100 ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${editData.address.length <= 100 ? 'text-green-400' : 'text-red-400'}`}>
                      Maksymalnie 100 znaków
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel walidacji miasta - tylko gdy pole jest aktywne */}
            {focusedField === 'city' && editData.city && (
              <div className="mt-2 p-2 bg-gray-800/20 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {editData.city.length <= 50 ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${editData.city.length <= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      Maksymalnie 50 znaków
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel walidacji kodu pocztowego - tylko gdy pole jest aktywne */}
            {focusedField === 'postalCode' && editData.postalCode && (
              <div className="mt-2 p-2 bg-gray-800/20 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {/^\d{2}-\d{3}$|^\d{5}$/.test(editData.postalCode) ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${/^\d{2}-\d{3}$|^\d{5}$/.test(editData.postalCode) ? 'text-green-400' : 'text-red-400'}`}>
                      Prawidłowy format: 12-345 lub 12345
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <GlassButton
                onClick={onCancel}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <span className="text-sm">Anuluj</span>
              </GlassButton>
              <GlassButton
                onClick={onSave}
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={isSaving}
              >
                <span className="text-sm">
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
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
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Adres: {additionalData.address}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Miasto: {additionalData.city}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Kod pocztowy: {additionalData.postalCode}
                </span>
              </div>
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
  );
};
