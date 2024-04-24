const express = require("express");
const router = express.Router();
const OperatorController = require("../controller/C-Operator");
const {authMiddleware} = require("../middleware/authMiddleware");
const asyncMiddleware = require("../middleware/async-middleware");
// new router endpoints in new api (crud)
router.post("/register", asyncMiddleware(OperatorController.Register));
router.post("/login", asyncMiddleware(OperatorController.Login));
router.post(
  "/addAircraftdeatils",
  authMiddleware,
  asyncMiddleware(OperatorController.AddAircrafts)
);
router.get(
  "/getAirCraftOperatorLists",
  authMiddleware,
  asyncMiddleware(OperatorController.getAirCraftOperatorLists)
);
router.get(
  "/getOperatorLists",
  authMiddleware,
  asyncMiddleware(OperatorController.getOperatorsLists)
);
// router.get("/getOperator", authMiddleware, OperatorController.getOperatorlist);
router.put(
  "/editAircraft/:id",
  authMiddleware,
  asyncMiddleware(OperatorController.EditOperator)
);
router.delete(
  "/deleteAircraft/:id",
  authMiddleware,
  asyncMiddleware(OperatorController.DeleteOperator)
);
router.get(
  "/getSingleOperator/:id",
  authMiddleware,
  asyncMiddleware(OperatorController.getSingleOperator)
);
router.get(
  "/operatorListsOfAircraftOPerators",
  authMiddleware,
  asyncMiddleware(OperatorController.getIndividualAirCraftOPeratorsLists)
);
router.get(
  "/searchOperator",
  authMiddleware,
  asyncMiddleware(OperatorController.getSearchFilter)
);
router.get("/allLocation", asyncMiddleware(OperatorController.GetAllLocation));
module.exports = router;
