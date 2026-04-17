const Document = require('../models/Document');

const cleanupTrash = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Document.deleteMany({
      deleted: true,
      deletedAt: { $lt: thirtyDaysAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`Cleanup: permanently deleted ${result.deletedCount} expired documents`);
    }
  } catch (err) {
    console.error('Trash cleanup error:', err.message);
  }
};

module.exports = cleanupTrash;
