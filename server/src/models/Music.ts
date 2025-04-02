import mongoose, { Schema, Document } from 'mongoose';

export interface IMusic extends Document {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  releaseDate: Date;
  coverImage: string;
  audioUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const MusicSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: true },
  genre: { type: String, required: true },
  duration: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  coverImage: { type: String, required: true },
  audioUrl: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.model<IMusic>('Music', MusicSchema); 