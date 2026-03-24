import { Router } from 'express';
import {
    renderUnitTasksPage,
    getUnitTasks,
    updateAsigneeUser,
    createUnit,
    assignUserToUnit
} from '../controllers/unitsController';
import { authorize } from '../middlewares/roleMiddleware';

const router = Router();

// L'accès à la page d'allocation est réservé à ces rôles
router.use(authorize(['Administrateur', 'Team Manager']));

// Affichage et données du tableau d'allocation
router.get('/allocation', renderUnitTasksPage);
router.get('/api/data', getUnitTasks);
router.post('/update-assignee', updateAsigneeUser);

// Nouvelles routes pour la gestion des unités et affectations métier
// Seul l'administrateur peut créer une unité (la sécurité est aussi vérifiée dans le contrôleur)
router.post('/create', createUnit);

// Admin et Team Manager peuvent affecter des utilisateurs aux unités
router.post('/assign', assignUserToUnit);

export default router;