const mongoose = require("mongoose");
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
