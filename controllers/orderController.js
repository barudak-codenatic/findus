const midtransClient = require("midtrans-client");
const { Order, Service, User } = require("../models");

exports.createOrder = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });

    const { service_id, address, schedule } = req.body;
    const user_id = req.session.user.id;

    // Ambil data service
    const service = await Service.findByPk(service_id);
    if (!service)
      return res.status(404).json({ error: "Layanan tidak ditemukan" });

    // Buat order di DB
    const order = await Order.create({
      user_id,
      service_id,
      provider_id: service.provider_id,
      address,
      schedule,
      total_price: service.price,
      status: "PENDING",
    });

    // Midtrans Snap
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: service.price,
      },
      customer_details: {
        first_name: req.session.user.full_name,
        email: req.session.user.email,
      },
      item_details: [
        {
          id: service.id,
          price: service.price,
          quantity: 1,
          name: service.name,
        },
      ],
    };

    const snapResponse = await snap.createTransaction(parameter);
    res.json({ snapToken: snapResponse.token, order });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Gagal membuat order" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });
    order.status = status;
    await order.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal update status order" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Service },
        { model: User, as: "Customer", attributes: ["full_name"] },
        { model: User, as: "Provider", attributes: ["full_name"] },
      ],
    });
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil detail order" });
  }
};
