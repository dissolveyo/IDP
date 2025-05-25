import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  complainantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  listing: {
    type: mongoose.Schema.Types.Mixed,
  },

  rating: {
    type: mongoose.Schema.Types.Mixed,
  },

  chat: {
    type: mongoose.Schema.Types.Mixed,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["comment", "listing", "chat"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "handled", "dismissed"],
    default: "pending",
  },

  reason: {
    type: String,
    enum: [
      // Comments
      "inappropriate_language",
      "spam_comment",
      "false_information",
      "harassment",
      "off_topic",

      // Listings
      "duplicate_listing",
      "fraudulent_listing",
      "outdated_information",
      "incorrect_location",
      "inappropriate_content",

      // Chat
      "harassment_chat",
      "scam_attempt",
      "offensive_language",
      "irrelevant_messages",
      "unwanted_contact",

      // Other
      "other",
    ],
  },

  handledAt: { type: Date },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

complaintSchema.pre("validate", function (next) {
  const { type, listing, rating, chat } = this;

  if (type === "comment") {
    if (!listing || !rating) {
      return next(
        new Error("Comment complaints must include both listing and rating.")
      );
    }
  }

  if (type === "listing") {
    if (!listing) {
      return next(new Error("Listing complaints must include listing."));
    }
  }

  if (type === "chat") {
    if (!chat) {
      return next(new Error("Chat complaints must include chatId."));
    }
  }

  next();
});
const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
