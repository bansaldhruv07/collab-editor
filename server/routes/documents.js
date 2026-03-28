const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const { protect } = require("../middleware/auth");


router.get("/", protect, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .select("title owner updatedAt")
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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


router.get("/:id", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }


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
