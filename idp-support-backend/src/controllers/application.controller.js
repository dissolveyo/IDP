import mongoose from "mongoose";
import Application from "../models/application.model.js";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "../utils/mailer.js";

export const createApplication = async (req, res) => {
  try {
    const { listingId, landlordId, message } = req.body;
    const applicantId = req.user.id;

    if (!listingId || !landlordId) {
      return res.status(400).json({ error: "Відсутні обовʼязкові поля" });
    }

    const existingApplication = await Application.findOne({
      listingId: new mongoose.Types.ObjectId(listingId),
      applicantId: new mongoose.Types.ObjectId(applicantId),
    });

    if (existingApplication) {
      return res.status(400).json({
        error: "Ви вже надіслали заявку на проживання в цьому оголошенні",
      });
    }

    const application = new Application({
      listingId,
      landlordId,
      applicantId,
      message,
    });

    await application.save();

    res.status(201).json(application);
  } catch (err) {
    console.error("Помилка при створенні заявки:", err);
    res.status(400).json({ error: err.message });
  }
};

export const hasPendingApplication = async (req, res) => {
  try {
    const applicantId = req.user.id;
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({ error: "Не передано listingId" });
    }

    const exists = await Application.exists({
      listingId: new mongoose.Types.ObjectId(listingId),
      applicantId: new mongoose.Types.ObjectId(applicantId),
      status: "pending",
    });

    res.status(200).json({ hasPending: !!exists });
  } catch (err) {
    console.error("Помилка при перевірці pending заявки:", err);
    res.status(500).json({ error: "Щось пішло не так" });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate(
      "listingId applicantId landlordId"
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let filter = {};

    if (role === "Landlord") {
      filter.landlordId = userId;
    } else if (role === "IDP") {
      filter.applicantId = userId;
    } else {
      return res.status(403).json({ error: "Access denied: Invalid role" });
    }

    const applications = await Application.find(filter)
      .select("status listingId applicantId createdAt message")
      .sort({ createdAt: -1 })
      .populate({
        path: "listingId",
        select: "title address description images status location options",
      })
      .populate({
        path: "applicantId",
        select: "firstName lastName email avatar isDocumentsVerified",
      });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Not found" });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Not found" });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const approveOrRejectApplication = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    const fullApplication = await Application.findById(application._id)
      .populate("applicantId")
      .populate({
        path: "listingId",
        populate: { path: "landlordId" },
      });

    const applicant = fullApplication.applicantId;
    const listing = fullApplication.listingId;
    const landlord = listing?.landlordId;

    if (status === "approved") {
      await sendApplicationApprovedEmail({
        to: applicant.email,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        listingTitle: listing?.title,
        ownerName: `${landlord.lastName} ${landlord.firstName}`,
      });
    } else if (status === "rejected") {
      await sendApplicationRejectedEmail({
        to: applicant.email,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        listingTitle: listing?.title,
        ownerName: `${landlord.lastName} ${landlord.firstName}`,
      });
    }

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
