import mongoose from "mongoose";
import { ListingStatus } from "../enums/ListingStatus.js";
import { ListingLivingTerms } from "../enums/ListingLivingTerm.js";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  images: [{ type: String }],
  status: {
    type: String,
    enum: Object.values(ListingStatus),
    default: "Active",
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  options: {
    people: { type: Number, required: true },
    term: {
      type: String,
      enum: Object.values(ListingLivingTerms),
      default: "Active",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Listing", listingSchema);
