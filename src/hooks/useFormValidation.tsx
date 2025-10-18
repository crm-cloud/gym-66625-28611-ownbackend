
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

interface FieldConfig {
  required?: boolean;
  rules?: ValidationRule[];
  transform?: (value: any) => any;
}

interface FormConfig {
  [key: string]: FieldConfig;
}

interface FormErrors {
  [key: string]: string;
}

interface UseFormValidationReturn {
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
  validateField: (fieldName: string, value: any) => boolean;
  validateForm: (data: any) => boolean;
  clearErrors: (fieldName?: string) => void;
  setSubmitting: (submitting: boolean) => void;
  showErrorToast: (message?: string) => void;
  showSuccessToast: (message: string) => void;
}

export const useFormValidation = (config: FormConfig): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((fieldName: string, value: any): boolean => {
    const fieldConfig = config[fieldName];
    if (!fieldConfig) return true;

    let errorMessage = '';

    // Required validation
    if (fieldConfig.required && (!value || value === '' || value === null || value === undefined)) {
      errorMessage = `This field is required`;
    }

    // Custom rules validation
    if (!errorMessage && fieldConfig.rules && value) {
      for (const rule of fieldConfig.rules) {
        if (!rule.validate(value)) {
          errorMessage = rule.message;
          break;
        }
      }
    }

    // Update errors state
    setErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });

    return !errorMessage;
  }, [config]);

  const validateForm = useCallback((data: any): boolean => {
    const newErrors: FormErrors = {};
    let isFormValid = true;

    Object.keys(config).forEach(fieldName => {
      const fieldConfig = config[fieldName];
      const value = data[fieldName];
      let errorMessage = '';

      // Required validation
      if (fieldConfig.required && (!value || value === '' || value === null || value === undefined)) {
        errorMessage = 'This field is required';
        isFormValid = false;
      }

      // Custom rules validation
      if (!errorMessage && fieldConfig.rules && value) {
        for (const rule of fieldConfig.rules) {
          if (!rule.validate(value)) {
            errorMessage = rule.message;
            isFormValid = false;
            break;
          }
        }
      }

      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [config]);

  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const showErrorToast = useCallback((message?: string) => {
    toast({
      title: "Validation Error",
      description: message || "Please check the form for errors.",
      variant: "destructive",
    });
  }, []);

  const showSuccessToast = useCallback((message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default",
    });
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    isSubmitting,
    validateField,
    validateForm,
    clearErrors,
    setSubmitting,
    showErrorToast,
    showSuccessToast
  };
};

// Common validation rules
export const validationRules = {
  required: {
    validate: (value: any) => value !== null && value !== undefined && value !== '',
    message: 'This field is required'
  },
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  phone: {
    validate: (value: string) => /^\+?[\d\s-()]+$/.test(value),
    message: 'Please enter a valid phone number'
  },
  minLength: (length: number) => ({
    validate: (value: string) => value.length >= length,
    message: `Must be at least ${length} characters long`
  }),
  maxLength: (length: number) => ({
    validate: (value: string) => value.length <= length,
    message: `Must be no more than ${length} characters long`
  }),
  numeric: {
    validate: (value: string) => /^\d+$/.test(value),
    message: 'Must contain only numbers'
  },
  alphanumeric: {
    validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    message: 'Must contain only letters and numbers'
  }
};
