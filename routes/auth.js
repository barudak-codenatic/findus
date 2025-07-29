const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const role = req.session.user.role;
  if (role === "PROVIDER") {
    return res.redirect("/dashboard-provider");
  } else if (role === "USER") {
    return res.redirect("/dashboard-user");
  } else {
    return res.send("Role tidak dikenali");
  }
});

router.get("/me", (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/logout", authController.logout);

module.exports = router;
