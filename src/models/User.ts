// src/models/User.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'employer';
  resumeUrl?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'employer'],
      required: true,
    },
    resumeUrl: { type: String },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev
export default models.User || model<IUser>('User', UserSchema);
