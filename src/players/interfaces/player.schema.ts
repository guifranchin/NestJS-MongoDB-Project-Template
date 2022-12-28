import * as moongose from 'mongoose';
export const PlayerSchema = new moongose.Schema(
  {
    email: { type: String, unique: true },
    phoneNumber: { type: String },
    name: String,
    ranking: String,
    rankingPosition: Number,
    urlAvatar: String,
  },
  { timestamps: true, collection: 'players' },
);
