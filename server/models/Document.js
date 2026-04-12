const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'document_created',
      'document_edited',
      'document_saved',
      'title_changed',
      'collaborator_added',
      'collaborator_removed',
      'version_restored',
      'document_viewed',
    ],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const versionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  htmlContent: {
    type: String,
    default: "",
  },
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
  label: {
    type: String,
    default: "",
  },
});
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Document",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    htmlContent: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    versions: [versionSchema],
    activity: {
      type: [activitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
documentSchema.index({ owner: 1 });

documentSchema.index({ collaborators: 1 });

documentSchema.index({ owner: 1, updatedAt: -1 });

documentSchema.index({ title: 'text' });

module.exports = mongoose.model("Document", documentSchema);
