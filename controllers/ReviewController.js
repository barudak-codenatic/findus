const { Review, Order, User } = require("../models");
const path = require("path");

exports.createReview = async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    const user_id = req.session.user.id;
    let image_url = null;
    if (req.file) {
      image_url = "/public/images/reviews/" + req.file.filename;
    }

    // Validasi order
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });

    // Cek sudah pernah review belum
    const exist = await Review.findOne({ where: { order_id, user_id } });
    if (exist)
      return res
        .status(400)
        .json({ error: "Anda sudah memberi ulasan untuk pesanan ini" });

    const review = await Review.create({
      order_id,
      user_id,
      rating,
      comment,
      image_url,
      created_at: new Date(),
    });

    res.json({ success: true, review });
  } catch (err) {
    console.error("Error create review:", err);
    res.status(500).json({ error: "Gagal menyimpan ulasan" });
  }
};

exports.getReviewsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ["full_name", "photo_url"] },
        { model: Order, where: { service_id: serviceId }, attributes: [] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil ulasan" });
  }
};
