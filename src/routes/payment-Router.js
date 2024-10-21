const express = require('express');
const router = express.Router();
const paymentController = require("../controller/payment/C-Payment")
const asyncMiddleware = require('../middleware/async-middleware');

router.post(
  '/paymentrequest',
  asyncMiddleware(paymentController.PaymentRequest),
);
router.post(
  '/Paymentconfirmation',
  asyncMiddleware(paymentController.PaymentConfirmation),
);
router.post('/refund', asyncMiddleware(paymentController.Refund));

module.exports = router;
