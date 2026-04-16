const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Document = require('./models/Document');
const { logActivity } = require('./utils/activityLogger');
const documentRooms = new Map();
const saveTimers = new Map();
const USER_COLORS = [
  '#4F46E5', '#0891B2', '#059669', '#D97706',
  '#DC2626', '#7C3AED', '#DB2777', '#0284C7',
];
const getUserColor = (userId) => {
  const index = userId
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % USER_COLORS.length;
  return USER_COLORS[index];
};
const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });
  io.on('connection', (socket) => {
    console.log(`Connected: ${socket.user.name} (${socket.id})`);

    socket.join(`user:${socket.user._id}`);
    socket.on('join-document', (documentId) => {
      if (socket.currentDocument) {
        handleLeaveDocument(socket, io, socket.currentDocument);
      }
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
      const filtered = roomUsers.filter(u => u.userId !== userPresence.userId);
      filtered.push(userPresence);
      documentRooms.set(documentId, filtered);
      io.to(documentId).emit('presence-update', documentRooms.get(documentId));
      console.log(`${socket.user.name} joined document ${documentId}`);
    });
    socket.on('send-changes', ({ documentId, delta }) => {
      if (!documentId || !delta) return;
      socket.to(documentId).emit('receive-changes', delta);
    });
    socket.on('save-document', async ({ documentId, content, htmlContent }) => {
      if (!documentId || content === undefined) return;
      if (saveTimers.has(documentId)) {
        clearTimeout(saveTimers.get(documentId));
      }
      const timer = setTimeout(async () => {
        try {
          const document = await Document.findById(documentId);
          if (!document) return;
          const contentChanged = content !== document.content;
          if (contentChanged) {
            document.versions.push({
              content,
              htmlContent: htmlContent || '',
              savedBy: socket.user._id,
              savedAt: new Date(),
            });
            if (document.versions.length > 50) {
              document.versions = document.versions.slice(-50);
            }
          }
          document.content = content;
          document.htmlContent = htmlContent || '';
          document.lastEditedBy = socket.user._id;
          const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
          await logActivity(document, 'document_saved', socket.user, { wordCount });
          await document.save();
          io.to(documentId).emit('document-saved', {
            savedAt: document.updatedAt,
            savedBy: socket.user.name,
          });
          io.to(documentId).emit('activity-update', { documentId });
          saveTimers.delete(documentId);
          console.log(`Document ${documentId} saved by ${socket.user.name}`);
        } catch (err) {
          console.error('Save error:', err.message);
        }
      }, 2000);
      saveTimers.set(documentId, timer);
    });
    socket.on('restore-version', ({ documentId, content }) => {
      socket.to(documentId).emit('version-restored', {
        restoredBy: socket.user.name,
        content,
      });
    });
    socket.on('cursor-move', ({ documentId, range }) => {
      if (!documentId) return;
      socket.to(documentId).emit('cursor-update', {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        color: getUserColor(socket.user._id.toString()),
        range,
      });
    });
    socket.on('typing-start', ({ documentId }) => {
      if (!documentId) return;
      socket.to(documentId).emit('user-typing', {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        color: getUserColor(socket.user._id.toString()),
      });
    });
    socket.on('typing-stop', ({ documentId }) => {
      if (!documentId) return;
      socket.to(documentId).emit('user-stopped-typing', {
        userId: socket.user._id.toString(),
      });
    });
    socket.on('selection-change', ({ documentId, range }) => {
      if (!documentId) return;
      socket.to(documentId).emit('remote-selection', {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        color: getUserColor(socket.user._id.toString()),
        range,
      });
    });
    socket.on('section-focus', ({ documentId, lineIndex, lineText }) => {
      if (!documentId) return;
      socket.to(documentId).emit('section-locked', {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        color: getUserColor(socket.user._id.toString()),
        lineIndex,
        lineText: lineText?.slice(0, 50),
      });
    });
    socket.on('section-blur', ({ documentId, lineIndex }) => {
      if (!documentId) return;
      socket.to(documentId).emit('section-unlocked', {
        userId: socket.user._id.toString(),
        lineIndex,
      });
    });
    socket.on('leave-document', (documentId) => {
      handleLeaveDocument(socket, io, documentId);
    });
    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.user.name}`);
      if (socket.currentDocument) {
        handleLeaveDocument(socket, io, socket.currentDocument);
      }
    });
  });
};
function handleLeaveDocument(socket, io, documentId) {
  socket.leave(documentId);
  socket.currentDocument = null;
  if (documentRooms.has(documentId)) {
    const updated = documentRooms
      .get(documentId)
      .filter(u => u.socketId !== socket.id);
    if (updated.length === 0) {
      documentRooms.delete(documentId);
    } else {
      documentRooms.set(documentId, updated);
    }
    io.to(documentId).emit('presence-update', updated);
  }
}
module.exports = initializeSocket;