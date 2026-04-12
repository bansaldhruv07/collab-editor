const logActivity = async (document, type, user, metadata = {}) => {
  try {
    document.activity.push({
      type,
      user: user._id,
      userName: user.name,
      metadata,
      timestamp: new Date(),
    });
    if (document.activity.length > 100) {
      document.activity = document.activity.slice(-100);
    }
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};
module.exports = { logActivity };