import { Router, Request, Response } from 'express';
import {createWP} from "../controllers/wpControllers";


const router = Router();

router.post('/create-wp', createWP=>{null});

export default router;