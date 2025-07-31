const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.post("/update-status", orderController.updateOrderStatus);
router.get("/provider", orderController.getProviderOrders);
router.get("/history", orderController.getOrdersHistory);
router.get("/:id", orderController.getOrder);

module.exports = router;
