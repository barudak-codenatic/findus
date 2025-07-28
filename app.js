const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./models");
require("dotenv").config();
const mysql = require("mysql2/promise");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Tambahkan ini untuk parsing JSON
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

// Routing
const authRoutes = require("./routes/auth");
const serviceRoutes = require("./routes/service"); // Tambahkan ini

app.use("/", authRoutes);
app.use("/", serviceRoutes); // Tambahkan ini

app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));

(async () => {
  try {
    // Koneksi sementara tanpa nama DB
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    // Membuat database jika belum ada
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`
    );
    console.log("✅ Database otomatis dibuat (jika belum ada)");

    // Sync model setelah database dipastikan ada
    await db.sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Gagal membuat database atau sync:", err);
  }
})();

db.sequelize
  .sync({ alter: true }) // gunakan alter:true hanya saat development
  .then(() => {
    console.log("✅ Database & tabel sudah sinkron!");

    // Jalankan server setelah sync berhasil
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Gagal koneksi atau sync database:", err);
  });
