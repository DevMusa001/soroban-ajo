import DataLoader from 'dataloader'
import { prisma } from '@/config/database'

export const createDataLoaders = () => {
  const groupLoader = new DataLoader(async (groupIds: readonly string[]) => {
    const groups = await prisma.group.findMany({
      where: { id: { in: groupIds as string[] } },
    })
    const groupMap = new Map(groups.map(g => [g.id, g]))
    return groupIds.map(id => groupMap.get(id as string) || null)
  })

  const userLoader = new DataLoader(async (userIds: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
    })
    const userMap = new Map(users.map(u => [u.id, u]))
    return userIds.map(id => userMap.get(id as string) || null)
  })

  const memberCountLoader = new DataLoader(async (groupIds: readonly string[]) => {
    const counts = await prisma.groupMember.groupBy({
      by: ['groupId'],
      where: { groupId: { in: groupIds as string[] } },
      _count: true,
    })
    const countMap = new Map(counts.map(c => [c.groupId, c._count]))
    return groupIds.map(id => countMap.get(id as string) || 0)
  })

  return { groupLoader, userLoader, memberCountLoader }
}

export type DataLoaders = ReturnType<typeof createDataLoaders>
