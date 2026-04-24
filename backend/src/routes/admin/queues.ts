import { Router, Request, Response } from 'express'
import { getAllQueues, getQueueStats } from '../../queues/queueManager'
import { logger } from '../../utils/logger'

const router = Router()

/**
 * GET /admin/queues - Get all queue statistics
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const queues = getAllQueues()
    const stats: Record<string, any> = {}

    for (const [name] of queues) {
      const queueStats = await getQueueStats(name)
      stats[name] = queueStats
    }

    res.json({
      success: true,
      data: {
        queues: Array.from(queues.keys()),
        stats,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch queue stats', { error: error instanceof Error ? error.message : String(error) })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch queue statistics',
    })
  }
})

/**
 * GET /admin/queues/:name - Get specific queue statistics
 */
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params
    const stats = await getQueueStats(name)

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: `Queue ${name} not found`,
      })
    }

    res.json({
      success: true,
      data: {
        name,
        stats,
      },
    })
  } catch (error) {
    logger.error(`Failed to fetch queue stats for ${req.params.name}`, {
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch queue statistics',
    })
  }
})

export const adminQueuesRouter = router
