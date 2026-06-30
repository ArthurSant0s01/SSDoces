// Validation and form utilities

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (Brazilian)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(?(\d{2})\)?\s?9?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate CPF format
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

/**
 * Validate postal code (CEP)
 */
export function validateCEP(cep: string): boolean {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Mínimo 8 caracteres');
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione letras minúsculas');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione letras maiúsculas');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione números');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione caracteres especiais');
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

/**
 * Validate card number (Luhn algorithm)
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format and validate URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate form data
 */
export interface FormValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: any) => boolean;
    message?: string;
  };
}

export function validateForm(
  data: Record<string, any>,
  rules: FormValidationRules
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = rule.message || `${field} é obrigatório`;
      return;
    }

    if (value) {
      if (rule.minLength && value.toString().length < rule.minLength) {
        errors[field] = rule.message || `${field} deve ter no mínimo ${rule.minLength} caracteres`;
      }

      if (rule.maxLength && value.toString().length > rule.maxLength) {
        errors[field] = rule.message || `${field} deve ter no máximo ${rule.maxLength} caracteres`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} possui um formato inválido`;
      }

      if (rule.validate && !rule.validate(value)) {
        errors[field] = rule.message || `${field} é inválido`;
      }
    }
  });

  return errors;
}
