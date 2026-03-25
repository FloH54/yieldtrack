import { Router } from 'express';
import { renderUnitTasksPage, getUnitTasks, updateAsigneeUser } from '../controllers/unitsController';
import { authorize } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authorize(['Administrateur', 'Team Manager']));

router.get('/allocation', renderUnitTasksPage);
router.get('/api/data', getUnitTasks);
router.post('/update-assignee', updateAsigneeUser);

export default router;