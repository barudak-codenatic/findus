const db = require("../database/db");
const bcrypt = require("bcrypt");
const { User } = require("../models");

exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// Add email check endpoint
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Validation
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      full_name,
      email,
      password: hashed,
      role,
    });

    res.json({
      success: true,
      message: "Pendaftaran berhasil! Silakan login.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email atau password salah!" });
    }

    req.session.user = {
      id: user.id,
      name: user.full_name,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };

    res.json({
      success: true,
      message: "Login berhasil",
      redirect: "/api/auth/dashboard",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};
