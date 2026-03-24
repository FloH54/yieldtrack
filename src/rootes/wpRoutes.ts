import { Router } from 'express';
import {createWP, updateWP} from "../controllers/wpControllers";
import {authorize} from "../middlewares/roleMiddleware";

const router = Router();

router.use(authorize(['Administrateur', 'Program Manager'])); // <-- AJOUT

router.post('/create', createWP); // URL: /wp/create
router.post('/update', updateWP);

export default router;