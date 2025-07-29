const { Chat, Message, User, Service } = require("../models");
const { Op } = require("sequelize");
const path = require("path");

// Middleware untuk memeriksa apakah pengguna sudah login
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu" });
  }
  next();
};

// Mendapatkan semua chat untuk pengguna yang sedang login
exports.getMyChats = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    let chats;
    if (userRole === "USER") {
      // Jika pengguna adalah USER, ambil chat di mana dia sebagai user_id
      chats = await Chat.findAll({
        where: { user_id: userId },
        include: [
          {
            model: User,
            as: "Provider",
            attributes: ["id", "full_name", "photo_url"],
          },
          {
            model: Service,
            attributes: ["id", "name", "image_url"],
          },
          {
            model: Message,
            limit: 1,
            order: [["created_at", "DESC"]],
            attributes: ["content", "created_at", "is_read", "sender_id"],
          },
        ],
        order: [["created_at", "DESC"]],
      });
    } else if (userRole === "PROVIDER") {
      // Jika pengguna adalah PROVIDER, ambil chat di mana dia sebagai provider_id
      chats = await Chat.findAll({
        where: { provider_id: userId },
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "full_name", "photo_url"],
          },
          {
            model: Service,
            attributes: ["id", "name", "image_url"],
          },
          {
            model: Message,
            limit: 1,
            order: [["created_at", "DESC"]],
            attributes: ["content", "created_at", "is_read", "sender_id"],
          },
        ],
        order: [["created_at", "DESC"]],
      });
    }

    res.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Gagal mengambil data chat" });
  }
};

// Mendapatkan detail chat beserta pesan-pesannya
exports.getChatDetail = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.user.id;

    // Verifikasi bahwa chat ini milik pengguna yang sedang login
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ user_id: userId }, { provider_id: userId }],
      },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "full_name", "photo_url"],
        },
        {
          model: User,
          as: "Provider",
          attributes: ["id", "full_name", "photo_url"],
        },
        {
          model: Service,
          attributes: ["id", "name", "image_url"],
        },
      ],
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat tidak ditemukan" });
    }

    // Ambil semua pesan dalam chat ini
    const messages = await Message.findAll({
      where: { chat_id: chatId },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "full_name", "photo_url"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    // Tandai semua pesan yang belum dibaca dan bukan dari pengguna ini sebagai telah dibaca
    await Message.update(
      { is_read: true },
      {
        where: {
          chat_id: chatId,
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
      }
    );

    res.json({ chat, messages });
  } catch (error) {
    console.error("Error fetching chat detail:", error);
    res.status(500).json({ error: "Gagal mengambil detail chat" });
  }
};

// Membuat chat baru
exports.createChat = async (req, res) => {
  try {
    const { serviceId, providerId } = req.body;
    const userId = req.session.user.id;

    // Periksa apakah chat sudah ada
    let chat = await Chat.findOne({
      where: {
        service_id: serviceId,
        user_id: userId,
        provider_id: providerId,
      },
    });

    // Jika belum ada, buat chat baru
    if (!chat) {
      chat = await Chat.create({
        service_id: serviceId,
        user_id: userId,
        provider_id: providerId,
      });
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Gagal membuat chat baru" });
  }
};

// Mengirim pesan baru
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.session.user.id;

    // Verifikasi bahwa chat ini milik pengguna yang sedang login
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ user_id: senderId }, { provider_id: senderId }],
      },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat tidak ditemukan" });
    }

    // Buat pesan baru
    const message = await Message.create({
      chat_id: chatId,
      sender_id: senderId,
      content,
    });

    // Ambil data pengirim untuk respons
    const messageWithSender = await Message.findOne({
      where: { id: message.id },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "full_name", "photo_url"],
        },
      ],
    });

    res.json({ message: messageWithSender });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Gagal mengirim pesan" });
  }
};

// Mendapatkan jumlah pesan yang belum dibaca
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Ambil semua chat milik pengguna ini
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ user_id: userId }, { provider_id: userId }],
      },
      attributes: ["id"],
    });

    const chatIds = chats.map((chat) => chat.id);

    // Hitung jumlah pesan yang belum dibaca
    const unreadCount = await Message.count({
      where: {
        chat_id: { [Op.in]: chatIds },
        sender_id: { [Op.ne]: userId },
        is_read: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    res.status(500).json({ error: "Gagal menghitung pesan yang belum dibaca" });
  }
};

// Middleware untuk memeriksa apakah pengguna adalah penyedia jasa
exports.isProvider = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "PROVIDER") {
    return res.status(403).send("Akses ditolak. Anda bukan penyedia jasa.");
  }
  next();
};

// Middleware untuk memeriksa apakah pengguna adalah user biasa
exports.isUser = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "USER") {
    return res.status(403).send("Akses ditolak. Anda bukan pengguna biasa.");
  }
  next();
};

// Render halaman chat untuk pengguna
exports.renderUserChatPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/user/chat.html"));
};

// Render halaman chat untuk penyedia jasa
exports.renderProviderChatPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/penyedia-jasa/chat.html"));
};