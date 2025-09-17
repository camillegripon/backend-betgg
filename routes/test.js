import { Router } from 'express';
const router = Router();
import { testDB, testDNS } from '../controllers/testController.js';

router.get('/test-db', testDB);
router.get('test-dns', testDNS);

export default router; // Export par défaut
