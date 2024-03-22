const express = require('express');
const router = express.Router();
const CustomerController = require('../controller/customer/C-Customer');
const asyncMiddleware = require('../middleware/async-middleware');

router.post(
  '/customerSearch',
  asyncMiddleware(CustomerController.calculateFlightTime)
);
router.post(
  '/customerSearchTechaul',
  asyncMiddleware(CustomerController.calculateFlightTimeForTakeall)
);
router.get('/aircraftLists', asyncMiddleware(CustomerController.AirCraftData));
router.get('/airline', asyncMiddleware(CustomerController.AirlineBlog));
router.post(
  '/Amadeusairline',
  asyncMiddleware(CustomerController.AmedeusTestAPitoken)
);
router.get('/aircraftall', asyncMiddleware(CustomerController.AllAircraft));
router.get(
  '/amadeus/aircraft/:concatenatedParam',
  asyncMiddleware(CustomerController.SingleAmadusAircraftdata)
);
router.get(
  '/avipage/aircraft/:concatenatedParam',
  asyncMiddleware(CustomerController.SingleAvipageAircraftdata)
);
module.exports = router;
