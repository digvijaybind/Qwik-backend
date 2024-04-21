const express = require("express");
const router = express.Router();
const RayzorPayController = require("../controller/Rayzorpay");


const asyncMiddleware = require("../middleware/async-middleware");

router.post("/Order", asyncMiddleware(RayzorPayController.CreateOrderId));
router.post("/Order/verify",asyncMiddleware(RayzorPayController.VerifyPayment))



module.exports = router;
