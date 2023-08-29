import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  likes: [{
    type: String,
    required: true,
  }],
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'answers',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
});

const question = mongoose.model('questions', questionSchema);

export default question;