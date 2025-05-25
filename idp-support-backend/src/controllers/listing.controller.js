import { ListingStatus } from "../enums/ListingStatus.js";
import Listing from "../models/listing.model.js";
import Rating from "../models/rating.model.js";
import User from "../models/user.model.js";
import {
  sendListingActivatedEmail,
  sendListingDeactivatedEmail,
} from "../utils/mailer.js";

export const createListing = async (req, res) => {
  try {
    const { title, description, address, longitude, latitude, people, term } =
      req.body;

    const landlordId = req.user.id;

    const images = req.files.map(
      (file) => `/uploads/listings/${file.filename}`
    );

    const newListing = new Listing({
      title,
      description,
      address,
      landlordId,
      location: { lng: longitude, lat: latitude },
      options: {
        people,
        term,
      },
      images,
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    console.error("Create Listing Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const listings = await Listing.find({
      landlordId: userId,
      status: { $ne: ListingStatus.Deleted },
    }).select("title description status address createdAt images");

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, term, people, location, address } = req.body;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (title !== undefined) listing.title = title;
    if (description !== undefined) listing.description = description;
    if (term !== undefined) listing.options.term = term;
    if (people !== undefined) listing.options.people = people;
    if (location !== undefined) listing.location = location;
    if (address !== undefined) listing.address = address;

    listing.updatedAt = Date.now();

    await listing.save();

    res.status(200).json(listing);
  } catch (err) {
    console.error("Update Listing Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getListingById = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid listing ID format" });
  }

  try {
    const listing = await Listing.findById(id).lean();
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const ratings = await Rating.find({ listingId: id });

    let averageRating = 0;
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, r) => sum + (r.score || 0), 0);
      averageRating = total / ratings.length;
    }

    res.json({ ...listing, rating: averageRating });
  } catch (err) {
    console.error("Error fetching listing by id:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const listing = await Listing.findOne({ _id: id, landlordId: userId });

    if (!listing) {
      return res.status(404).json({ message: "Оголошення не знайдено" });
    }

    listing.status = ListingStatus.Deleted;
    await listing.save();

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleListingStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const listing = await Listing.findOne({ _id: id, landlordId: userId });

    if (!listing) {
      return res.status(404).json({ message: "Оголошення не знайдено" });
    }

    if (listing.status === ListingStatus.Deleted) {
      return res.status(400).json({
        message: "Видалене оголошення не можна активувати чи деактивувати",
      });
    }

    listing.status =
      listing.status === ListingStatus.Active
        ? ListingStatus.Inactive
        : ListingStatus.Active;
    await listing.save();

    res.json({
      message: `Оголошення перемкнуто в статус: ${listing.status}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllActiveListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      status: ListingStatus.Active,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    const listingIds = listings.map((listing) => listing._id);

    const ratings = await Rating.aggregate([
      {
        $match: {
          listingId: { $in: listingIds },
          status: "active",
        },
      },
      {
        $group: {
          _id: "$listingId",
          averageRating: { $avg: "$score" },
        },
      },
    ]);

    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = r.averageRating;
    });

    const enrichedListings = listings.map((listing) => {
      const avg = ratingMap[listing._id.toString()];
      return {
        ...listing.toObject(),
        averageRating: avg ? Math.round(avg * 2) / 2 : 0,
      };
    });

    res.json(enrichedListings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const suspendListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findOne({ _id: id });

    if (!listing) {
      return res.status(404).json({ message: "Оголошення не знайдено" });
    }

    if (listing.status === ListingStatus.Deleted) {
      return res.status(400).json({
        message: "Видалене оголошення не можна деактивувати",
      });
    }

    listing.status = ListingStatus.Suspended;
    await listing.save();

    const landlord = await User.findOne({ _id: listing?.landlordId });

    sendListingDeactivatedEmail({
      to: landlord?.email,
      listingTitle: listing?.title,
    });

    res.json({ message: "Оголошення успішно деактивоване" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const activateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findOne({ _id: id });

    if (!listing) {
      return res.status(404).json({ message: "Оголошення не знайдено" });
    }

    if (listing.status === ListingStatus.Deleted) {
      return res.status(400).json({
        message: "Видалене оголошення не можна активувати",
      });
    }

    if (listing.status === ListingStatus.Active) {
      return res.json({ message: "Оголошення вже активне" });
    }

    listing.status = ListingStatus.Active;
    await listing.save();

    const landlord = await User.findOne({ _id: listing?.landlordId });

    sendListingActivatedEmail({
      to: landlord?.email,
      listingTitle: listing?.title,
    });

    res.json({ message: "Оголошення успішно активоване" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
