const express = require('express');
const router = express.Router();
const RayzorPayController = require('../controller/Rayzorpay');
const PaymentContrller = require('../controller/payment/C-Payment');

const asyncMiddleware = require('../middleware/async-middleware');

router.post('/Order', asyncMiddleware(RayzorPayController.CreateOrderId));
router.post(
  '/Order/verify',
  asyncMiddleware(RayzorPayController.VerifyPayment)
);
router.post(
  '/paymentrequest',
  asyncMiddleware(PaymentContrller.PaymentRequest)
);
router.post('/Paymentconfirmation',asyncMiddleware(PaymentContrller.PaymentConfirmation))

module.exports = router;
