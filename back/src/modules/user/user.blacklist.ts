import { model, Schema, Types } from "mongoose";

const blacklistSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: "User",
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: "0" },
  },
});

export const Blacklist = model("Blacklist", blacklistSchema);
