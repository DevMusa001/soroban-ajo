import { z, ZodError, ZodSchema } from 'zod'
import { logger } from './logger'

/**
 * Formatted validation error for API responses
 */
export interface ValidationErrorResponse {
  success: false
  error: string
  code: string
  details: Array<{
    path: string
    message: string
    code: string
    received?: unknown
    expected?: string
  }>
  timestamp: string
}

/**
 * Format Zod validation errors into a user-friendly response
 */
export function formatValidationErrors(error: ZodError): ValidationErrorResponse {
  return {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: error.errors.map((err) => ({
      path: err.path.join('.') || 'root',
      message: err.message,
      code: err.code,
      received: err.received,
      expected: getExpectedType(err),
    })),
    timestamp: new Date().toISOString(),
  }
}

/**
 * Extract expected type from Zod error
 */
function getExpectedType(error: z.ZodIssue): string | undefined {
  if (error.code === 'invalid_type') {
    return (error as any).expected
  }
  if (error.code === 'invalid_enum_value') {
    return `one of: ${(error as any).options?.join(', ')}`
  }
  if (error.code === 'too_small') {
    return `minimum ${(error as any).minimum} characters`
  }
  if (error.code === 'too_big') {
    return `maximum ${(error as any).maximum} characters`
  }
  return undefined
}

/**
 * Validate data against a schema and throw formatted error
 */
export async function validateData<T>(schema: ZodSchema<T>, data: unknown, context?: string): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn(`Validation error${context ? ` in ${context}` : ''}`, {
        errors: error.errors,
        data: sanitizeForLogging(data),
      })
      throw error
    }
    throw error
  }
}

/**
 * Safe validation that returns result object
 */
export function safeValidateData<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ValidationErrorResponse } {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return { success: false, error: formatValidationErrors(result.error) }
  } catch (error) {
    logger.error('Unexpected validation error', { error })
    return {
      success: false,
      error: {
        success: false,
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: [],
        timestamp: new Date().toISOString(),
      },
    }
  }
}

/**
 * Sanitize data for logging (remove sensitive fields)
 */
function sanitizeForLogging(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey', 'authorization']
  const sanitized = { ...data }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      ;(sanitized as any)[field] = '[REDACTED]'
    }
  }

  return sanitized
}

/**
 * Create a validation schema with custom error messages
 */
export function createValidationSchema<T extends z.ZodRawShape>(shape: T, description?: string) {
  return z.object(shape).describe(description || 'Validation schema')
}

/**
 * Compose multiple schemas for complex validation
 */
export function composeSchemas<T extends readonly ZodSchema[]>(...schemas: T) {
  return z.intersection(schemas[0], schemas[1]).and(schemas[2] || z.object({}))
}

/**
 * Create a reusable validation chain
 */
export class ValidationChain<T = any> {
  private schema: ZodSchema<T>

  constructor(schema: ZodSchema<T>) {
    this.schema = schema
  }

  async validate(data: unknown): Promise<T> {
    return validateData(this.schema, data)
  }

  safeValidate(data: unknown) {
    return safeValidateData(this.schema, data)
  }

  getSchema() {
    return this.schema
  }

  extend<U>(extendedSchema: ZodSchema<U>) {
    return new ValidationChain(z.intersection(this.schema, extendedSchema))
  }
}

/**
 * Common validation schemas
 */
export const commonValidationSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Email validation
  email: z.string().email('Invalid email format'),

  // URL validation
  url: z.string().url('Invalid URL format'),

  // Stellar address validation
  stellarAddress: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid Stellar address format'),

  // Positive integer
  positiveInt: z.number().int().positive('Must be a positive integer'),

  // Non-negative integer
  nonNegativeInt: z.number().int().nonnegative('Must be non-negative'),

  // Percentage (0-100)
  percentage: z.number().min(0).max(100, 'Must be between 0 and 100'),

  // ISO date string
  isoDate: z.string().datetime('Invalid ISO date format'),

  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),

  // Sorting
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
}

/**
 * Response validation schema
 */
export const responseValidationSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  code: z.string().optional(),
  details: z.any().optional(),
})

export type ValidatedResponse = z.infer<typeof responseValidationSchema>
