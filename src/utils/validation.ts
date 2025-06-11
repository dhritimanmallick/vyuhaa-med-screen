
import { z } from 'zod';

// User input validation schemas
export const emailSchema = z.string().email("Invalid email format");

export const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const nameSchema = z.string()
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

export const roleSchema = z.enum(['admin', 'pathologist', 'accession', 'technician', 'customer']);

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Validation helpers
export const validateUser = (data: {
  email: string;
  password?: string;
  name: string;
  role: string;
}) => {
  try {
    emailSchema.parse(data.email);
    if (data.password) {
      passwordSchema.parse(data.password);
    }
    nameSchema.parse(data.name);
    roleSchema.parse(data.role);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      isValid: false,
      errors: ['Validation failed']
    };
  }
};
