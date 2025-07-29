const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.post("/update-status", orderController.updateOrderStatus);
router.get("/:id", orderController.getOrder);

module.exports = router;
