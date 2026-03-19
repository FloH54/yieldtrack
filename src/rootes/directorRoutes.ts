import express from 'express';
import { renderDirectorProjects, getAllProjectsData, toggleProjectStatus } from '../controllers/directorController';

const router = express.Router();

router.get('/projects', renderDirectorProjects);
router.get('/projects/api/data', getAllProjectsData);
router.post('/projects/toggle-status', toggleProjectStatus);

export default router;