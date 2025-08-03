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

exports.getReviewByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user_id = req.session.user.id;
    const review = await Review.findOne({
      where: { order_id: orderId, user_id },
    });
    if (!review) return res.json({ review: null });
    res.json({ review });
  } catch (err) {
    console.error("Error getReviewByOrder:", err);
    res.status(500).json({ error: "Gagal mengambil data ulasan" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user_id = req.session.user.id;
    const review = await Review.findOne({ where: { id: reviewId, user_id } });
    if (!review)
      return res.status(404).json({ error: "Review tidak ditemukan" });

    // Update fields
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    // Jika ada file image
    if (req.file) {
      review.image_url = "/uploads/" + req.file.filename;
    }

    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    console.error("Error updateReview:", err);
    res.status(500).json({ error: "Gagal update ulasan" });
  }
};
