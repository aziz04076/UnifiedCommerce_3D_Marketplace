import { z } from 'zod';

/**
 * Input sanitization and validation utilities for UnifiedCommerce.
 * Enforces deny-by-default, field whitelisting, and strict type constraints.
 */

// ── HTML / XSS Stripper ──────────────────────────────────────────────────────
const DANGEROUS_TAGS_REGEX = /<(?:\/?[a-zA-Z0-9]+(?:\s+[^>]*?)?\/?>|!--.*?-->)/gi;
const SCRIPT_INJECTION_REGEX = /(?:javascript:|data:\s*text\/html|vbscript:|onload=|onerror=|onclick=)/gi;

/**
 * Strips HTML tags and harmful JavaScript pseudo-protocols from untrusted string inputs.
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(SCRIPT_INJECTION_REGEX, '')
    .trim();
}

// ── Common Zod Field Schemas ──────────────────────────────────────────────────

export const SafeStringSchema = z
  .string()
  .transform((val) => sanitizeString(val));

export const SafeTextareaSchema = z
  .string()
  .max(2000, 'Max length is 2000 characters')
  .transform((val) => sanitizeString(val));

export const PhoneSchema = z
  .string()
  .regex(/^[0-9+() -]{10,15}$/, 'Invalid phone number format')
  .transform((val) => val.replace(/[^0-9]/g, ''));

export const PincodeSchema = z
  .string()
  .regex(/^[0-9]{5,10}$/, 'Pincode must be between 5 and 10 numeric digits');

export const CurrencyAmountSchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .max(10_000_000, 'Amount exceeds platform transaction limit');

export const UuidSchema = z
  .string()
  .uuid('Must be a valid UUID');

// ── Order DTOs ───────────────────────────────────────────────────────────────

export const CartItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Minimum quantity is 1').max(100, 'Maximum quantity is 100'),
});

export const CreateCheckoutIntentSchema = z.object({
  cartItems: z.array(CartItemInputSchema).min(1, 'Cart cannot be empty').max(50),
  deliveryPincode: PincodeSchema.optional(),
  idempotencyKey: UuidSchema,
  shippingAddress: z.object({
    fullName: SafeStringSchema.pipe(z.string().min(2).max(100)),
    phone: PhoneSchema,
    street: SafeStringSchema.pipe(z.string().min(5).max(250)),
    city: SafeStringSchema.pipe(z.string().min(2).max(100)),
    state: SafeStringSchema.pipe(z.string().min(2).max(100)),
    pincode: PincodeSchema,
  }),
  paymentMethod: z.enum(['RAZORPAY', 'COD', 'STRIPE']),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must review and accept our store policies',
  }),
});

export type CreateCheckoutIntentInput = z.infer<typeof CreateCheckoutIntentSchema>;

// ── Product Creation DTO ──────────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name: SafeStringSchema.pipe(z.string().min(2).max(150)),
  price: CurrencyAmountSchema.refine((val) => val > 0, 'Price must be greater than zero'),
  stock: z.number().int().nonnegative(),
  category: SafeStringSchema.pipe(z.string().min(2).max(50)),
  description: SafeTextareaSchema.optional().default(''),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// ── Staff Member DTO ──────────────────────────────────────────────────────────

export const StaffInviteSchema = z.object({
  name: SafeStringSchema.pipe(z.string().min(2).max(100)),
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum(['orders_only', 'products_only']),
});

export type StaffInviteInput = z.infer<typeof StaffInviteSchema>;
