const { Cart, Service, User } = require("../models");

exports.addToCart = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });
    const { service_id, note } = req.body;
    const user_id = req.session.user.id;

    // Cek apakah sudah ada di cart
    let cartItem = await Cart.findOne({ where: { user_id, service_id } });
    if (!cartItem) {
      cartItem = await Cart.create({ user_id, service_id, note });
    }
    res.json({ success: true, cart: cartItem });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Gagal menambah ke favorit" });
  }
};

exports.getCart = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });
    const user_id = req.session.user.id;
    const cart = await Cart.findAll({
      where: { user_id },
      include: [
        {
          model: Service,
          include: [{ model: User, attributes: ["full_name"] }],
        },
      ],
    });
    res.json({ cart });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: "Gagal mengambil keranjang" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });
    const user_id = req.session.user.id;
    const { id } = req.params;
    await Cart.destroy({ where: { id, user_id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Remove cart error:", err);
    res.status(500).json({ error: "Gagal menghapus item keranjang" });
  }
};
