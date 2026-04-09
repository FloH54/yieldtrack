import express from 'express';
import { renderUsersPage, getUsersData, createUser, toggleUserStatus, updateUser, createUnit } from '../controllers/userController';
import { authorize } from '../middlewares/roleMiddleware';
import {Roles} from "../config/roles";

const router = express.Router();

router.use(authorize([Roles.ADMINISTRATOR, Roles.KEY_USER]));

router.get('/', renderUsersPage);
router.get('/api/data', getUsersData);
router.post('/create', createUser);
router.post('/update', updateUser);
router.post('/toggle-status', toggleUserStatus);

// Nouvelle route pour la création d'unité
router.post('/create-unit', createUnit);

export default router;