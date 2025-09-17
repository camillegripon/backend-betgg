// routes/test.js
const express = require('express');
const router = express.Router();
const { testDB } = require('../controllers/testController');

router.get('/test-db', testDB);

module.exports = router;
