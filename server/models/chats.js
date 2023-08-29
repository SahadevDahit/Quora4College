import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    },
    senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const chats = mongoose.model("chats", chatSchema);
export default chats