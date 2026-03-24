import express from 'express';
import { renderDirectorProjects, getAllProjectsData, toggleProjectStatus } from '../controllers/directorController';
import { authorize } from '../middlewares/roleMiddleware'; // <-- AJOUT

const router = express.Router();

// Cloisonnement strict pour la Direction Générale
router.use(authorize(['Administrateur', 'Direction Générale'])); // <-- AJOUT

router.get('/projects', renderDirectorProjects);
router.get('/projects/api/data', getAllProjectsData);
router.post('/projects/toggle-status', toggleProjectStatus);

export default router;