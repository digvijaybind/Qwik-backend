const express = require('express');
const router = express.Router();
const DoctorController = require('../controller/formData/Doctor');
const ParamedicsController = require('../controller/formData/Paramedics');
const AircraftOperatorController = require('../controller/formData/AirCraft-Operator');
const HospitalController = require('../controller/formData/Hospital');
const PrivateJetOwnerController = require('../controller/formData/PrivateJet-Owner');
const InsuranceController = require('../controller/formData/Insurance');
const asyncMiddleware = require('../middleware/async-middleware');

router.post(
  '/register/doctor',
  asyncMiddleware(DoctorController.RegisterDoctor)
);
router.post(
  '/register/paramedics',
  asyncMiddleware(ParamedicsController.RegisterParamedics)
);
router.post(
  '/register/aircraft-Operator',
  asyncMiddleware(AircraftOperatorController.RegisterAircraftOperatorOwner)
);
router.post(
  '/register/hospital',
  asyncMiddleware(HospitalController.RegisterHospital)
);
router.post(
  '/register/private-Jet',
  asyncMiddleware(PrivateJetOwnerController.RegisterPrivateJetOwner)
);
router.post(
  '/InsuranceRegister',
  asyncMiddleware(InsuranceController.InsuranceOnboard)
);
module.exports = router;
