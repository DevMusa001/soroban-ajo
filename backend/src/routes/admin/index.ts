import { Router } from 'express'
import { adminQueuesRouter } from './queues'

const router = Router()

// Admin routes
router.use('/queues', adminQueuesRouter)

export const adminRouter = router
