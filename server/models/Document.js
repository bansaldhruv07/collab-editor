const mongoose = require("mongoose");

// Each saved version is a subdocument with its own schema
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
  // A short label helps users identify versions in the UI
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
    // Append-only array of all saved versions
    versions: [versionSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Document", documentSchema);
