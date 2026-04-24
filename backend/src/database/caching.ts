import Redis from 'ioredis'
import { logger } from '@/utils/logger'

export class CacheManager {
  private static redis: Redis

  static initialize(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379')
    this.redis.on('error', (err) => logger.error('Redis error:', err))
    return this.redis
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logger.error(`Cache get error for ${key}:`, error)
      return null
    }
  }

  static async set(key: string, value: any, ttl = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      logger.error(`Cache set error for ${key}:`, error)
    }
  }

  static async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      logger.error(`Cache invalidate error for ${pattern}:`, error)
    }
  }

  static async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit()
    }
  }
}
