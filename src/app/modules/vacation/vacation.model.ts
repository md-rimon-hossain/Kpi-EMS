import mongoose, { Schema, Document } from "mongoose";

export interface IVacationRequest extends Document {
  employee: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
}

const VacationRequestSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
    default: "Pending",
  },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "Employee" }, // Chief Instructor
  approvedBy: { type: Schema.Types.ObjectId, ref: "Employee" }, // Principal
}, { timestamps: true });

export default mongoose.model<IVacationRequest>("VacationRequest", VacationRequestSchema);
