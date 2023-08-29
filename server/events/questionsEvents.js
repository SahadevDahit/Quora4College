import {
  isLoggedIn
} from "../middlewares/socketIsLoggedIn.js";
import question from "../models/questions.js"; // Assuming the file containing the question model is named "question.js"
import answers from "../models/answers.js";
export const handlePost = (io) => {
  io.on("connection", (socket) => {
    socket.on("getAllQuestions", (headers, page) => {
      const userAuthId = isLoggedIn(headers);
      const pageSize = 5;
      const skipCount = (page - 1) * pageSize;

      question
        .aggregate([{
            $skip: skipCount
          },
          {
            $limit: pageSize
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $unwind: "$user"
          },
          {
            $project: {
              _id: 1,
              userId: "$userId",
              userName: "$user.userName",
              question: 1,
              likes: 1,
              createdAt: 1
            }
          },
          {
            $sample: {
              size: pageSize
            } // Add this stage to get random questions within the pagination
          }
        ])
        .then((questions) => {
          socket.emit("allQuestions", questions, userAuthId);
        })
        .catch((error) => {
          console.error("Error retrieving random questions in pagination:", error);
          socket.emit("Error", {
            message: "Error retrieving random questions in pagination"
          });
        });
    });


    socket.on("likeQuestion", ({
      questionId,
      headers
    }) => {
      const userAuthId = isLoggedIn(headers);
      if (!userAuthId) {
        socket.emit("Error", {
          message: "Login First !!!"
        });
        return;
      }

      // Find the question by ID
      question.findById(questionId).then((foundQuestion) => {
        if (!foundQuestion) {
          throw new Error("Question not found");
        }

        // Check if the user has already liked the question
        const hasLiked = foundQuestion.likes.includes(userAuthId);
        if (hasLiked) {
          // User has already liked the question, remove their like
          foundQuestion.likes = foundQuestion.likes.filter(
            (id) => id !== userAuthId
          );
        } else {
          // User has not liked the question, add their like
          foundQuestion.likes.push(userAuthId);
        }

        // Save the updated question
        foundQuestion.save().then(() => {
          // Lookup the user to get the userName
          question
            .aggregate([{
                $match: {
                  _id: foundQuestion._id,
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $unwind: "$user",
              },
              {
                $project: {
                  _id: 1,
                  userName: "$user.userName",
                  question: 1,
                  likes: 1,
                  createdAt: 1,
                },
              },
            ])
            .then((updatedQuestion) => {
              // Emit the updated question to the clients
              io.emit("likeUpdated", updatedQuestion[0]);
            })
            .catch((error) => {
              console.error("Error retrieving updated question:", error);
              socket.emit("Error", {
                message: "Error retrieving updated question",
              });
            });
        });
      });
    });

    socket.on("newAnswer", ({
      answerContent,
      userId,
      questionId
    }) => {
      // Create a new answer document
      const newAnswer = new answers({
        questionId: questionId,
        userId: userId,
        content: answerContent,
        // Set other properties of the answer here
      });

      let savedAnswer; // Declare savedAnswer variable

      // Save the new answer document
      newAnswer
        .save()
        .then((saved) => {
          savedAnswer = saved; // Assign the saved answer to savedAnswer variable

          // Update the answers array in the corresponding question document
          return question.findByIdAndUpdate(
            questionId, {
              $push: {
                answers: savedAnswer._id
              }
            }, {
              new: true
            }
          );
        })
        .then((updatedQuestion) => {
          return answers.findById(savedAnswer._id).populate("userId").then((answer) => {
            io.emit("newAnswerAdded", {
              answer
            });
          });
        })
        .catch((error) => {
          console.log("Error saving answer:", error);
          socket.emit("Error", {
            message: "Error saving answer"
          });
        });
    });
    socket.on("deleteAnswer", ({
      answerId,
      questionId
    }) => {
      // Find the answer by ID
      answers
        .findById(answerId)
        .then((foundAnswer) => {
          if (!foundAnswer) {
            socket.emit("Error", {
              message: "Answer not found"
            });
            return;
          }

          // Remove the answer from the answers collection
          return answers
            .findByIdAndRemove(answerId)
            .then(() => {
              // Update the corresponding question by removing the answer ID
              return question.findByIdAndUpdate(
                questionId, {
                  $pull: {
                    answers: answerId
                  }
                }, {
                  new: true
                }
              );
            })
            .then((updatedQuestion) => {
              if (!updatedQuestion) {
                socket.emit("Error", {
                  message: "Question not found"
                });
                return;
              }
              // Emit the deleted answer ID to all connected clients
              io.emit("answerDeleted", answerId);
            })
            .catch((error) => {
              console.error("Error deleting answer:", error);
              socket.emit("Error", {
                message: "Error deleting answer"
              });
            });
        })
        .catch((error) => {
          console.error("Error finding answer:", error);
          socket.emit("Error", {
            message: "Error finding answer"
          });
        });
    });

    socket.on("getAnswers", (questionId) => {
      // Find the question by ID
      question
        .findById(questionId)
        .populate({
          path: "answers",
          populate: {
            path: "userId",
            model: "users",
          },
        })
        .populate("userId")
        .exec()
        .then((foundQuestion) => {
          if (!foundQuestion) {
            throw new Error("Question not found");
          }
          // Retrieve the associated answers
          // Emit the question with populated answers and userId to the client
          socket.emit("allAnswers", foundQuestion);
        })
        .catch((error) => {
          console.error("Error retrieving answers:", error);
          socket.emit("Error", {
            message: "Error retrieving answers"
          });
        });
    });



    socket.on("updateQuestion", ({
      questionId,
      editedQuestion
    }) => {
      // Find the question by ID
      question.findById(questionId)
        .then((foundQuestion) => {
          if (!foundQuestion) {
            socket.emit("Error", {
              message: "Question not found"
            });
            return;
          }

          // Update the question content
          foundQuestion.question = editedQuestion;

          // Save the updated question
          foundQuestion.save()
            .then((updatedQuestion) => {
              // Emit the updated question to the clients
              io.emit("questionUpdated", updatedQuestion);
            })
            .catch((error) => {
              console.error("Error updating question:", error);
              socket.emit("Error", {
                message: "Error updating question"
              });
            });
        })
        .catch((error) => {
          console.error("Error finding question:", error);
          socket.emit("Error", {
            message: "Error finding question"
          });
        });
    });

  });

};