import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 999,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
  },
  {
    timestamps: true,
  },
);
export const messageModel = mongoose.model("Message", messageSchema);
