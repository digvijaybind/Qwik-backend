const express = require('express');
const router = express.Router();
const EquiryController = require('../controller/C-confirmEquiry');
const asyncMiddleware = require('../middleware/async-middleware');

router.post('/confirmEquiry', asyncMiddleware(EquiryController.ConfirmEquiry));

module.exports = router;
