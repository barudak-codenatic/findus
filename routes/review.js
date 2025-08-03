const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { isAuthenticated } = require("../controllers/authController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Konfigurasi penyimpanan untuk upload gambar review
const reviewStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../public/images/reviews");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage: reviewStorage });

router.post(
  "/",
  isAuthenticated,
  upload.single("image"),
  reviewController.createReview
);
router.get("/service/:serviceId", reviewController.getReviewsByService);
router.get(
  "/order/:orderId",
  isAuthenticated,
  reviewController.getReviewByOrder
);
router.put(
  "/:reviewId",
  isAuthenticated,
  upload.single("image"),
  reviewController.updateReview
);

module.exports = router;
