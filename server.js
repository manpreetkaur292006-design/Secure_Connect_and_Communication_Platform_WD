require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const activityEmitter = require("./events/eventEmitter");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Secure Connect and Communication Platform is running"
  });
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  activityEmitter.emit("USER_CONNECTED", {
    socketId: socket.id,
    time: new Date().toISOString()
  });

  socket.on("chat message", (data) => {
    const message = {
      socketId: socket.id,
      user: data.user || "Anonymous",
      message: data.message,
      time: new Date().toISOString()
    };

    console.log("New chat message:", message);

    activityEmitter.emit("CHAT_MESSAGE", message);

    io.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    activityEmitter.emit("USER_DISCONNECTED", {
      socketId: socket.id,
      time: new Date().toISOString()
    });
  });
});

activityEmitter.on("USER_CONNECTED", (data) => {
  console.log(`[EVENT] User connected: ${data.socketId}`);
});

activityEmitter.on("USER_DISCONNECTED", (data) => {
  console.log(`[EVENT] User disconnected: ${data.socketId}`);
});

activityEmitter.on("CHAT_MESSAGE", (data) => {
  console.log(`[EVENT] Chat message from ${data.user}: ${data.message}`);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});