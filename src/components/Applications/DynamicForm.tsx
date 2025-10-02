import React, { useState, useEffect } from 'react';
import { FormField, FormSchema, Tree, Commune, ApplicationTemplate } from '../../types';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { ArrowLeft, FileText, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (formData: Record<string, any>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  selectedTree?: Tree | null;
  selectedCommune?: Commune | null;
  selectedTemplate?: ApplicationTemplate | null;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  onBack,
  isSubmitting = false,
  selectedTree = null,
  selectedCommune = null,
  selectedTemplate = null
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Initialize form data with default values and user data
  useEffect(() => {
    const initialData: Record<string, any> = {};
    
    // First, try to restore from localStorage
    const savedFormData = localStorage.getItem('applicationFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        Object.assign(initialData, parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
    
    // Then apply default values for fields not in saved data
    schema.requiredFields.forEach(field => {
      if (initialData[field.name] === undefined && field.defaultValue !== null && field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });

    // Auto-fill with user data if available and not already saved
    if (user) {
      const userDataMap: Record<string, string> = {
        'imie': user.name.split(' ')[0] || '',
        'nazwisko': user.name.split(' ').slice(1).join(' ') || '',
        'telefon': user.phone || '',
        'adres': user.address || '',
        'miasto': user.city || '',
        'kodPocztowy': user.postalCode || '',
        'name': user.name || '',
        'email': user.email || '',
        'phone': user.phone || '',
        'address': user.address || '',
        'city': user.city || '',
        'postalCode': user.postalCode || ''
      };

      // Apply user data to matching fields (only if not already saved)
      Object.keys(userDataMap).forEach(key => {
        if (userDataMap[key] && schema.requiredFields.some(field => 
          field.name.toLowerCase().includes(key.toLowerCase()) || 
          field.label.toLowerCase().includes(key.toLowerCase())
        )) {
          const matchingField = schema.requiredFields.find(field => 
            field.name.toLowerCase().includes(key.toLowerCase()) || 
            field.label.toLowerCase().includes(key.toLowerCase())
          );
          if (matchingField && initialData[matchingField.name] === undefined) {
            initialData[matchingField.name] = userDataMap[key];
          }
        }
      });
    }

    setFormData(initialData);
  }, [schema, user]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('applicationFormData', JSON.stringify(formData));
    }
  }, [formData]);

  // Validate form whenever formData changes
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    schema.requiredFields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsFormValid(isValid);
  }, [formData, schema.requiredFields]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.isRequired && (!value || value.toString().trim() === '')) {
      return `${field.label} jest wymagane`;
    }

    if (!value || value.toString().trim() === '') {
      return null; // Empty optional field is valid
    }

    const validation = field.validation;
    if (!validation) return null;

    // Special validation for phone number
    if (field.name === 'user_phone') {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{9,15}$/;
      if (!phoneRegex.test(value.toString())) {
        return 'Numer telefonu musi zawierać 9-15 cyfr i może zawierać spacje, myślniki, nawiasy lub znak +';
      }
    }

    // Special validation for postal code
    if (field.name === 'user_postal_code') {
      const postalRegex = /^\d{2}-\d{3}$/;
      if (!postalRegex.test(value.toString())) {
        return 'Kod pocztowy musi być w formacie XX-XXX (np. 30-001)';
      }
    }

    if (validation.minLength && value.toString().length < validation.minLength) {
      return validation.validationMessage || `Minimum ${validation.minLength} znaków`;
    }

    if (validation.maxLength && value.toString().length > validation.maxLength) {
      return validation.validationMessage || `Maksimum ${validation.maxLength} znaków`;
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value.toString())) {
        return validation.validationMessage || 'Nieprawidłowy format';
      }
    }

    if (validation.min !== undefined && Number(value) < validation.min) {
      return validation.validationMessage || `Wartość musi być większa lub równa ${validation.min}`;
    }

    if (validation.max !== undefined && Number(value) > validation.max) {
      return validation.validationMessage || `Wartość musi być mniejsza lub równa ${validation.max}`;
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Mark field as touched when user starts typing
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    // Clear error when user starts typing in this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };


  const handleFieldBlur = (fieldName: string) => {
    // Mark field as touched when user leaves it
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field when user leaves it
    const field = schema.requiredFields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      } else {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    schema.requiredFields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAutoFill = async () => {
    if (isAutoFilling) return;
    
    setIsAutoFilling(true);
    
    // Prepare user context data
    const userContext = {
      name: user?.name || 'Użytkownik',
      email: user?.email || 'user@example.com',
      phone: user?.phone || '+48 123 456 789',
      address: user?.address || 'ul. Krakowska 15',
      city: user?.city || 'Kraków',
      postalCode: user?.postalCode || '30-001'
    };
    
    // Prepare tree context data (from selected tree)
    const treeContext = {
      id: selectedTree?.id || 'unknown',
      species: selectedTree?.species || 'Nieznany gatunek',
      location: selectedTree?.location?.address || 'Nieznana lokalizacja',
      lat: selectedTree?.location?.lat || 0,
      lng: selectedTree?.location?.lng || 0,
      circumference: selectedTree?.circumference || 0,
      height: selectedTree?.height || 0,
      condition: selectedTree?.condition || 'nieznana',
      estimatedAge: selectedTree?.estimatedAge || 0,
      description: selectedTree?.description || 'Brak opisu',
      isAlive: selectedTree?.isAlive || true,
      isMonument: selectedTree?.isMonument || false,
      imageUrls: selectedTree?.imageUrls || []
    };
    
    // Prepare commune context data
    const communeContext = {
      id: selectedCommune?.id || 'unknown',
      name: selectedCommune?.name || 'Nieznana gmina',
      city: selectedCommune?.city || 'Nieznane miasto',
      address: selectedCommune?.address || 'Nieznany adres',
      email: selectedCommune?.email || 'nieznany@email.com',
      phone: selectedCommune?.phone || 'Nieznany telefon'
    };
    
    // Prepare template context data
    const templateContext = {
      id: selectedTemplate?.id || 'unknown',
      name: selectedTemplate?.name || 'Nieznany szablon',
      description: selectedTemplate?.description || 'Brak opisu szablonu'
    };
    
    try {
      // Prepare fields information for Gemini
      const fieldsInfo = schema.requiredFields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type,
        isRequired: field.isRequired,
        placeholder: field.placeholder,
        helpText: field.helpText,
        validation: field.validation
      }));
      
      const prompt = `Jesteś asystentem AI pomagającym wypełnić formularz aplikacji o drzewo w Polsce. 

KONTEKST WNIOSKU:
- Szablon: ${templateContext.name} (${templateContext.description})
- Gmina: ${communeContext.name} w ${communeContext.city}

DANE UŻYTKOWNIKA (używaj tych danych gdy to ma sens):
- Imię: ${userContext.name}
- Email: ${userContext.email}
- Telefon: ${userContext.phone}
- Adres: ${userContext.address}
- Miasto: ${userContext.city}
- Kod pocztowy: ${userContext.postalCode}

DANE DRZEWA (używaj tych danych gdy to ma sens):
- ID: ${treeContext.id}
- Gatunek: ${treeContext.species}
- Lokalizacja: ${treeContext.location}
- Współrzędne: ${treeContext.lat}, ${treeContext.lng}
- Pierśnica: ${treeContext.circumference} cm
- Wysokość: ${treeContext.height} m
- Kondycja: ${treeContext.condition}
- Szacowany wiek: ${treeContext.estimatedAge} lat
- Opis: ${treeContext.description}
- Czy żywe: ${treeContext.isAlive ? 'Tak' : 'Nie'}
- Czy pomnik przyrody: ${treeContext.isMonument ? 'Tak' : 'Nie'}
- Liczba zdjęć: ${treeContext.imageUrls.length}

DANE GMINY (używaj tych danych gdy to ma sens):
- Nazwa: ${communeContext.name}
- Miasto: ${communeContext.city}
- Adres urzędu: ${communeContext.address}
- Email: ${communeContext.email}
- Telefon: ${communeContext.phone}

Formularz zawiera następujące pola (WYPEŁNIJ WSZYSTKIE):
${fieldsInfo.map(field => 
  `- ${field.label} (${field.name}): ${field.type}${field.isRequired ? ' - WYMAGANE' : ' - opcjonalne'}${field.helpText ? ` - ${field.helpText}` : ''}`
).join('\n')}

ZASADY WYPEŁNIANIA WSZYSTKICH PÓL:
1. Dla pól związanych z użytkownikiem (user_phone, user_address, user_city, user_postal_code) - użyj danych użytkownika
2. Dla pól związanych z drzewem (plot, cadastral_district, record_keeping_unit) - użyj danych drzewa i gminy
3. Dla pól związanych z opracowaniem (study_name, study_author) - wygeneruj profesjonalne dane związane z drzewem
4. Dla pól związanych z własnością (ownership_form, land_type) - wygeneruj realistyczne dane polskie
5. Dla pozostałych pól - wygeneruj realistyczne dane polskie związane z kontekstem

WAŻNE: Musisz wypełnić WSZYSTKIE pola z listy powyżej. Nie pomijaj żadnego pola!

Zwróć odpowiedź w formacie JSON gdzie klucze to nazwy pól (name), a wartości to wypełnione dane.

Przykład odpowiedzi (wypełnij wszystkie pola z formularza):
{
  "user_phone": "${userContext.phone}",
  "user_address": "${userContext.address}",
  "user_city": "${userContext.city}",
  "user_postal_code": "${userContext.postalCode}",
  "plot": "Działka nr 123/4 w obrębie ${treeContext.location}",
  "cadastral_district": "Obręb ${communeContext.city}-Centrum",
  "record_keeping_unit": "Jednostka ewidencyjna ${communeContext.city}",
  "ownership_form": "Własność prywatna",
  "land_type": "Grunt zabudowany",
  "study_name": "Opracowanie dendrologiczne dla ${treeContext.species} w ${treeContext.location}",
  "study_author": "Dr ${userContext.name}"
}

Zwróć TYLKO JSON bez dodatkowych komentarzy.`;

      // API call to Gemini (try multiple endpoints)
      let response;
      let data;
      
      try {
        // Try the correct Gemini API endpoint
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('Brak klucza API Gemini. Skonfiguruj VITE_GEMINI_API_KEY w pliku .env');
        }
        
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (!response.ok) {
          console.error('Gemini API response not ok:', response.status, response.statusText);
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        data = await response.json();
        console.log('Gemini API response:', data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
          throw new Error('Invalid Gemini API response structure');
        }
        
        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log('AI response text:', aiResponse);
        
        // Parse JSON response
        const autoFillData = JSON.parse(aiResponse);
        console.log('Parsed auto-fill data:', autoFillData);
        
        // Update form data
        setFormData(prev => ({ ...prev, ...autoFillData }));
        
        // Save to localStorage
        localStorage.setItem('applicationFormData', JSON.stringify({ ...formData, ...autoFillData }));
        
      } catch (apiError) {
        console.error('Gemini API error:', apiError);
        throw apiError; // Re-throw to be caught by outer catch
      }
      
    } catch (error) {
      console.error('Auto-fill error:', error);
      
      // Fallback: Use mock data if API fails (using all contexts)
      const mockData = {
        user_phone: userContext.phone,
        user_address: userContext.address,
        user_city: userContext.city,
        user_postal_code: userContext.postalCode,
        plot: `Działka nr 123/4 w obrębie ${treeContext.location}`,
        cadastral_district: `Obręb ${communeContext.city}-Centrum`,
        record_keeping_unit: `Jednostka ewidencyjna ${communeContext.city}`,
        ownership_form: 'Własność prywatna',
        land_type: 'Grunt zabudowany',
        study_name: `Opracowanie dendrologiczne dla ${treeContext.species} w ${treeContext.location}`,
        study_author: `Dr ${userContext.name}`
      };
      
      // Filter mock data to only include fields that exist in the form
      const filteredMockData = Object.keys(mockData).reduce((acc, key) => {
        if (schema.requiredFields.some(field => field.name === key)) {
          acc[key] = mockData[key as keyof typeof mockData];
        }
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(prev => ({ ...prev, ...filteredMockData }));
      localStorage.setItem('applicationFormData', JSON.stringify({ ...formData, ...filteredMockData }));
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Clear saved form data after successful submission
      localStorage.removeItem('applicationFormData');
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    const baseInputClasses = `w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all ${
      error && touchedFields[field.name]
        ? 'border-red-500 dark:border-red-500' 
        : 'border-gray-300 dark:border-gray-600'
    }`;

    const labelClasses = `block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
      field.isRequired ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''
    }`;

    return (
      <motion.div
        key={field.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: field.order * 0.1 }}
        className="space-y-1"
      >
        <label className={labelClasses}>
          {field.label}
        </label>
        
        {field.helpText && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {field.helpText}
          </p>
        )}

        {field.type === 'TextArea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder || 'Wpisz tekst...'}
            rows={3}
            className={`${baseInputClasses} resize-none`}
          />
        ) : field.type === 'Select' ? (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            className={baseInputClasses}
          >
            <option value="">Wybierz opcję</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : field.type === 'Checkbox' ? (
          <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              onBlur={() => handleFieldBlur(field.name)}
              className="w-5 h-5 mt-0.5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
              {field.helpText && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {field.helpText}
                </p>
              )}
            </div>
          </div>
        ) : (
          <input
            type={field.type === 'Phone' ? 'tel' : field.type === 'Email' ? 'email' : field.type === 'Number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={
              field.type === 'Phone' ? 'np. +48 123 456 789' :
              field.name === 'user_postal_code' ? 'np. 30-001' :
              field.placeholder || ''
            }
            className={baseInputClasses}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )}

        {error && touchedFields[field.name] && (
          <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}
      </motion.div>
    );
  };

  // Sort fields by order and group them
  const sortedFields = [...schema.requiredFields].sort((a, b) => a.order - b.order);
  
  // Group fields by category
  const groupedFields = {
    contact: sortedFields.filter(field => field.name.startsWith('user_')),
    plot: sortedFields.filter(field => ['plot', 'cadastral_district', 'record_keeping_unit', 'ownership_form', 'land_type'].includes(field.name)),
    study: sortedFields.filter(field => field.name.startsWith('study_'))
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 overflow-y-auto">
      <div className="w-full px-3 sm:px-4">
         {/* Header with back button, title and auto-fill button */}
         <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
             {/* Back button - more to the left */}
             <button
               onClick={onBack}
               className="flex items-center justify-center p-1 rounded-lg transition-colors focus:outline-none focus:ring-0 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 hover:bg-gray-100 dark:hover:bg-gray-800"
               title="Powrót do tworzenia wniosków"
             >
               <ArrowLeft className="w-5 h-5" />
             </button>
            
             {/* Title centered - smaller with more space */}
             <div className="flex-1 px-6">
               <h1 className="text-xs font-semibold text-green-800 dark:text-green-200 text-center leading-tight">
                 {schema.templateName}
               </h1>
             </div>
            
             {/* Auto-fill button - more to the right */}
             <button
               onClick={handleAutoFill}
               disabled={isAutoFilling}
               className="flex items-center justify-center w-14 h-14 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
               title="Wypełnij automatycznie"
             >
               {isAutoFilling ? (
                 <Loader2 className="w-7 h-7 animate-spin" />
               ) : (
                 <Bot className="w-7 h-7 hover:animate-bounce" />
               )}
             </button>
          </div>
        </div>

         {/* Auto-fill information */}
         <div className="mb-3">
           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
             <p className="text-xs text-blue-700 dark:text-blue-300">
               <strong>Informacja:</strong> Dane zostały automatycznie wypełnione ze zgłoszenia i profilu, aby je zmienić przejdź do sekcji profil. Uzupełnij pozostałe pola ręcznie lub skorzystaj z asystenta AI.
             </p>
           </div>
         </div>

        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
           {/* Contact Data Section */}
           {groupedFields.contact.length > 0 && (
             <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Dane kontaktowe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {groupedFields.contact.map(renderField)}
              </div>
            </div>
          )}

           {/* Plot Data Section */}
           {groupedFields.plot.length > 0 && (
             <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-sky-200/50 dark:border-sky-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Dane działki
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {groupedFields.plot.map(renderField)}
              </div>
            </div>
          )}

           {/* Study Data Section */}
           {groupedFields.study.length > 0 && (
             <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-indigo-200/50 dark:border-indigo-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Dane opracowania
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {groupedFields.study.map(renderField)}
              </div>
            </div>
          )}

           {/* Other fields */}
           {sortedFields.filter(field => 
             !field.name.startsWith('user_') && 
             !['plot', 'cadastral_district', 'record_keeping_unit', 'ownership_form', 'land_type'].includes(field.name) &&
             !field.name.startsWith('study_')
           ).length > 0 && (
             <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-cyan-200/50 dark:border-cyan-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {sortedFields.filter(field => 
                  !field.name.startsWith('user_') && 
                  !['plot', 'cadastral_district', 'record_keeping_unit', 'ownership_form', 'land_type'].includes(field.name) &&
                  !field.name.startsWith('study_')
                ).map(renderField)}
              </div>
            </div>
          )}

          {/* Submit Button - Full width at bottom */}
          <div className="w-full pt-2">
            <GlassButton
              type="submit"
              disabled={!isFormValid || isSubmitting}
              variant="primary"
              size="sm"
              icon={isSubmitting ? Loader2 : FileText}
              className={`w-full text-sm ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Generowanie PDF...' : 'Wygeneruj wniosek'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
};