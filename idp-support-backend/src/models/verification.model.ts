import { model, Schema, Types } from "mongoose";
import { VerificationStatus } from "../enums/VerificationStatus.js";

export interface IOcrData {
  passportNumber: string;
}

export interface IDocumentFile {
  type: 'certificate' | 'passport_front' | 'passport_back';
  path: string;
  hash: string;
}

export interface IValidationFlags {
  photoHashConflict?: {
    matchedVerificationId: string;
    matchedFileHash: string;
    matchedFileType: string;
  };
  ocrConflict?: {
    matchedVerificationId: string;
    matchedPassportNumber: string;
  };
  manualComment?: string;
}

export interface IVerification extends Document {
  userId: Types.ObjectId;
  status: VerificationStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  declineReason?: string;
  documentFiles: IDocumentFile[];
  ocrExtracted?: IOcrData;
  validationFlags?: IValidationFlags;
  createdAt: Date;
  updatedAt: Date;
}

const documentFileSchema = new Schema<IDocumentFile>(
  {
    type: {
      type: String,
      enum: ['certificate', 'passport_front', 'passport_back'],
      required: true
    },
    path: { type: String, required: true },
    hash: { type: String, required: true }
  },
  { _id: false }
);

const ocrSchema = new Schema<IOcrData>(
  {
    passportNumber: { type: String }
  },
  { _id: false }
);

const validationFlagsSchema = new Schema<IValidationFlags>(
  {
    photoHashConflict: {
      matchedVerificationId: { type: String },
      matchedFileHash: { type: String },
      matchedFileType: { type: String }
    },
    ocrConflict: {
      matchedVerificationId: { type: String },
      matchedPassportNumber: { type: String }
    },
    manualComment: { type: String }
  },
  { _id: false }
);

const verificationSchema = new Schema<IVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.Pending
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    declineReason: { type: String },
    documentFiles: { type: [documentFileSchema], default: [] },
    ocrExtracted: ocrSchema,
    validationFlags: validationFlagsSchema
  },
  { timestamps: true }
);

export default model<IVerification>('Verification', verificationSchema);