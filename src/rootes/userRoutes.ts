import express from 'express';
import { renderUsersPage, getUsersData, createUser, toggleUserStatus, updateUser, createUnit } from '../controllers/userController';
import { authorize } from '../middlewares/roleMiddleware';

const router = express.Router();

router.use(authorize(['Administrateur', 'Key User']));

router.get('/', renderUsersPage);
router.get('/api/data', getUsersData);
router.post('/create', createUser);
router.post('/update', updateUser);
router.post('/toggle-status', toggleUserStatus);

// Nouvelle route pour la création d'unité
router.post('/create-unit', createUnit);

export default router;