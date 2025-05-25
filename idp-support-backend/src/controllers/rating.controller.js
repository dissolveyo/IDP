import Rating from "../models/rating.model.js";
import Application from "../models/application.model.js";

export const createRating = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { score, comment, listingId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!listingId || !score) {
      return res.status(400).json({ error: "listingId та score обов'язкові" });
    }
    if (score < 1 || score > 5) {
      return res.status(400).json({ error: "score має бути від 1 до 5" });
    }

    const rating = new Rating({
      userId,
      listingId,
      score,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    });

    await rating.save();

    res.status(201).json(rating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getIsAllowedToLeaveRating = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { listingId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!listingId) {
      return res.status(400).json({ error: "Не передано listingId" });
    }

    const approvedApplication = await Application.findOne({
      applicantId: userId,
      listingId,
      status: "approved",
    });

    if (!approvedApplication) {
      return res.status(403).json({
        allowed: false,
        message:
          "Ви не можете залишити відгук без підтвердженої заявки на це оголошення",
      });
    }

    res.json({ allowed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRatingsByListing = async (req, res) => {
  try {
    const listingId = req.params.listingId;

    if (!listingId) {
      return res
        .status(400)
        .json({ error: "listingId query parameter is required" });
    }

    const ratings = await Rating.find({
      listingId,
      status: "active",
    })
      .populate("userId", "firstName lastName avatar")
      .select("listingId score comment createdAt userId");

    const formattedRatings = ratings.map((rating) => ({
      id: rating._id,
      listingId: rating.listingId,
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
      user: rating.userId
        ? {
            id: rating.userId._id,
            firstName: rating.userId.firstName,
            lastName: rating.userId.lastName,
            avatar: rating.userId.avatar,
          }
        : null,
    }));

    res.json(formattedRatings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRating = async (req, res) => {
  try {
    const { score, comment } = req.body;
    const rating = await Rating.findByIdAndUpdate(
      req.params.id,
      { score, comment, updatedAt: new Date() },
      { new: true }
    );
    if (!rating) return res.status(404).json({ message: "Rating not found" });
    res.json({ message: "Rating updated", rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.json({ message: "Rating has been deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
