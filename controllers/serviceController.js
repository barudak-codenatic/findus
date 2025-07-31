const { Service, User } = require("../models");
const path = require("path");
const fs = require("fs");

const isProvider = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "PROVIDER") {
    return res.status(403).send("Akses ditolak. Anda bukan penyedia jasa.");
  }
  next();
};

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

exports.addService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
    } = req.body;

    // Validasi input
    if (!name || !price) {
      return res.status(400).json({ error: "Nama dan harga harus diisi" });
    }

    // Proses file gambar jika ada
    let image_url = null;
    if (req.file) {
      image_url = `/public/images/services/${req.file.filename}`;
    }

    await Service.create({
      provider_id: req.session.user.id,
      name,
      description,
      price,
      image_url,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
    });

    res.json({ success: true, message: "Layanan berhasil ditambahkan" });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Gagal menambahkan layanan" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
    } = req.body;

    // Validasi input
    if (!id || !name || !price) {
      return res.status(400).json({ error: "ID, nama, dan harga harus diisi" });
    }

    const service = await Service.findOne({
      where: {
        id,
        provider_id: req.session.user.id,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Layanan tidak ditemukan" });
    }

    // Proses file gambar jika ada
    let image_url = service.image_url; // Gunakan gambar yang sudah ada jika tidak ada upload baru

    if (req.file) {
      // Hapus gambar lama jika ada
      if (service.image_url) {
        const oldImagePath = path.join(
          __dirname,
          "../public",
          service.image_url.replace("/public/", "")
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set URL gambar baru
      image_url = `/public/images/services/${req.file.filename}`;
    }

    await service.update({
      name,
      description,
      price,
      image_url,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
    });

    res.json({ success: true, message: "Layanan berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Gagal memperbarui layanan" });
  }
};

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

exports.getService = async (req, res) => {
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

module.exports.isProvider = isProvider;
