const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isProvider } = require("../controllers/serviceController");

router.get("/my", isProvider, serviceController.getMyServices);
router.post("/", isProvider, serviceController.addService);
router.put("/", isProvider, serviceController.updateService);
router.delete("/:id", isProvider, serviceController.deleteService);
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getService);

module.exports = router;
