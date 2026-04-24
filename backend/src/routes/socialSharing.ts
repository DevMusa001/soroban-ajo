import { Router } from 'express';
import { socialSharingController } from '../controllers/socialSharingController';

const router = Router();

router.get('/metadata/:type/:id', socialSharingController.getMetadata);
router.get('/image/:type/:id', socialSharingController.getShareImage);
router.post('/track', socialSharingController.trackShare);

export { router as socialSharingRouter };
