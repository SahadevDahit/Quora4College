import { Server } from "socket.io";
import { handleMessage } from "../events/messageEvents.js";
import {handlePost} from "../events/questionsEvents.js";
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow requests from all origins
      methods: ["GET", "POST","PUT","DELETE"], // Allowed HTTP methods
    },
  });
  handleMessage(io);
  handlePost(io);
  return io; // Return the io instance
};
