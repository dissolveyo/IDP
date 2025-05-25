import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  data: { type: Object, required: true },
  type: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
