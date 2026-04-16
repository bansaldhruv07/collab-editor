const Notification = require('../models/Notification');

const createNotification = async (io, {
  recipientId,
  type,
  title,
  message,
  link = '',
  senderId = null,
  senderName = '',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      sender: senderId,
      senderName,
      metadata,
    });

    if (io) {
      io.to(`user:${recipientId}`).emit('new-notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        senderName: notification.senderName,
        read: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
    return null;
  }
};

module.exports = { createNotification };
