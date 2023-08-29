import mongoose from "mongoose";

const answersSchema = new mongoose.Schema({
 questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'questions',
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  content:{
    type:String,
    required:true,
  }
  // likes: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'users',
  // }],
//   reply: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'reply',
//   }],

});

const answers = mongoose.model('answers',answersSchema);
export default answers;
