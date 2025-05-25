import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
