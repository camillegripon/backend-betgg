import { Router } from 'express';
const router = Router();
import { testDB } from '../controllers/testController.js';

router.get('/test-db', testDB);

export default router; // Export par défaut
