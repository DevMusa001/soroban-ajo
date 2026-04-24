/**
 * Validation layer exports
 * Provides comprehensive data validation for the API
 */

export {
  formatValidationErrors,
  validateData,
  safeValidateData,
  createValidationSchema,
  composeSchemas,
  ValidationChain,
  commonValidationSchemas,
  responseValidationSchema,
  type ValidationErrorResponse,
  type ValidatedResponse,
} from '../utils/validationUtils'

export {
  createValidationMiddleware,
  validateBody,
  validateQuery,
  validateParams,
  createResponseValidationMiddleware,
  createConditionalValidationMiddleware,
  ValidationMiddlewareChain,
  buildValidationMiddleware,
} from '../middleware/validationMiddleware'

export {
  paginationSchema,
  listResponseSchema,
  itemResponseSchema,
  errorResponseSchema,
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
  createContributionSchema,
  createTransactionSchema,
  searchSchema,
  filterSchema,
  batchOperationSchema,
  webhookSchema,
  validationSchemas,
  type PaginationInput,
  type CreateGroupInput,
  type UpdateGroupInput,
  type AddMemberInput,
  type CreateContributionInput,
  type CreateTransactionInput,
  type SearchInput,
  type FilterInput,
  type BatchOperationInput,
  type WebhookInput,
} from '../schemas/validationSchemas'
