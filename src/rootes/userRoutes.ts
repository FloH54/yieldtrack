import express from 'express';
import {renderUsersPage, getUsersData, createUser, toggleUserStatus, updateUser} from '../controllers/userController';

const router = express.Router();

router.get('/', renderUsersPage);
router.get('/api/data', getUsersData);
router.post('/create', createUser);
router.post('/update', updateUser);
router.post('/toggle-status', toggleUserStatus);

export default router;