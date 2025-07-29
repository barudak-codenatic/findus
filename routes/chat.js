const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Middleware untuk memeriksa apakah pengguna sudah login
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// Halaman chat
router.get(
  "/user/chat",
  isAuthenticated,
  chatController.isUser,
  chatController.renderUserChatPage
);
router.get(
  "/provider/chat",
  isAuthenticated,
  chatController.isProvider,
  chatController.renderProviderChatPage
);

// API endpoints
router.get("/api/chats", isAuthenticated, chatController.getMyChats);
router.get("/api/chats/:chatId", isAuthenticated, chatController.getChatDetail);
router.post("/api/chats", isAuthenticated, chatController.createChat);
router.post("/api/messages", isAuthenticated, chatController.sendMessage);
router.get(
  "/api/messages/unread",
  isAuthenticated,
  chatController.getUnreadCount
);

module.exports = router;
