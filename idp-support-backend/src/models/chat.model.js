import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  idpId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  status: {
    type: String,
    enum: ["DEFAULT", "MODERATOR_REQUESTED", "IN_MODERATION"],
    default: "DEFAULT",
  },
  startedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
