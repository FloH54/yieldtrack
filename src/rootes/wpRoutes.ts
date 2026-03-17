import { Router } from 'express';
// Supprimez renderWPDetails de l'import
import {createWP, updateWP} from "../controllers/wpControllers";

const router = Router();

router.post('/create', createWP); // URL: /wp/create
router.post('/update', updateWP);

export default router;