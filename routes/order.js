const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { isAuthenticated } = require("../controllers/authController");

router.post("/", orderController.createOrder);
router.post("/update-status", orderController.updateOrderStatus);
router.put(
  "/:orderId/payment",
  isAuthenticated,
  orderController.updateOrderPayment
);
router.get("/provider", orderController.getProviderOrders);
router.get("/history", orderController.getOrdersHistory);
router.get("/:id", orderController.getOrder);

module.exports = router;
