import { z } from 'zod';

// ── Common re-usable schemas
const emailSchema = z
  .string({ required_error: 'Email is required' })
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s\-().]{10,20}$/, 'Please enter a valid phone number (min 10 digits)');

// ── Register form
export const registerSchema = z.object({
  firstName:   z.string().min(1, 'First name is required').max(50),
  lastName:    z.string().min(1, 'Last name is required').max(50),
  email:       emailSchema,
  password:    passwordSchema,
  confirm:     z.string().min(1, 'Please confirm your password'),
  companyName: z.string().min(1, 'Company name is required').max(100),
  phone:       phoneSchema,
  industry:    z.string().min(1, 'Please select your industry'),
  location:    z.string().min(1, 'Please select your country'),
  companySize: z.string().optional(),
  website:     z.string().url('Please enter a valid URL (https://...)').optional().or(z.literal('')),
}).refine(data => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

// ── Login form
export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ── Forgot password
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// ── Reset password
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirm:  z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

// ── Update password
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     passwordSchema,
  confirm:         z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

// ── Contact form
export const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:   emailSchema,
  phone:   phoneSchema,
  subject: z.string().max(200).optional(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters'),
  company: z.string().max(100).optional(),
});

// ── Create user (admin)
export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName:  z.string().min(1, 'Last name is required').max(50),
  email:     emailSchema,
  password:  passwordSchema,
  role:      z.enum(['client_admin', 'staff', 'viewer']),
  phone:     phoneSchema.optional().or(z.literal('')),
});

// ── Profile settings
export const profileSchema = z.object({
  firstName:   z.string().min(1, 'First name is required').max(50),
  lastName:    z.string().min(1, 'Last name is required').max(50),
  email:       emailSchema,
  phone:       phoneSchema.optional().or(z.literal('')),
  companyName: z.string().optional(),
  website:     z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

// ── Blog post
export const blogSchema = z.object({
  title:    z.string().min(3, 'Title must be at least 3 characters').max(200),
  excerpt:  z.string().max(500).optional(),
  content:  z.string().min(10, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  tags:     z.array(z.string()).optional(),
  status:   z.enum(['draft', 'published', 'archived']),
  seo: z.object({
    metaTitle:       z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
  }).optional(),
});

// ── Plan
export const planSchema = z.object({
  name:         z.string().min(1, 'Plan name is required'),
  description:  z.string().optional(),
  monthlyPrice: z.coerce.number().min(0, 'Price must be 0 or more'),
  yearlyPrice:  z.coerce.number().min(0, 'Price must be 0 or more'),
  maxUsers:     z.coerce.number().min(1, 'Must allow at least 1 user'),
  maxStorage:   z.string().min(1, 'Storage limit required'),
  isPopular:    z.boolean().optional(),
  isActive:     z.boolean().optional(),
});

// ── Module
export const moduleSchema = z.object({
  name:        z.string().min(1, 'Module name required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon:        z.string().optional(),
  category:    z.enum(['core','business','analytics','hr','finance','crm','operations']),
  isPremium:   z.boolean().optional(),
  isActive:    z.boolean().optional(),
});

// ── Dynamic record (client module)
export const dynamicRecordSchema = z.record(z.string(), z.any()).refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

export type RegisterFormData    = z.infer<typeof registerSchema>;
export type LoginFormData       = z.infer<typeof loginSchema>;
export type ContactFormData     = z.infer<typeof contactSchema>;
export type CreateUserFormData  = z.infer<typeof createUserSchema>;
export type ProfileFormData     = z.infer<typeof profileSchema>;
export type BlogFormData        = z.infer<typeof blogSchema>;
export type PlanFormData        = z.infer<typeof planSchema>;
export type ModuleFormData      = z.infer<typeof moduleSchema>;
