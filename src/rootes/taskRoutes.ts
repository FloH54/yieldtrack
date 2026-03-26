import { Router } from 'express';
import {
    archiveTask,
    renderRemainingPage,
    createTask,
    getRemainingTasksData,
    updateTask, bulkSubmitRW, getTaskRWHistory
} from '../controllers/tasksController';

const router = Router();

router.get('/', renderRemainingPage);
router.get('/api/data', getRemainingTasksData);
router.post("/archive", archiveTask);
router.post('/create', createTask);
router.post('/update', updateTask);
router.post('/bulk-rw', bulkSubmitRW);
router.get('/api/history/:id', getTaskRWHistory);
export default router;