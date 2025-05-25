import fs from "fs/promises";
import crypto from "crypto";
import Verification from "../models/verification.model.js";
import { VerificationStatus } from "../enums/VerificationStatus.js";
import { extractTextFromImage, parseOcrData } from "../utils/orc.js";
import { maskPassportNumber } from "../utils/mask.js";
import { generateSignedUrl } from "../utils/index.js";
import User from "../models/user.model.js";
import {
  sendVerificationApprovedEmail,
  sendVerificationDeclinedEmail,
} from "../utils/mailer.js";

function getFileHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function normalizeVerification(verification) {
  if (!verification) return null;

  let maskedValidationFlags = { ...verification.validationFlags };
  if (maskedValidationFlags?.ocrConflict?.matchedPassportNumber) {
    maskedValidationFlags.ocrConflict.matchedPassportNumber =
      maskPassportNumber(
        maskedValidationFlags.ocrConflict.matchedPassportNumber
      );
  }

  const signedUrls = verification.documentFiles.map(
    (file) => `${generateSignedUrl(file.path)}&cb=${Date.now()}`
  );

  return {
    _id: verification._id,
    createdAt: verification.createdAt,
    status: verification.status,
    validationFlags: maskedValidationFlags,
    user: {
      _id: verification.userId?._id,
      firstName: verification.userId?.firstName,
      lastName: verification.userId?.lastName,
      email: verification.userId?.email,
    },
    files: signedUrls,
  };
}

export const createVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;
    const documentFiles = [];
    const ocrCandidates = [];
    const validationFlags = {};

    for (const type of ["certificate", "passport_back", "passport_front"]) {
      const file = files[type]?.[0];

      if (!file) continue;

      if (file.size < 10 * 1024) {
        throw new Error("Файл занадто маленький або порожній");
      }

      const buffer = await fs.readFile(file.path);
      const hash = getFileHash(buffer);

      const existing = await Verification.findOne({
        "documentFiles.hash": hash,
      });

      if (existing) {
        validationFlags.photoHashConflict = {
          matchedVerificationId: existing._id.toString(),
          matchedFileHash: hash,
          matchedFileType: type,
        };
      }

      documentFiles.push({
        type,
        path: file.path,
        hash,
      });

      if (type === "passport_front") {
        ocrCandidates.push({ type, path: file.path });
      }
    }

    let ocrExtracted = { passportNumber: "" };
    let ocrSuccess = false;

    for (const { path: ocrPath } of ocrCandidates) {
      try {
        const text = await extractTextFromImage(ocrPath);
        const extracted = parseOcrData(text);

        if (extracted.documentNumber?.length === 9) {
          ocrExtracted.passportNumber = extracted.documentNumber;

          ocrSuccess = true;
          const existing = await Verification.findOne({
            "ocrExtracted.passportNumber": extracted.documentNumber,
          });

          if (existing) {
            validationFlags.ocrConflict = {
              matchedVerificationId: existing._id.toString(),
              matchedPassportNumber: extracted.documentNumber,
            };
          }

          break;
        }
      } catch (ocrError) {
        console.log(ocrError);
      }
    }

    if (!ocrSuccess) {
      return res.status(400).json({
        message:
          "Не вдалося розпізнати дані з документа. Завантажте чіткіше фото.",
      });
    }

    await Verification.create({
      userId,
      status: VerificationStatus.Pending,
      documentFiles,
      ocrExtracted,
      validationFlags,
    });

    res.status(201).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка при створенні верифікації" });
  }
};

export const getVerificationsList = async (req, res) => {
  try {
    const rawVerifications = await Verification.find()
      .select("createdAt status validationFlags userId declineReason")
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 })
      .lean();

    const verifications = rawVerifications.map((v) => {
      let maskedValidationFlags = { ...v.validationFlags };

      if (maskedValidationFlags?.ocrConflict?.matchedPassportNumber) {
        maskedValidationFlags.ocrConflict.matchedPassportNumber =
          maskPassportNumber(
            maskedValidationFlags.ocrConflict.matchedPassportNumber
          );
      }

      return {
        _id: v._id,
        createdAt: v.createdAt,
        declineReason: v?.declineReason,
        status: v.status,
        validationFlags: maskedValidationFlags,
        user: {
          _id: v.userId?._id,
          firstName: v.userId?.firstName,
          lastName: v.userId?.lastName,
          email: v.userId?.email,
        },
      };
    });

    res.json({ verifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка при отриманні верифікацій" });
  }
};

export const getMyVerifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const verifications = await Verification.find({ userId }).sort({
      createdAt: -1,
    });

    const normalized = verifications.map((v) => ({
      createdAt: v.createdAt,
      declineReason: v.declineReason,
      status: v.status,
      reviewedAt: v.reviewedAt,
    }));

    res.json({ verifications: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка при отриманні верифікацій" });
  }
};

export const getVerificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const verification = await Verification.findById(id)
      .select("createdAt status validationFlags userId documentFiles")
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .lean();

    if (!verification) {
      return res.status(404).json({ error: "Верифікацію не знайдено" });
    }

    res.json(normalizeVerification(verification));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка при отриманні верифікації" });
  }
};

export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, declineReason } = req.body;

    if (
      ![VerificationStatus.Approved, VerificationStatus.Rejected].includes(
        status
      )
    ) {
      return res.status(400).json({
        error: "Неправильний статус. Дозволено лише 'Approved' або 'Rejected'.",
      });
    }

    const updateData = {
      status,
      reviewedAt: new Date(),
      declineReason:
        status === VerificationStatus.Rejected
          ? declineReason || "Без пояснення"
          : null,
    };

    await Verification.findByIdAndUpdate(id, updateData);

    const updatedVerification = await Verification.findById(id)
      .select("createdAt status validationFlags userId documentFiles")
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .lean();

    if (!updatedVerification) {
      return res.status(404).json({ error: "Верифікацію не знайдено" });
    }

    if (status === VerificationStatus.Approved && updatedVerification.userId) {
      await User.findByIdAndUpdate(updatedVerification.userId._id, {
        isDocumentsVerified: true,
      });

      await sendVerificationApprovedEmail({
        to: updatedVerification.userId.email,
        firstName: updatedVerification.userId.firstName,
        lastName: updatedVerification.userId.lastName,
      });
    }

    if (status === VerificationStatus.Rejected && updatedVerification.userId) {
      await sendVerificationDeclinedEmail({
        to: updatedVerification.userId.email,
        firstName: updatedVerification.userId.firstName,
        lastName: updatedVerification.userId.lastName,
        declineReason: updateData.declineReason,
      });
    }

    res.json(normalizeVerification(updatedVerification));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Помилка при оновленні статусу верифікації" });
  }
};
