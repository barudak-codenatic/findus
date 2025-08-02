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
    const { province_id, regency_id, sort } = req.query;
    const where = {};
    if (province_id) where.province_id = province_id;
    if (regency_id) where.regency_id = regency_id;

    // Gunakan 'created_at' sesuai field di model
    let order = [["created_at", "DESC"]];
    if (sort === "terbaru") order = [["created_at", "DESC"]];
    if (sort === "terlama") order = [["created_at", "ASC"]];
    if (sort === "harga-tertinggi") order = [["price", "DESC"]];
    if (sort === "harga-terendah") order = [["price", "ASC"]];

    const services = await Service.findAll({
      where,
      order,
      include: [
        {
          model: User,
          attributes: ["full_name", "email", "phone", "photo_url"],
        },
      ],
    });
    res.json({ services });
  } catch (err) {
    console.error("Error getAllServices:", err); // Tambahkan log error
    res.status(500).json({ error: "Gagal mengambil data layanan" });
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
      category,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
      address, // Tambahkan field address
    } = req.body;

    // Validasi input
    if (!name || !price || !address) {
      return res.status(400).json({ error: "Nama, harga, dan alamat harus diisi" });
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
      category,
      image_url,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
      address, // Tambahkan field address
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
      category,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
      address, // Tambahkan field address
    } = req.body;

    // Validasi input
    if (!id || !name || !price || !address) {
      return res.status(400).json({ error: "ID, nama, harga, dan alamat harus diisi" });
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
      category,
      image_url,
      province_id,
      province_name,
      regency_id,
      regency_name,
      district_id,
      district_name,
      address, // Tambahkan field address
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
