const { User } = require("../models");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

// Middleware untuk memeriksa apakah pengguna sudah login
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu" });
  }
  next();
};

// Mendapatkan data profil pengguna berdasarkan ID
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Pastikan pengguna hanya bisa melihat profilnya sendiri
    if (userId !== req.session.user.id) {
      return res.status(403).json({ error: "Anda tidak memiliki akses" });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil profil" });
  }
};

// Update profil pengguna
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { full_name, phone, current_password, new_password } = req.body;

    // Validasi input
    if (!full_name) {
      return res.status(400).json({ error: "Nama lengkap harus diisi" });
    }

    // Ambil data user dari database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    // Update data dasar
    user.full_name = full_name;
    if (phone) user.phone = phone;

    // Jika ada permintaan update password
    if (current_password && new_password) {
      // Verifikasi password lama
      const isPasswordValid = await bcrypt.compare(
        current_password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({ error: "Password saat ini tidak valid" });
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(new_password, 10);
      user.password = hashedPassword;
    }

    // Simpan perubahan
    await user.save();

    // Update session dengan nama baru
    req.session.user.name = full_name;

    res.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat memperbarui profil" });
  }
};

// Upload foto profil
exports.updatePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diunggah" });
    }

    const userId = req.session.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    // Hapus foto lama jika ada
    if (user.photo_url) {
      const oldPhotoPath = path.join(
        __dirname,
        "../public",
        user.photo_url.replace("/public/", "")
      );
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Simpan path foto baru ke database
    const photoUrl = `/public/images/profiles/${req.file.filename}`;
    user.photo_url = photoUrl;
    await user.save();

    res.json({ success: true, photo_url: photoUrl });
  } catch (error) {
    console.error("Error updating photo:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengupload foto" });
  }
};

// Middleware untuk memeriksa role USER
exports.isUser = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role !== "USER") {
    return res.status(403).send("Akses ditolak. Anda bukan pengguna.");
  }
  next();
};

// Middleware untuk memeriksa role PROVIDER
exports.isProvider = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role !== "PROVIDER") {
    return res.status(403).send("Akses ditolak. Anda bukan penyedia jasa.");
  }
  next();
};