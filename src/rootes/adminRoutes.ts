import { Router } from 'express';
import {
    renderUnitsAdminPage,
    renderCodesAdminPage,
    getUnitsData,
    getCodesData,
    createUnit,
    updateUnit,
    deleteUnit,
    createCode,
    updateCode,
    deleteCode
} from '../controllers/adminResourcesController';
import {authorize} from "../middlewares/roleMiddleware";



const router = Router();

// Optionnel: Protéger toutes les routes admin
router.use(authorize(['Administrateur']));

// --- Pages EJS ---
router.get('/units', renderUnitsAdminPage);
router.get('/codes', renderCodesAdminPage);

// --- API DataTables (JSON) ---
router.get('/api/admin/units/data', getUnitsData);
router.get('/api/admin/codes/data', getCodesData);

// --- API CRUD Units ---
router.post('/api/admin/units', createUnit);
router.put('/api/admin/units', updateUnit);
router.delete('/api/admin/units', deleteUnit);

// --- API CRUD Codes ---
router.post('/api/admin/codes', createCode);
router.put('/api/admin/codes', updateCode);
router.delete('/api/admin/codes', deleteCode);

export default router;