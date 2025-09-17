import { Router } from 'express';
const router = Router();
import {testDB} from '../controllers/testController.js';
import {testDNS}  from '../controllers/testDNSController.js';

router.get('/test-db', testDB);
router.get('/test-dns', testDNS);

export default router; // Export par défaut
