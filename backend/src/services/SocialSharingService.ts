import { PrismaClient } from '@prisma/client';
import { analyticsService } from './analyticsService';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('SocialSharingService');

export interface ShareMetadata {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export class SocialSharingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generates social sharing metadata for a specific achievement or milestone.
   */
  async getShareMetadata(type: 'achievement' | 'milestone', id: string): Promise<ShareMetadata> {
    const baseUrl = process.env.FRONTEND_URL || 'https://ajo.app';
    
    if (type === 'achievement') {
      const achievement = await this.prisma.achievement.findUnique({
        where: { id },
      });

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      return {
        title: `I unlocked the "${achievement.name}" achievement!`,
        description: achievement.description,
        imageUrl: `${baseUrl}/api/share/image/achievement/${id}`,
        url: `${baseUrl}/achievements/${id}`,
      };
    } else {
      // Assuming milestone is linked to a group or user progress
      // For now, handle it as a generic milestone
      return {
        title: `I reached a new savings milestone on Ajo!`,
        description: `Check out my progress on the decentralized savings platform.`,
        imageUrl: `${baseUrl}/api/share/image/milestone/${id}`,
        url: `${baseUrl}/milestones/${id}`,
      };
    }
  }

  /**
   * Tracks a social share event.
   */
  async trackShare(userId: string, platform: string, contentId: string, contentType: string): Promise<void> {
    logger.info('Social share tracked', { userId, platform, contentId, contentType });
    
    await analyticsService.saveEvent('social_share', {
      userId,
      platform,
      contentId,
      contentType,
      category: 'engagement',
    });
  }
}
