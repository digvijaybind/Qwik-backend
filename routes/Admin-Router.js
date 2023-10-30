const express = require("express");
const router = express.Router();
const AdminController = require("../controller/C-Admin");

const asyncMiddleware = require("../middleware/async-middleware");
const {authMiddleware} = require("../middleware/authMiddleware");



router.post("/register", asyncMiddleware(AdminController.Register));

router.post("/login", asyncMiddleware(AdminController.Login));
router.put("/editAircraftMargin/:id", authMiddleware, asyncMiddleware(AdminController.EditAircraftOperatorWithMargin));



module.exports = router;
