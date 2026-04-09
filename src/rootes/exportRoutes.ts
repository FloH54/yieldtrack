import { Router } from 'express';
import { renderExportPage, exportTasksData, exportRWsData } from '../controllers/exportController';
import {Roles} from "../config/roles";
import {authorize} from "../middlewares/roleMiddleware";
// import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();


// Page web
router.get('/data-export', renderExportPage);

// Endpoints pour générer la donnée brute (JSON)
router.get('/api/export/tasks', exportTasksData);
router.get('/api/export/rws', exportRWsData);

export default router;