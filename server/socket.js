const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Document = require("./models/Document");

const documentRooms = new Map();

const USER_COLORS = [
  "#4F46E5",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#DB2777",
  "#0284C7",
];

const getUserColor = (userId) => {
  const index =
    userId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    USER_COLORS.length;
  return USER_COLORS[index];
};

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-document", (documentId) => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id && room !== documentId) {
          handleLeaveDocument(socket, io, room);
        }
      });

      socket.join(documentId);
      socket.currentDocument = documentId;

      const userPresence = {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        color: getUserColor(socket.user._id.toString()),
        socketId: socket.id,
      };

      if (!documentRooms.has(documentId)) {
        documentRooms.set(documentId, []);
      }

      const roomUsers = documentRooms.get(documentId);

      const filtered = roomUsers.filter(
        (u) => u.userId !== userPresence.userId,
      );
      filtered.push(userPresence);
      documentRooms.set(documentId, filtered);

      io.to(documentId).emit("presence-update", documentRooms.get(documentId));
    });

    socket.on("leave-document", (documentId) => {
      handleLeaveDocument(socket, io, documentId);
    });

    socket.on("send-changes", ({ documentId, delta }) => {
      socket.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async ({ documentId, content, htmlContent }) => {
      try {
        await Document.findByIdAndUpdate(documentId, {
          content,
          htmlContent,
          lastEditedBy: socket.user._id,
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error("[Socket] save-document error:", err.message);
      }
    });

    socket.on("cursor-move", ({ documentId, range }) => {
      socket.to(documentId).emit("cursor-update", {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        color: getUserColor(socket.user._id.toString()),
        range,
      });
    });

    socket.on("disconnect", () => {
      if (socket.currentDocument) {
        handleLeaveDocument(socket, io, socket.currentDocument);
      }
    });
  });
};

function handleLeaveDocument(socket, io, documentId) {
  socket.leave(documentId);

  if (documentRooms.has(documentId)) {
    const updated = documentRooms
      .get(documentId)
      .filter((u) => u.socketId !== socket.id);

    if (updated.length === 0) {
      documentRooms.delete(documentId);
    } else {
      documentRooms.set(documentId, updated);
    }

    io.to(documentId).emit("presence-update", updated);
  }
}

module.exports = initializeSocket;
