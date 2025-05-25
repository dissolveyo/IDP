import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  status: { type: String, enum: ["active", "removed"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
