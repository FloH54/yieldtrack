import { Router } from 'express';
import {createWP, createWPFromTemplate, updateWP} from "../controllers/wpControllers";
import {authorize} from "../middlewares/roleMiddleware";

const router = Router();

router.use(authorize(['Administrateur', 'Program Leader'])); // <-- AJOUT

router.post('/create', createWP); // URL: /wp/create
router.post('/update', updateWP);
router.post('/create-from-template', createWPFromTemplate);

export default router;