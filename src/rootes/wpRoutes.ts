import { Router } from 'express';
import {createWP, createWPFromTemplate, updateWP} from "../controllers/wpControllers";
import {authorize} from "../middlewares/roleMiddleware";
import {Roles} from "../config/roles";

const router = Router();

router.use(authorize([Roles.ADMINISTRATOR, Roles.PROGRAM_LEADER]));

router.post('/create', createWP); // URL: /wp/create
router.post('/update', updateWP);
router.post('/create-from-template', createWPFromTemplate);

export default router;