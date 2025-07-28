const express = require("express");
const router = express.Router();
const path = require("path");
const authController = require("../controllers/authController");

// Tampilkan halaman login/register
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/register.html"));
});

router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const role = req.session.user.role;
  if (role === "PROVIDER") {
    return res.redirect("/dashboard-penyedia");
  } else if (role === "USER") {
    return res.redirect("/user/dashboard");
  } else {
    return res.send("Role tidak dikenali");
  }
});

router.get("/user/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/user/dashboard.html"));
});

router.get("/dashboard-penyedia", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/penyedia-jasa/dashboard.html"));
});

router.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

// Proses login/register/logout
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/logout", authController.logout);

module.exports = router;
