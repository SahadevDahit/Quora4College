import {
  isLoggedIn
} from "../middlewares/socketIsLoggedIn.js";
import users from "../models/users.js";
import chats from "../models/chats.js";

export const handleMessage = (io) => {
  const onlineUsers = new Map(); // Map to store online users
  io.on("connection", async (socket) => {
    let userId = null; // Variable to store the user ID
    let userAuthId = null; // Variable to store the user

    socket.on("initializeUser", async (newUserId, headers) => {
      // Initialize the user ID when received from the client
      userAuthId = isLoggedIn(headers);
      io.emit("onlineUsers", Array.from(onlineUsers.values()));

      if (!userAuthId) {
        socket.emit("Error", {
          message: "login first to chat"
        });
      } else {
        try {
          userId = newUserId;
          // Find the user in the 'onlineUsers' map based on the 'userAuthId'
          const user = Array.from(onlineUsers.values()).find(
            (user) => user._id === userAuthId
          );
          if (user) {
            // Remove the user from the 'onlineUsers' map
            onlineUsers.delete(user.id);
            onlineUsers.set(userId, {
              id: newUserId, // Update the userId here
              _id: userAuthId,
              socketId: socket.id,
              online: true,
              userName: user?.userName,
              messageCounts: 0,
            });
            io.emit("onlineUsers", Array.from(onlineUsers.values()));

          } else {
            // Find the user in the 'users' collection based on the 'userAuthId'
            const user = await users.findById(userAuthId);

            if (user) {
              // Add user to onlineUsers map
              onlineUsers.set(userId, {
                id: newUserId,
                _id: userAuthId,
                socketId: socket.id,
                online: true,
                userName: user?.userName,
                messageCounts: 0,

              });

              // Emit the list of online users and all users to all clients
              io.emit("onlineUsers", Array.from(onlineUsers.values()));
            }
          }
          io.emit("onlineUsers", Array.from(onlineUsers.values()));
        } catch (error) {
          console.error("Error fetching user from database:", error);
          socket.emit("Error", {
            message: "Error fetching user from database",
          });
        }
      }
    });

    socket.on("chatMessage", (message) => {
      // Broadcast the message to all connected clients
      io.emit("message", message);
    });
    socket.on("recipientSelected", ({
      recipientId
    }) => {
      const recipientSocket = onlineUsers.get(recipientId);
      if (recipientSocket) {
        recipientSocket.messageCounts = 0;
        io.emit("onlineUsers", Array.from(onlineUsers.values()));
      }
    });

    socket.on("privateMessage", async ({
      recipientId,
      message
    }) => {
      const recipientSocket = onlineUsers.get(recipientId);
      const senderSocket = onlineUsers.get(userId);
      if (senderSocket && recipientSocket) {
        try {
          // Send the private message to the recipient
          message.userName = senderSocket.name;
          // Save the message to the 'chats' collection
          const newChat = new chats({
            recipientId: recipientSocket?._id,
            senderId: senderSocket?._id,
            message: message.message,
          });
          const savedChat = await newChat.save();
          message.createdAt = savedChat.createdAt;
          message.recipientId = recipientId
          io.to(recipientSocket.socketId).emit("message", message);

          const user = Array.from(onlineUsers.values()).find(
            (user) => user._id === userAuthId
          );
          if (user) {
            // Send the private message to the sender
            io.to(senderSocket.socketId).emit("message", message);
            user.messageCounts += 1;
            io.to(senderSocket.socketId).emit("onlineUsers", Array.from(onlineUsers.values()));

          }
        } catch (error) {
          console.error("Error saving message to database:", error);
          socket.emit("Error", {
            message: "Error saving message to database",
          });
        }
      }
    });

    socket.on("loadChatMessages", async (recipientId, callback) => {
      const recipientSocket = onlineUsers.get(recipientId);
      const senderSocket = onlineUsers.get(userId);

      if (!recipientSocket || !senderSocket) {
        console.error("Recipient or sender socket not found");
        return;
      }

      try {
        // Fetch the chat messages between the current user (userId) and the recipient (recipientId) from the database
        const messages = await chats.find({
          $or: [{
              senderId: senderSocket._id,
              recipientId: recipientSocket._id
            },
            {
              senderId: recipientSocket._id,
              recipientId: senderSocket._id
            },
          ],
        });
        const filteredMessages = messages.map((message) => {
          const senderId = message?.senderId.toString();
          if (senderId === senderSocket._id) {
            return {
              ...message._doc, // Include the entire document
              userId: userId, // Add userId property
            };
          }
          return message;
        });

        callback(filteredMessages); // Send the chat messages back to the client
      } catch (error) {
        console.error("Error fetching chat messages from the database:", error);
      }
    });




    socket.on("disconnect", () => {
      console.log("A user disconnected");

      if (userId) {
        // Find the user in the 'onlineUsers' map based on the 'userAuthId'
        const user = Array.from(onlineUsers.values()).find(
          (user) => user._id === userAuthId
        );

        if (user) {
          // Update the 'online' property to false
          user.online = false;
          // Emit the updated list of online users to all clients
          io.emit("onlineUsers", Array.from(onlineUsers.values()));
          // Emit the disconnected user ID to all clients
          io.emit("userDisconnected", userId);
        }
      }
    });
  });
};