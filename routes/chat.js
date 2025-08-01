const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { isAuthenticated } = require("../controllers/authController");

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
router.post(
  "/api/chats/find-or-create",
  chatController.findOrCreateChatFromOrder
);

module.exports = router;
