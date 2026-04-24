import { IResolvers } from '@graphql-tools/utils'
import { DataLoaders } from '../dataloader'
import { prisma } from '@/config/database'

export const resolvers: IResolvers = {
  Query: {
    groups: async (_: any, { page = 1, limit = 10 }: any) => {
      const skip = (page - 1) * limit
      const [data, total] = await Promise.all([
        prisma.group.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.group.count(),
      ])
      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    },

    group: async (_: any, { id }: any, { loaders }: any) => {
      return loaders.groupLoader.load(id)
    },

    goals: async (_: any, { userId }: any) => {
      return prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    },

    goal: async (_: any, { id }: any) => {
      return prisma.goal.findUnique({ where: { id } })
    },

    rewards: async (_: any, { userId, status, type }: any) => {
      return prisma.reward.findMany({
        where: { userId, ...(status && { status }), ...(type && { type }) },
        orderBy: { earnedAt: 'desc' },
      })
    },

    rewardHistory: async (_: any, { userId }: any) => {
      const history = await prisma.reward.findMany({ where: { userId } })
      const totalEarned = history.filter(r => r.status === 'earned').length
      const totalRedeemed = history.filter(r => r.status === 'redeemed').length
      return { history, totalEarned, totalRedeemed }
    },
  },

  Mutation: {
    createGoal: async (_: any, args: any) => {
      return prisma.goal.create({ data: args })
    },

    updateGoal: async (_: any, { id, ...data }: any) => {
      return prisma.goal.update({ where: { id }, data })
    },

    deleteGoal: async (_: any, { id }: any) => {
      await prisma.goal.delete({ where: { id } })
      return true
    },

    redeemReward: async (_: any, { userId, rewardId }: any) => {
      return prisma.reward.update({
        where: { id: rewardId },
        data: { status: 'redeemed' },
      })
    },
  },

  Group: {
    memberCount: async (parent: any, _: any, { loaders }: any) => {
      return loaders.memberCountLoader.load(parent.id)
    },
  },
}
