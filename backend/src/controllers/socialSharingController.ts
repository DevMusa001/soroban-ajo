import { Request, Response } from 'express';
import { SocialSharingService } from '../services/SocialSharingService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const socialSharingService = new SocialSharingService(prisma);

export const socialSharingController = {
  async getMetadata(req: Request, res: Response) {
    try {
      const { type, id } = req.params;
      const metadata = await socialSharingService.getShareMetadata(type as any, id);
      res.json({ success: true, data: metadata });
    } catch (error) {
      res.status(404).json({ success: false, error: (error as Error).message });
    }
  },

  async trackShare(req: Request, res: Response) {
    try {
      const { userId, platform, contentId, contentType } = req.body;
      await socialSharingService.trackShare(userId, platform, contentId, contentType);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  async getShareImage(req: Request, res: Response) {
    try {
      const { type, id } = req.params;
      const metadata = await socialSharingService.getShareMetadata(type as any, id);
      
      // Simple branded SVG generator for social previews
      const svg = `
        <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#grad1)"/>
          <text x="600" y="280" font-family="sans-serif" font-weight="bold" font-size="50" fill="#ffffff" text-anchor="middle">${metadata.title}</text>
          <text x="600" y="360" font-family="sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">${metadata.description}</text>
          <rect x="500" y="480" width="200" height="4" fill="#38bdf8" rx="2"/>
          <text x="600" y="550" font-family="sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle">AJO | DECENTRALIZED SAVINGS</text>
          <text x="600" y="580" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Powered by Soroban &amp; Stellar</text>
        </svg>
      `;
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
      res.send(svg);
    } catch (error) {
      res.status(404).send('Image not found');
    }
  },
};
