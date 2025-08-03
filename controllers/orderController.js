const midtransClient = require("midtrans-client");
const { Order, Service, User } = require("../models");

exports.createOrder = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });

    const {
      service_id,
      customer_name,
      customer_phone,
      customer_address,
      schedule,
      note,
    } = req.body;
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
      customer_name,
      customer_phone,
      customer_address,
      schedule,
      note,
      total_price: service.price,
      status: "BELUM BAYAR",
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

exports.updateOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user_id = req.session.user.id;

    // Cari order yang sudah ada
    const existingOrder = await Order.findOne({
      where: {
        id: orderId,
        user_id,
        status: "BELUM BAYAR",
      },
    });

    if (!existingOrder) {
      return res
        .status(404)
        .json({ error: "Order tidak ditemukan atau sudah dibayar" });
    }

    // Update data order - handle null/empty values properly
    const {
      service_id,
      customer_name,
      customer_phone,
      customer_address,
      schedule,
      note,
    } = req.body;

    const updateData = {};

    // Hanya update field yang ada di request body
    if (service_id !== undefined) updateData.service_id = service_id;
    if (customer_name !== undefined) updateData.customer_name = customer_name;
    if (customer_phone !== undefined)
      updateData.customer_phone = customer_phone;
    if (customer_address !== undefined)
      updateData.customer_address = customer_address;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (note !== undefined) updateData.note = note; // Bisa null, empty string, atau string berisi

    await existingOrder.update(updateData);

    // Generate Midtrans snap token
    const snapToken = await generateMidtransToken(existingOrder);

    res.json({
      snapToken,
      order_id: existingOrder.id,
      message: "Order berhasil diupdate, silakan lanjutkan pembayaran",
    });
  } catch (error) {
    console.error("Error updateOrderPayment:", error);
    res.status(500).json({ error: "Gagal memproses pembayaran" });
  }
};

// Tambahkan fungsi generateMidtransToken
async function generateMidtransToken(order) {
  try {
    // Ambil data service untuk detail transaksi
    const service = await Service.findByPk(order.service_id);
    if (!service) throw new Error("Service not found");

    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: order.total_price || service.price,
      },
      customer_details: {
        first_name: order.customer_name,
        phone: order.customer_phone,
        billing_address: {
          address: order.customer_address,
        },
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
    return snapResponse.token;
  } catch (error) {
    console.error("Error generating Midtrans token:", error);
    throw error;
  }
}

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
    const { id } = req.params;

    // Check authentication
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    // Build where condition based on user role
    let whereCondition = { id };

    if (userRole === "USER") {
      // User hanya bisa akses order milik sendiri
      whereCondition.user_id = userId;
    } else if (userRole === "PROVIDER") {
      // Provider hanya bisa akses order untuk service mereka
      whereCondition.provider_id = userId;
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    const order = await Order.findOne({
      where: whereCondition,
      include: [
        {
          model: Service,
          include: [User], // Provider info dalam service
        },
        {
          model: User,
          as: "Customer",
          attributes: ["id", "full_name", "email", "phone"],
        },
        {
          model: User,
          as: "Provider",
          attributes: ["id", "full_name", "email", "phone"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ error: "Gagal mengambil data order" });
  }
};

//get orders history by user logged in
exports.getOrdersHistory = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });

    // Hanya user dengan role USER yang boleh akses
    if (req.session.user.role !== "USER")
      return res
        .status(403)
        .json({ error: "Forbidden. Only customer can access this resource" });

    const user_id = req.session.user.id;
    const orders = await Order.findAll({
      where: { user_id },
      include: [
        { model: Service },
        { model: User, as: "Customer", attributes: ["full_name"] },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ orders });
  } catch (err) {
    console.error("Error fetching orders history:", err);
    res.status(500).json({ error: "Gagal mengambil riwayat order" });
  }
};

//get orders for provider
exports.getProviderOrders = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });

    if (req.session.user.role !== "PROVIDER")
      return res
        .status(403)
        .json({ error: "Forbidden. Only provider can access this resource" });

    const provider_id = req.session.user.id;
    const orders = await Order.findAll({
      where: { provider_id },
      include: [
        { model: Service },
        {
          model: User,
          as: "Customer",
          attributes: ["full_name", "phone", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ orders });
  } catch (err) {
    console.error("Error fetching provider orders:", err);
    res.status(500).json({ error: "Gagal mengambil daftar pesanan" });
  }
};
