const express = require('express');
const router = express.Router();
const InsuranceController = require('../controller/formData/Insurance');
const asyncMiddleware = require('../middleware/async-middleware');

router.post(
  '/career/InsuranceRegister',
  asyncMiddleware(InsuranceController.InsuranceOnboard)
);
module.exports = router;
