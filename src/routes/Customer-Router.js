const express = require('express');
const router = express.Router();
const CustomerController = require('../controller/customer/C-Customer');
const asyncMiddleware = require('../middleware/async-middleware');

router.post(
  '/avipageSearch',
  asyncMiddleware(CustomerController.calculateFlightTime)
);

router.post(
  '/AmadeusSearch',
  asyncMiddleware(CustomerController.AmedeusTestAPitoken)
);
router.get(
  '/amadeus/aircraft/:concatenatedParam',
  asyncMiddleware(CustomerController.SingleAmadusAircraftdata)
);
router.get(
  '/avipage/aircraft/:concatenatedParam',
  asyncMiddleware(CustomerController.SingleAvipageAircraftdata)
);
module.exports = router;