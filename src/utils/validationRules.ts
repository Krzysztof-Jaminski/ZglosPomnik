/**
 * Centralized validation rules for the entire application
 * 
 * These rules must match the backend validation rules to ensure consistency
 * and prevent validation errors during form submission.
 */

// Validation patterns (regex)
export const ValidationPatterns = {
  // Phone: +48123456789 or 123-456-789 or (123) 456 789
  phone: /^\+?[0-9\s\-()]{9,20}$/,
  
  // Email: standard email format
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Postal code: 12-345 (Polish format)
  postalCode: /^\d{2}-\d{3}$/,
  
  // Website/URL
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
} as const;

// Validation error messages
export const ValidationMessages = {
  required: (fieldName: string) => `${fieldName} jest wymagane`,
  minLength: (fieldName: string, min: number) => `${fieldName} musi mieć co najmniej ${min} znaków`,
  maxLength: (fieldName: string, max: number) => `${fieldName} może mieć maksymalnie ${max} znaków`,
  min: (fieldName: string, min: number) => `${fieldName} musi być większe lub równe ${min}`,
  max: (fieldName: string, max: number) => `${fieldName} może być maksymalnie ${max}`,
  phone: 'Numer telefonu musi zawierać 9-20 cyfr i może zawierać spacje, myślniki, nawiasy lub znak +',
  email: 'Nieprawidłowy format adresu email',
  postalCode: 'Kod pocztowy musi być w formacie 12-345',
  url: 'Nieprawidłowy format adresu URL',
} as const;

// User validation rules
export const UserValidation = {
  firstname: {
    maxLength: 100,
  },
  lastname: {
    maxLength: 100,
  },
  email: {
    maxLength: 255,
    pattern: ValidationPatterns.email,
    message: ValidationMessages.email,
  },
  phone: {
    minLength: 9,
    maxLength: 20,
    pattern: ValidationPatterns.phone,
    message: ValidationMessages.phone,
  },
  address: {
    minLength: 1,
    maxLength: 150,
  },
  city: {
    minLength: 1,
    maxLength: 100,
  },
  postalCode: {
    maxLength: 10,
    pattern: ValidationPatterns.postalCode,
    message: ValidationMessages.postalCode,
  },
} as const;

// Tree submission validation rules
export const TreeSubmissionValidation = {
  circumference: {
    min: 1,
    max: 4000,
  },
  height: {
    min: 1,
    max: 150,
  },
  estimatedAge: {
    min: 450,
    max: 10000,
  },
  crownSpread: {
    min: 1,
    max: 200,
  },
  description: {
    maxLength: 1500,
  },
  legend: {
    maxLength: 2000,
  },
} as const;

// Tree species validation rules
export const TreeSpeciesValidation = {
  polishName: {
    maxLength: 200,
  },
  latinName: {
    maxLength: 200,
  },
  description: {
    maxLength: 1500,
  },
} as const;

// Application template validation rules
export const ApplicationTemplateValidation = {
  name: {
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
} as const;

// Commune validation rules
export const CommuneValidation = {
  name: {
    maxLength: 100,
  },
  address: {
    minLength: 5,
    maxLength: 150,
  },
  city: {
    minLength: 2,
    maxLength: 100,
  },
  province: {
    maxLength: 100,
  },
  postalCode: {
    maxLength: 10,
    pattern: ValidationPatterns.postalCode,
    message: ValidationMessages.postalCode,
  },
  phone: {
    minLength: 9,
    maxLength: 20,
    pattern: ValidationPatterns.phone,
    message: ValidationMessages.phone,
  },
  email: {
    maxLength: 255,
    pattern: ValidationPatterns.email,
    message: ValidationMessages.email,
  },
  website: {
    maxLength: 255,
    pattern: ValidationPatterns.url,
    message: ValidationMessages.url,
  },
} as const;

// Dynamic form fields validation rules (used in application forms)
export const DynamicFormFieldsValidation = {
  // Justification field
  justification: {
    minLength: 50,
    maxLength: 1500,
  },
  
  // Cost estimation
  estimated_care_cost: {
    min: 0,
    max: 10000,
  },
  
  // Responsible person
  responsible_person: {
    minLength: 1,
    maxLength: 200,
  },
  
  // Record keeping
  record_keeping_unit: {
    minLength: 1,
    maxLength: 100,
  },
  
  // Ownership
  ownership_form: {
    minLength: 1,
    maxLength: 100,
  },
  
  // Land type
  land_type: {
    minLength: 1,
    maxLength: 100,
  },
  
  // Study information
  study_name: {
    minLength: 1,
    maxLength: 100,
  },
  study_author: {
    minLength: 1,
    maxLength: 100,
  },
  
  // User fields (when not pre-filled)
  user_phone: {
    minLength: 9,
    maxLength: 20,
    pattern: ValidationPatterns.phone,
    message: ValidationMessages.phone,
  },
  user_address: {
    minLength: 1,
    maxLength: 150,
  },
  user_city: {
    minLength: 1,
    maxLength: 100,
  },
  user_postal_code: {
    maxLength: 10,
    pattern: ValidationPatterns.postalCode,
    message: ValidationMessages.postalCode,
  },
  
  // Tree description
  tree_description: {
    minLength: 1,
    maxLength: 100,
  },
  
  // Location fields
  location_address: {
    minLength: 1,
    maxLength: 200,
  },
  location_plot: {
    minLength: 1,
    maxLength: 15,
  },
  location_district: {
    minLength: 1,
    maxLength: 100,
  },
  location_commune: {
    minLength: 1,
    maxLength: 100,
  },
  location_county: {
    minLength: 1,
    maxLength: 100,
  },
  location_province: {
    minLength: 1,
    maxLength: 100,
  },
} as const;

/**
 * Helper function to validate a field value against validation rules
 * 
 * @param value - The value to validate
 * @param rules - The validation rules to apply
 * @param fieldName - The name of the field (for error messages)
 * @returns Error message if validation fails, null if validation passes
 */
export function validateField(
  value: any,
  rules: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  },
  fieldName: string
): string | null {
  // Check if value is empty
  const stringValue = value?.toString() || '';
  const numericValue = Number(value);
  
  // Min length validation
  if (rules.minLength !== undefined && stringValue.length < rules.minLength) {
    return ValidationMessages.minLength(fieldName, rules.minLength);
  }
  
  // Max length validation
  if (rules.maxLength !== undefined && stringValue.length > rules.maxLength) {
    return ValidationMessages.maxLength(fieldName, rules.maxLength);
  }
  
  // Min value validation
  if (rules.min !== undefined && !isNaN(numericValue) && numericValue < rules.min) {
    return ValidationMessages.min(fieldName, rules.min);
  }
  
  // Max value validation
  if (rules.max !== undefined && !isNaN(numericValue) && numericValue > rules.max) {
    return ValidationMessages.max(fieldName, rules.max);
  }
  
  // Pattern validation
  if (rules.pattern && stringValue && !rules.pattern.test(stringValue)) {
    return rules.message || 'Nieprawidłowy format';
  }
  
  return null;
}

/**
 * Helper function to get validation rules for a specific field type
 */
export function getValidationRules(category: string, fieldName: string) {
  switch (category) {
    case 'user':
      return (UserValidation as any)[fieldName];
    case 'treeSubmission':
      return (TreeSubmissionValidation as any)[fieldName];
    case 'treeSpecies':
      return (TreeSpeciesValidation as any)[fieldName];
    case 'applicationTemplate':
      return (ApplicationTemplateValidation as any)[fieldName];
    case 'commune':
      return (CommuneValidation as any)[fieldName];
    case 'dynamicFormFields':
      return (DynamicFormFieldsValidation as any)[fieldName];
    default:
      return null;
  }
}

