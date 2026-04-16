const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();
const userRoutes = require("./routes/users");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const notificationRoutes = require("./routes/notifications");
const initializeSocket = require("./socket");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const cleanupTrash = require("./jobs/cleanupTrash");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
connectDB();
app.use(helmet());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use("/api/users", userRoutes);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(mongoSanitize());
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes(io));
app.use("/api/notifications", notificationRoutes);
initializeSocket(io);
app.use(notFound);
app.use(errorHandler);


cleanupTrash();
setInterval(cleanupTrash, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
module.exports = { app, server, io };
