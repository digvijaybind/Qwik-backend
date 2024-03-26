const express = require("express");
const router = express.Router();
const paymentController = require("../controller/C-paymentgateway");
const asyncMiddleware = require("../middleware/async-middleware");

router.post("/order", asyncMiddleware(paymentController.Order));
router.post("/paymentCapture",asyncMiddleware(paymentController.paymentMethod));
router.post("/refund", asyncMiddleware(paymentController.Refund));

module.exports = router;
