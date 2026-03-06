import { Router, Request, Response } from 'express';
import { createWorkPackage } from "../controllers/wpControllers";


const router = Router();

router.post('/create-wp', createWP=>{null});

export default router;