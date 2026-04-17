import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  contentHtml?: string;
  text?: string;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    contentHtml: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: () => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'short',
          day: 'numeric',
          month: 'long',
        };
        return date.toLocaleDateString('en-US', options);
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
