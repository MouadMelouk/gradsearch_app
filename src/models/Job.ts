import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  tags: string[];
  postedBy: mongoose.Types.ObjectId; // references User
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    tags: [{ type: String }],
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default models.Job || model<IJob>('Job', JobSchema);
