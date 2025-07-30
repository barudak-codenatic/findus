const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./models");
require("dotenv").config();
const mysql = require("mysql2/promise");
const { isProvider } = require("./controllers/serviceController");
const chatController = require("./controllers/chatController");
const { isAuthenticated } = require("./controllers/authController");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
const serviceRoutes = require("./routes/service");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const chatRoutes = require("./routes/chat");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/register.html"));
});

app.get("/dashboard-provider", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/provider/dashboard.html"));
});

app.get("/provider/add-service", isProvider, (req, res) => {
  res.sendFile(path.join(__dirname, "./views/provider/add-service.html"));
});

app.get("/provider/edit-service/:id", isProvider, (req, res) => {
  res.sendFile(path.join(__dirname, "./views/provider/edit-service.html"));
});

app.get("/dashboard-user", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/dashboard.html"));
});

app.get("/service-detail/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/service-detail.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/cart.html"));
});

app.get("/order", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/order.html"));
});

app.get("/payment", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/payment.html"));
});

app.get("/order-success", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/order-success.html"));
});

app.get("/order-history", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/order-history.html"));
});

app.get("/user/chat", isAuthenticated, chatController.isUser, (req, res) => {
  res.sendFile(path.join(__dirname, "./views/user/chat.html"));
});

app.get(
  "/provider/chat",
  isAuthenticated,
  chatController.isProvider,
  (req, res) => {
    res.sendFile(path.join(__dirname, "./views/provider/chat.html"));
  }
);

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
