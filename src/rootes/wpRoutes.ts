import { Router, Request, Response } from 'express';
import {createWP} from "../controllers/wpControllers";
import {createTask} from "../controllers/tasksController";


const router = Router();

router.post('/create-wp', createWP);
router.post('/create-task', createTask)

export default router;