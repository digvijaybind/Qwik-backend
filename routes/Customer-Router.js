const express = require("express");
const router = express.Router();
const CustomerController = require("../controller/C-Customer");
const asyncMiddleware = require("../middleware/async-middleware");

router.post("/customerSearch", asyncMiddleware(CustomerController.calculateFlightTime))

module.exports = router;
