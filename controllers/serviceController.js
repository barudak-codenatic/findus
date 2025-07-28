const { Service, User } = require("../models");
const path = require("path");
const fs = require("fs");

// Middleware untuk memeriksa apakah pengguna adalah penyedia jasa
const isProvider = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "PROVIDER") {
    return res.status(403).send("Akses ditolak. Anda bukan penyedia jasa.");
  }
  next();
};

// Mendapatkan semua layanan (untuk user umum)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["full_name", "email", "phone", "photo_url"],
        },
      ],
    });
    res.json({ services });
  } catch (error) {
    console.error("Error fetching all services:", error);
    res.status(500).json({ error: "Gagal mengambil semua layanan" });
  }
};

// Mendapatkan semua layanan milik penyedia jasa tertentu
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { provider_id: req.session.user.id },
      order: [["created_at", "DESC"]],
    });
    res.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Gagal mengambil data layanan" });
  }
};

// Menambahkan layanan baru
exports.addService = async (req, res) => {
  try {
    const { name, description, price, image_url } = req.body;

    await Service.create({
      provider_id: req.session.user.id,
      name,
      description,
      price,
      image_url,
    });

    res.json({ success: true, message: "Layanan berhasil ditambahkan" });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Gagal menambahkan layanan" });
  }
};

// Mengedit layanan
exports.updateService = async (req, res) => {
  try {
    const { id, name, description, price, image_url } = req.body;

    const service = await Service.findOne({
      where: {
        id,
        provider_id: req.session.user.id,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Layanan tidak ditemukan" });
    }

    await service.update({
      name,
      description,
      price,
      image_url,
    });

    res.json({ success: true, message: "Layanan berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Gagal memperbarui layanan" });
  }
};

// Menghapus layanan
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({
      where: {
        id,
        provider_id: req.session.user.id,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Layanan tidak ditemukan" });
    }

    await service.destroy();

    res.json({ success: true, message: "Layanan berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Gagal menghapus layanan" });
  }
};

// Mendapatkan detail layanan
exports.getServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["full_name", "email", "phone", "photo_url"],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({ error: "Layanan tidak ditemukan" });
    }

    res.json({ service });
  } catch (error) {
    console.error("Error fetching service detail:", error);
    res.status(500).json({ error: "Gagal mengambil detail layanan" });
  }
};

// Render halaman tambah jasa
exports.renderAddServicePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/penyedia-jasa/tambah-jasa.html"));
};

// Render halaman edit jasa
exports.renderEditServicePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/penyedia-jasa/edit-jasa.html"));
};

// Render halaman detail jasa
exports.renderDetailServicePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/user/service-detail.html"));
};

module.exports.isProvider = isProvider;
