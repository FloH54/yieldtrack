import { Router } from 'express';
import { renderExportPage, exportTasksData, exportRWsData } from '../controllers/exportController';
// import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Optionnel: Protéger toutes les routes
// router.use(requireAuth);

// Page web
router.get('/data-export', renderExportPage);

// Endpoints pour générer la donnée brute (JSON)
router.get('/api/export/tasks', exportTasksData);
router.get('/api/export/rws', exportRWsData);

export default router;