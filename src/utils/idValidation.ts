import { GovernmentIdType } from '@/types/member';

export const validateAadhaar = (aadhaar: string): boolean => {
  // Remove spaces and hyphens
  const cleanAadhaar = aadhaar.replace(/[\s-]/g, '');
  
  // Check if it's exactly 12 digits
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    return false;
  }
  
  // Mock Verhoeff algorithm validation (simplified for demo)
  return true;
};

export const validatePAN = (pan: string): boolean => {
  // PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

export const validatePassport = (passport: string): boolean => {
  // Indian passport format: 1 letter followed by 7 digits
  const passportRegex = /^[A-Z][0-9]{7}$/;
  return passportRegex.test(passport.toUpperCase());
};

export const validateVoterId = (voterId: string): boolean => {
  // Voter ID format: 3 letters followed by 7 digits
  const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
  return voterIdRegex.test(voterId.toUpperCase());
};

export const validateGovernmentId = (type: GovernmentIdType, number: string): boolean => {
  switch (type) {
    case 'aadhaar':
      return validateAadhaar(number);
    case 'pan':
      return validatePAN(number);
    case 'passport':
      return validatePassport(number);
    case 'voter-id':
      return validateVoterId(number);
    default:
      return false;
  }
};

export const getIdValidationMessage = (type: GovernmentIdType): string => {
  switch (type) {
    case 'aadhaar':
      return 'Aadhaar should be 12 digits (spaces and hyphens allowed)';
    case 'pan':
      return 'PAN should be in format ABCDE1234F';
    case 'passport':
      return 'Passport should be 1 letter followed by 7 digits';
    case 'voter-id':
      return 'Voter ID should be 3 letters followed by 7 digits';
    default:
      return 'Invalid ID format';
  }
};

export const formatAadhaar = (aadhaar: string): string => {
  const clean = aadhaar.replace(/[\s-]/g, '');
  return clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
};