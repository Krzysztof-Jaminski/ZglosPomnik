import React, { useState, useEffect } from 'react';
import { FormField, FormSchema } from '../../types';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (formData: Record<string, any>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  onBack,
  isSubmitting = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateField = (field: FormField, value: any): string | null => {
    if (field.isRequired && (!value || value.toString().trim() === '')) {
      return `${field.label} jest wymagane`;
    }

    if (!value || value.toString().trim() === '') {
      return null; // Empty optional field is valid
    }

    const validation = field.validation;
    if (!validation) return null;

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
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
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

    const baseInputClasses = `w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
      error 
        ? 'border-red-500 dark:border-red-500' 
        : 'border-gray-300 dark:border-gray-600'
    }`;

    const labelClasses = `block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
      field.isRequired ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''
    }`;
    
    const validationInfo = field.validation ? 
      `Min: ${field.validation.minLength || 0} znaków, Max: ${field.validation.maxLength || '∞'}` : 
      field.isRequired ? 'Pole wymagane' : 'Pole opcjonalne';

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
        
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {validationInfo}
          </span>
          {field.isRequired && (
            <span className="text-xs text-red-500 font-medium">
              Wymagane
            </span>
          )}
        </div>

        {field.type === 'TextArea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={3}
            className={`${baseInputClasses} resize-none`}
          />
        ) : field.type === 'Select' ? (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
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
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.label}
            </span>
          </div>
        ) : (
          <input
            type={field.type === 'Phone' ? 'tel' : field.type === 'Email' ? 'email' : field.type === 'Number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            className={baseInputClasses}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )}

        {error && (
          <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </motion.div>
    );
  };

  // Sort fields by order
  const sortedFields = [...schema.requiredFields].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {schema.templateName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Wypełnij wszystkie wymagane pola formularza
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedFields.map(renderField)}
          </div>
        </div>

      </form>
    </motion.div>
  );
};

