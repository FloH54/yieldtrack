import express from 'express';
import {renderUsersPage, getUsersData, createUser, toggleUserStatus, updateUser} from '../controllers/userController';
import { authorize } from '../middlewares/roleMiddleware'; // <-- AJOUT

const router = express.Router();

// Applique la restriction stricte à toutes les routes de ce fichier
router.use(authorize(['Administrateur', 'Key User'])); // <-- AJOUT

router.get('/', renderUsersPage);
router.get('/api/data', getUsersData);
router.post('/create', createUser);
router.post('/update', updateUser);
router.post('/toggle-status', toggleUserStatus);

export default router;