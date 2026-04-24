import { prisma } from '@/config/database'
import { logger } from '@/utils/logger'

export class QueryOptimizer {
  static async analyzeQueries() {
    const analysis = {
      slowQueries: [] as any[],
      nPlusOnePatterns: [] as any[],
      indexRecommendations: [] as any[],
    }

    try {
      const result = await prisma.$queryRaw`
        SELECT query, calls, total_time, mean_time
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 20
      `
      analysis.slowQueries = result as any[]
    } catch (error) {
      logger.warn('Could not analyze slow queries')
    }

    return analysis
  }

  static async optimizeGroupQueries() {
    return {
      findGroupsWithMembers: async (page = 1, limit = 10) => {
        const skip = (page - 1) * limit
        return prisma.group.findMany({
          skip,
          take: limit,
          include: {
            members: { select: { id: true, userId: true } },
            contributions: { select: { id: true, amount: true } },
          },
          orderBy: { createdAt: 'desc' },
        })
      },

      findGroupById: async (id: string) => {
        return prisma.group.findUnique({
          where: { id },
          include: {
            members: { include: { user: { select: { id: true, name: true, email: true } } } },
            contributions: { orderBy: { createdAt: 'desc' }, take: 10 },
          },
        })
      },
    }
  }

  static async optimizeUserQueries() {
    return {
      findUserWithStats: async (userId: string) => {
        const [user, groupCount, contributionSum] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId } }),
          prisma.groupMember.count({ where: { userId } }),
          prisma.contribution.aggregate({
            where: { userId },
            _sum: { amount: true },
          }),
        ])

        return {
          ...user,
          groupCount,
          totalContributed: contributionSum._sum.amount || 0,
        }
      },
    }
  }
}
