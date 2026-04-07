import { Request, Response } from 'express'
import { RewardService } from '../services/rewardService'

const service = new RewardService()

export const getRewards = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.walletAddress
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const rewards = await service.getRewards(userId, req.query as { status?: string; type?: string })
    res.json({ rewards })
  } catch {
    res.status(500).json({ error: 'Failed to get rewards' })
  }
}

export const redeemReward = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.walletAddress
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const reward = await service.redeemReward(userId, req.params.id)
    res.json({ success: true, reward })
  } catch (error: any) {
    const status = error.statusCode ?? 400
    res.status(status).json({ error: error.message ?? 'Failed to redeem reward' })
  }
}

export const getRewardHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.walletAddress
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const result = await service.getRewardHistory(userId)
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Failed to get reward history' })
  }
}
