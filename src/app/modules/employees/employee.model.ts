import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  fullName: string;
  startJobDate: Date;
  gender: string;
  photo?: string;
  phone: string;
  email: string;
  address: string;
  jobTitle: string;
  joiningDate: Date;
  employmentType: string;
  education: string;
  skills: string[];
  totalVacation: number;
  vacationTaken: number;
  vacationRemaining: number;
  password: string;
  role:
    | "Admin"
    | "Principal"
    | "Chief Instructor"
    | "Instructor"
    | "Junior Instructor"
    | "Craft Instructor"
    | "Staff";
}

const EmployeeSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    startJobDate: { 
      type: Date, 
      required: function (this: any) { return this.role !== "Admin"; } 
    },
    gender: { 
      type: String, 
      required: function ( this: any) { return this.role !== "Admin"; } 
    },
    photo: String,
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { 
      type: String, 
      required: function (  this: any) { return this.role !== "Admin"; } 
    },
    jobTitle: { 
      type: String, 
      required: function ( this: any) { return this.role !== "Admin"; } 
    },
    joiningDate: { 
      type: Date, 
      required: function ( this: any) { return this.role !== "Admin"; } 
    },
    employmentType: { 
      type: String, 
      required: function (this: any) { return this.role !== "Admin"; } 
    },
    education: { 
      type: String, 
      required: function (this: any) { return this.role !== "Admin"; } 
    },
    skills: [String],
    totalVacation: { type: Number, default: 21 },
    vacationTaken: { type: Number, default: 0 },
    vacationRemaining: { type: Number, default: 21 },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "Admin",
        "Principal",
        "Chief Instructor",
        "Instructor",
        "Junior Instructor",
        "Craft Instructor",
        "Staff",
      ],
      required: true,
    },
  },
  { timestamps: true },
);


export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
