const express = require("express");
const router = express.Router();
const CustomerController = require("../controller/C-Customer");
const asyncMiddleware = require("../middleware/async-middleware");

router.post(
  "/customerSearch",
  asyncMiddleware(CustomerController.calculateFlightTime)
);
router.post(
  "/customerSearchTechaul",
  asyncMiddleware(CustomerController.calculateFlightTimeForTakeall)
);
router.get("/aircraftLists", asyncMiddleware(CustomerController.AirCraftData));
router.get("/airline", asyncMiddleware(CustomerController.AirlineBlog));
router.post(
  "/Amadeusairline",
  asyncMiddleware(CustomerController.AmedeusTestAPitoken)
);
module.exports = router;
