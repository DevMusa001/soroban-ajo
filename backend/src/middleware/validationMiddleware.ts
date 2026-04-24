import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { formatValidationErrors } from '../utils/validationUtils'
import { logger } from '../utils/logger'

/**
 * Validation middleware factory for request validation
 * Supports validating body, query, and params
 */
export function createValidationMiddleware(schemas: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }

      // Validate query
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query)
      }

      // Validate params
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params)
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatValidationErrors(error)
        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          errors: error.errors,
        })
        return res.status(400).json(formattedError)
      }

      next(error)
    }
  }
}

/**
 * Validation middleware for body only
 */
export function validateBody(schema: ZodSchema) {
  return createValidationMiddleware({ body: schema })
}

/**
 * Validation middleware for query only
 */
export function validateQuery(schema: ZodSchema) {
  return createValidationMiddleware({ query: schema })
}

/**
 * Validation middleware for params only
 */
export function validateParams(schema: ZodSchema) {
  return createValidationMiddleware({ params: schema })
}

/**
 * Response validation middleware
 * Validates outgoing responses against a schema
 */
export function createResponseValidationMiddleware(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res)

    res.json = function (body: any) {
      try {
        const validated = schema.parse(body)
        return originalJson(validated)
      } catch (error) {
        if (error instanceof ZodError) {
          logger.error('Response validation failed', {
            path: req.path,
            method: req.method,
            errors: error.errors,
            body,
          })
          // Still send the response but log the error
          return originalJson(body)
        }
        throw error
      }
    }

    next()
  }
}

/**
 * Conditional validation middleware
 * Validates based on a condition
 */
export function createConditionalValidationMiddleware(
  condition: (req: Request) => boolean,
  schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!condition(req)) {
      return next()
    }

    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query)
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params)
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatValidationErrors(error)
        return res.status(400).json(formattedError)
      }

      next(error)
    }
  }
}

/**
 * Chained validation middleware
 * Allows multiple validation schemas to be applied in sequence
 */
export class ValidationMiddlewareChain {
  private middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = []

  addValidation(schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) {
    this.middlewares.push(createValidationMiddleware(schemas))
    return this
  }

  addBodyValidation(schema: ZodSchema) {
    this.middlewares.push(validateBody(schema))
    return this
  }

  addQueryValidation(schema: ZodSchema) {
    this.middlewares.push(validateQuery(schema))
    return this
  }

  addParamsValidation(schema: ZodSchema) {
    this.middlewares.push(validateParams(schema))
    return this
  }

  addResponseValidation(schema: ZodSchema) {
    this.middlewares.push(createResponseValidationMiddleware(schema))
    return this
  }

  build() {
    return this.middlewares
  }

  apply(router: any, path: string, handler: any) {
    router.post(path, ...this.middlewares, handler)
    return this
  }
}

/**
 * Type-safe validation middleware builder
 */
export function buildValidationMiddleware<T extends Record<string, ZodSchema>>(schemas: T) {
  return {
    body: schemas.body ? validateBody(schemas.body) : undefined,
    query: schemas.query ? validateQuery(schemas.query) : undefined,
    params: schemas.params ? validateParams(schemas.params) : undefined,
    response: schemas.response ? createResponseValidationMiddleware(schemas.response) : undefined,
  }
}
