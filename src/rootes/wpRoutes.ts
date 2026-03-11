import { Router } from 'express';
// Supprimez renderWPDetails de l'import
import { createWP } from "../controllers/wpControllers";

const router = Router();

router.post('/create', createWP); // URL: /wp/create

export default router;