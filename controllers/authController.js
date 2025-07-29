const db = require("../database/db");
const bcrypt = require("bcrypt");
const { User } = require("../models");

exports.register = async (req, res) => {
  const { full_name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    full_name,
    email,
    password: hashed,
    role,
  });

  res.redirect("/login");
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send(
      '<script>alert("Email atau password salah!"); window.location="/login";</script>'
    );
  }

  req.session.user = { id: user.id, name: user.full_name, role: user.role };
  res.redirect("/api/auth/dashboard");
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};
