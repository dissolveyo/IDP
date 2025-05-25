import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";

export const createChat = async (req, res) => {
  try {
    const { listingId, idpId, landlordId, moderatorId = null } = req.body;

    if (!listingId || !idpId || !landlordId) {
      return res
        .status(400)
        .json({ error: "Необхідно вказати listingId, idpId та landlordId" });
    }

    let existingChat = await Chat.findOne({ listingId, idpId });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({
      listingId,
      idpId,
      landlordId,
      moderatorId,
    });

    await newChat.save();

    res.status(201).json(newChat);
  } catch (err) {
    console.error("Помилка створення чату:", err);
    res.status(500).json({ error: "Не вдалося створити чат" });
  }
};

export const getChats = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const filter = {};
  if (role === "IDP") filter.idpId = userId;
  if (role === "Landlord") filter.landlordId = userId;
  if (role === "Moderator") filter.moderatorId = userId;

  try {
    const chats = await Chat.find(filter).sort({ updatedAt: -1 }).lean();

    const chatsList = await Promise.all(
      chats.map(async (chat) => {
        let otherUserId = null;
        if (role === "IDP") otherUserId = chat.landlordId;
        if (role === "Landlord") otherUserId = chat.idpId;
        if (role === "Moderator") otherUserId = chat.idpId || chat.landlordId;

        const user = await User.findById(otherUserId).select(
          "firstName lastName avatar"
        );

        const listing = await Listing.findById(chat?.listingId).select(
          "title description images"
        );

        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .populate("senderId", "firstName lastName")
          .lean();

        const unread = await Message.countDocuments({
          chatId: chat._id,
          readBy: { $ne: userId },
          sender: { $ne: userId },
        });

        return {
          id: chat._id,
          avatar: user?.avatar,
          listing,
          name: user
            ? `${user.firstName} ${user.lastName}`
            : "Невідомий користувач",
          unread,
          timestamp: lastMessage?.createdAt
            ? new Date(lastMessage.createdAt).toLocaleString()
            : "",
          lastMessage: lastMessage?.content || "",
          sender: {
            ...lastMessage?.senderId,
          },
        };
      })
    );

    res.json(chatsList);
  } catch (error) {
    console.error("Failed to load chats list:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate("senderId", "firstName lastName avatar");
    const formatted = messages.map((msg) => ({
      _id: msg._id,
      content: msg.content,
      sender: msg.senderId,
      createdAt: msg.createdAt,
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
};

export const getModeratorRequestedChats = async (req, res) => {
  const userId = req.user.id;

  const filter = {
    $or: [{ status: "MODERATOR_REQUESTED" }, { moderatorId: userId }],
  };

  try {
    const chats = await Chat.find(filter).sort({ updatedAt: -1 }).lean();

    const chatsList = await Promise.all(
      chats.map(async (chat) => {
        let otherUserId = chat.landlordId;

        const user = await User.findById(otherUserId).select(
          "firstName lastName avatar"
        );

        const listing = await Listing.findById(chat?.listingId).select(
          "title description images"
        );

        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .populate("senderId", "firstName lastName")
          .lean();

        const unread = await Message.countDocuments({
          chatId: chat._id,
          readBy: { $ne: userId },
          sender: { $ne: userId },
        });

        return {
          id: chat._id,
          avatar: user?.avatar,
          listing,
          status: chat?.status,
          name: user
            ? `${user.firstName} ${user.lastName}`
            : "Невідомий користувач",
          unread,
          timestamp: lastMessage?.createdAt
            ? new Date(lastMessage.createdAt).toLocaleString()
            : "",
          lastMessage: lastMessage?.content || "",
          sender: {
            ...lastMessage?.senderId,
          },
        };
      })
    );

    res.json(chatsList);
  } catch (err) {
    console.error("Error fetching moderator requested chats", err);
    res.status(500).json({ message: "Помилка при отриманні чатів" });
  }
};

export const markChatInModeration = async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user.id;

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required" });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.status = "IN_MODERATION";
    chat.moderatorId = userId;
    await chat.save();

    res.json({ message: "Chat marked as in moderation", chatId: chat._id });
  } catch (err) {
    console.error("Error updating chat status", err);
    res.status(500).json({ message: "Помилка при оновленні статусу чату" });
  }
};
