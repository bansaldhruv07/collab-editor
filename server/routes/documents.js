const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const { protect } = require("../middleware/auth");

// GET /api/documents — get all documents for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .select("title owner updatedAt") // only return these fields (not full content)
      .populate("owner", "name email") // replace owner ID with actual name/email
      .sort({ updatedAt: -1 }); // newest first

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/documents — create a new document
router.post("/", protect, async (req, res) => {
  try {
    const document = await Document.create({
      title: req.body.title || "Untitled Document",
      content: "",
      owner: req.user._id,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/documents/:id — get a specific document
router.get("/:id", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user has access
    const hasAccess =
      document.owner._id.toString() === req.user._id.toString() ||
      document.collaborators.some(
        (c) => c._id.toString() === req.user._id.toString(),
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/documents/:id/title — update title only
router.patch("/:id/title", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can rename" });
    }

    document.title = req.body.title;
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can delete" });
    }

    await document.deleteOne();
    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
