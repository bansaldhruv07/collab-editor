const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const { protect } = require("../middleware/auth");
const User = require('../models/User');

router.get("/", protect, async (req, res, next) => {
  try {
    const documents = await Document.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .select("title owner updatedAt")
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const document = await Document.create({
      title: req.body.title || "Untitled Document",
      content: "",
      owner: req.user._id,
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", protect, async (req, res, next) => {
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
    next(error);
  }
});

router.patch("/:id/title", protect, async (req, res, next) => {
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
    next(error);
  }
});

router.put("/:id/content", protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const hasAccess =
      document.owner.toString() === req.user._id.toString() ||
      document.collaborators.some(
        (c) => c.toString() === req.user._id.toString(),
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    document.content = req.body.content;
    document.htmlContent = req.body.htmlContent;
    document.lastEditedBy = req.user._id;

    await document.save();

    res.json({ message: "Saved", updatedAt: document.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
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
    next(error);
  }
});

router.post("/:id/collaborators", protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can share this document" });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    if (userToAdd._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You are already the owner" });
    }

    const alreadyAdded = document.collaborators.some(
      (c) => c.toString() === userToAdd._id.toString(),
    );
    if (alreadyAdded) {
      return res.status(400).json({ message: "User already has access" });
    }

    document.collaborators.push(userToAdd._id);
    await document.save();

    const populatedDoc = await Document.findById(document._id).populate(
      "collaborators",
      "name email",
    );

    res.json({
      message: "Collaborator added",
      collaborators: populatedDoc.collaborators,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/collaborators/:userId", protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can remove collaborators" });
    }

    document.collaborators = document.collaborators.filter(
      (c) => c.toString() !== req.params.userId,
    );

    await document.save();

    res.json({ message: "Collaborator removed" });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/collaborators", protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("collaborators", "name email")
      .populate("owner", "name email");

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

    res.json({
      owner: document.owner,
      collaborators: document.collaborators,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
