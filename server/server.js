import http from 'http';
import app from './app/app.js';
import { initializeSocket } from './socket.io/socket.js';

const PORT = process.env.PORT || 2023;
const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, console.log(`Server is up and running on port ${PORT}`));
