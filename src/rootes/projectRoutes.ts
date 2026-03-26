import express from 'express';
import {
    renderProjectsPage, getProjectsData, renderProjectDetails,
    getProjectWPsData, createProject, updateProject
} from '../controllers/projectController';
import { renderWPDetails, getWPTasksData } from '../controllers/wpControllers';

import { authorize } from '../middlewares/roleMiddleware';

const router = express.Router();

// On autorise l'accès aux routes de base à ces 3 profils.
// Le contrôleur fait ensuite le tri (les Leaders ne voient que leurs projets, etc.)
router.use(authorize(['Administrateur', 'Program Manager', 'Program Leader']));

router.get('/', renderProjectsPage);
router.get('/api/data', getProjectsData);
router.post('/create', createProject);  // Sécurisé dans le contrôleur (Admin/Manager uniquement)
router.post('/updtate', updateProject); // Sécurisé dans le contrôleur (Admin/Manager uniquement)

router.get('/:slug', renderProjectDetails);
router.get('/:slug/api/wps', getProjectWPsData);

router.get('/:projectSlug/wp/:wpSlug', renderWPDetails);
router.get('/:projectSlug/wp/:wpSlug/api/tasks', getWPTasksData);

export default router;