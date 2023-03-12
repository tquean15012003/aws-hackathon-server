const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const messageList = []

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", async (room) => {
    await socket.join(room);
    socket.to(1).emit('join_after_left', messageList) // notify other users in the room that I just rejoined
    socket.emit('join', messageList) // retrieve all messages in the room
    // io.to(socket.id).emit('join', messageList);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    messageList.push(data)
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    socket.to(1).emit("leave", {});
    console.log("User Disconnected", socket.id);
  });
});

server.listen(4000, () => {
  console.log("SERVER RUNNING");
});
