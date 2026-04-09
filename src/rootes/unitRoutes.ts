import { Router } from 'express';
import { renderUnitTasksPage, getUnitTasks, updateAsigneeUser } from '../controllers/unitsController';
import { authorize } from '../middlewares/roleMiddleware';
import {Roles} from "../config/roles";

const router = Router();

router.use(authorize([Roles.ADMINISTRATOR, Roles.TEAM_MANAGER]));

router.get('/allocation', renderUnitTasksPage);
router.get('/api/data', getUnitTasks);
router.post('/update-assignee', updateAsigneeUser);

export default router;