const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isProvider } = require("../controllers/serviceController");

// Rute untuk halaman tambah dan edit jasa
router.get("/tambah-jasa", isProvider, serviceController.renderAddServicePage);
router.get(
  "/edit-jasa/:id",
  isProvider,
  serviceController.renderEditServicePage
);

// Rute API untuk penyedia jasa
router.get("/api/services/my", isProvider, serviceController.getMyServices);
router.post("/api/services", isProvider, serviceController.addService);
router.put("/api/services", isProvider, serviceController.updateService);
router.delete("/api/services/:id", isProvider, serviceController.deleteService);

// Rute untuk mendapatkan detail layanan (bisa diakses semua pengguna)
router.get("/api/services/:id", serviceController.getServiceDetail);

module.exports = router;
