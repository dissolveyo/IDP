import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import fileRoutes from "./routes/file.routes.js";
import Chat from "./models/chat.model.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";
import { scheduleAnalyticsJobs } from "./cron/analytics.cron.js";


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  },
});

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use('/uploads', express.static('uploads'));

app.use((req: any, res, next) => {
  req.io = io;
  next();
});
app.use(express.json({ limit: '1mb' }));

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/files", fileRoutes);

io.on('connection', (socket) => {
  console.log('Нове WebSocket-з’єднання:', socket.id);

  socket.on('joinUser', ({ userId }) => {
    socket.join(`user_${userId}`);
    console.log(`Користувач ${userId} приєднався до своєї кімнати`);
  });

  socket.on('joinChat', async ({ chatId, userId }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return socket.emit('error', 'Чат не знайдено');

      const participants = [String(chat.landlordId), String(chat.idpId)];
      if (chat.moderatorId) participants.push(String(chat.moderatorId));
      if (!participants.includes(userId)) {
        return socket.emit('error', 'У вас немає доступу до цього чату');
      }

      socket.join(chatId);
      console.log(`Користувач ${userId} приєднався до чату ${chatId}`);
    } catch (err) {
      console.error('joinChat error:', err);
    }
  });

  socket.on('sendMessage', async ({ chatId, senderId, text }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const participants = [String(chat.landlordId), String(chat.idpId)];

      if (chat.moderatorId) participants.push(String(chat.moderatorId));
      if (!participants.includes(senderId)) {
        return socket.emit('error', 'Немає доступу до цього чату');
      }

      const message = new Message({
        chatId,
        senderId,
        content: text,
        readBy: [senderId],
        createdAt: new Date()
      });

      await message.save();

      const sender = await User.findById(senderId)
        .select("firstName lastName avatar")
        .lean();

      const messageData = {
        _id: message._id,
        chatId,
        sender,
        content: text,
        createdAt: message.createdAt,
        readBy: message.readBy
      };

      io.to(chatId).emit('receiveMessage', messageData);

      for (const participantId of participants) {
        if (participantId !== senderId) {
          io.to(`user_${participantId}`).emit('receiveMessage', messageData);
        }
      }

    } catch (err) {
      console.error('sendMessage error:', err);
      socket.emit('error', 'Не вдалося надіслати повідомлення');
    }
  });

  socket.on('markAsRead', async ({ chatId, userId }) => {
    try {
      await Message.updateMany(
        {
          chatId,
          senderId: { $ne: userId },
          readBy: { $ne: userId }
        },
        { $addToSet: { readBy: userId } }
      );

      socket.to(chatId).emit('messagesRead', { chatId, readerId: userId });
    } catch (err) {
      console.error('markAsRead error:', err);
      socket.emit('error', 'Не вдалося оновити статус прочитаного');
    }
  });

  socket.on('disconnect', () => {
    console.log('Користувач відключився:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  scheduleAnalyticsJobs();
  console.log(`Server running on port ${PORT}`);
});
