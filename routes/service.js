const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isProvider } = require("../controllers/serviceController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Konfigurasi penyimpanan untuk upload foto jasa
const serviceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../public/images/services");
    // Buat direktori jika belum ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Gunakan UUID untuk nama file unik + ekstensi asli
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Filter file untuk memastikan hanya gambar yang diupload
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan"), false);
  }
};

const upload = multer({
  storage: serviceStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

router.get("/my", isProvider, serviceController.getMyServices);
router.post("/", isProvider, upload.single("image"), serviceController.addService);
router.put("/", isProvider, upload.single("image"), serviceController.updateService);
router.delete("/:id", isProvider, serviceController.deleteService);
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getService);

module.exports = router;
