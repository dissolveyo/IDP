import Chat from "../models/chat.model.js";
import Complaint from "../models/complaint.model.js";
import Listing from "../models/listing.model.js";
import Rating from "../models/rating.model.js";

export const createComplaint = async (req, res) => {
  try {
    const {
      complainantId,
      listingId,
      ratingId,
      chatId,
      title,
      description,
      type,
      reason,
    } = req.body;

    if (!complainantId || !title || !description || !type || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let listing = null;
    let rating = null;
    let chat = null;

    if (type === "comment") {
      if (!ratingId || !listingId) {
        return res.status(400).json({
          message: "Comment complaints require ratingId and listingId",
        });
      }

      listing = await Listing.findById(listingId).lean();
      rating = await Rating.findById(ratingId).lean();

      if (!listing || !rating) {
        return res.status(404).json({ message: "Listing or rating not found" });
      }
    } else if (type === "listing") {
      if (!listingId) {
        return res.status(400).json({
          message: "Listing complaints require listingId",
        });
      }

      listing = await Listing.findById(listingId).lean();
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
    } else if (type === "chat") {
      if (!chatId) {
        return res.status(400).json({
          message: "Chat complaints require chatId",
        });
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      chat.status = "MODERATOR_REQUESTED";
      await chat.save();
    } else {
      return res.status(400).json({ message: "Invalid complaint type" });
    }

    chat = await Chat.findById(chatId).lean();

    const complaint = new Complaint({
      complainantId,
      listing: listing || undefined,
      rating: rating || undefined,
      chat: chat || undefined,
      title,
      description,
      type,
      reason,
    });

    await complaint.save();

    return res.status(201).json(complaint);
  } catch (error) {
    console.error("Error creating complaint:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("complainantId", "firstName lastName email avatar")
      .lean();

    const result = complaints.map((complaint) => {
      const { _id, complainantId, listing, chat, rating, ...rest } = complaint;

      return {
        ...rest,
        id: _id,
        complainant: complainantId && {
          ...complainantId,
          id: complainantId?._id,
        },
        listing: listing && {
          ...listing,
          id: listing?._id,
        },
        rating: rating && {
          ...rating,
          id: rating?._id,
        },
        chat: chat && {
          ...chat,
          id: chat?._id,
        },
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "handled", "dismissed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status,
        handledAt: status === "pending" ? null : new Date(),
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    if (!!complaint?.chat) {
      await Chat.findByIdAndUpdate(
        complaint?.chat?._id,
        { status: "DEFAULT", moderatorId: null },
        { new: true }
      );
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
