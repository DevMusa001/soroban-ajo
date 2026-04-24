import { z } from 'zod'
import { commonValidationSchemas } from '../utils/validationUtils'

/**
 * API Request/Response validation schemas
 */

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// List response schema
export const listResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
})

// Single item response schema
export const itemResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
})

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
  timestamp: z.string().optional(),
})

// Group validation schemas
export const createGroupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  contributionAmount: z.number().int().positive('Contribution amount must be positive'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  maxMembers: z.number().int().min(2, 'At least 2 members required').max(100, 'Maximum 100 members'),
  admin: commonValidationSchemas.stellarAddress,
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>

export const updateGroupSchema = createGroupSchema.partial()

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>

// Member validation schemas
export const addMemberSchema = z.object({
  publicKey: commonValidationSchemas.stellarAddress,
  role: z.enum(['member', 'moderator']).default('member'),
})

export type AddMemberInput = z.infer<typeof addMemberSchema>

// Contribution validation schemas
export const createContributionSchema = z.object({
  groupId: commonValidationSchemas.uuid,
  amount: commonValidationSchemas.positiveInt,
  publicKey: commonValidationSchemas.stellarAddress,
})

export type CreateContributionInput = z.infer<typeof createContributionSchema>

// Transaction validation schemas
export const createTransactionSchema = z.object({
  groupId: commonValidationSchemas.uuid,
  type: z.enum(['contribution', 'payout', 'fee']),
  amount: commonValidationSchemas.positiveInt,
  description: z.string().max(500).optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

// Search validation schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query required').max(100),
  type: z.enum(['groups', 'members', 'transactions']).optional(),
  ...paginationSchema.shape,
})

export type SearchInput = z.infer<typeof searchSchema>

// Filter validation schemas
export const filterSchema = z.object({
  status: z.enum(['active', 'inactive', 'completed']).optional(),
  dateFrom: commonValidationSchemas.isoDate.optional(),
  dateTo: commonValidationSchemas.isoDate.optional(),
  minAmount: commonValidationSchemas.nonNegativeInt.optional(),
  maxAmount: commonValidationSchemas.positiveInt.optional(),
})

export type FilterInput = z.infer<typeof filterSchema>

// Batch operation schemas
export const batchOperationSchema = z.object({
  operations: z.array(
    z.object({
      id: commonValidationSchemas.uuid,
      action: z.enum(['update', 'delete', 'activate']),
      data: z.any().optional(),
    })
  ),
})

export type BatchOperationInput = z.infer<typeof batchOperationSchema>

// Webhook validation schemas
export const webhookSchema = z.object({
  url: commonValidationSchemas.url,
  events: z.array(z.string()).min(1, 'At least one event required'),
  active: z.boolean().default(true),
})

export type WebhookInput = z.infer<typeof webhookSchema>

// Export all schemas as a collection
export const validationSchemas = {
  pagination: paginationSchema,
  listResponse: listResponseSchema,
  itemResponse: itemResponseSchema,
  errorResponse: errorResponseSchema,
  createGroup: createGroupSchema,
  updateGroup: updateGroupSchema,
  addMember: addMemberSchema,
  createContribution: createContributionSchema,
  createTransaction: createTransactionSchema,
  search: searchSchema,
  filter: filterSchema,
  batchOperation: batchOperationSchema,
  webhook: webhookSchema,
}
