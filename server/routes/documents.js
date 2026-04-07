const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

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
      .populate("collaborators", "name email")
      .populate("lastEditedBy", "name email");

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

    const { content, htmlContent, label } = req.body;

    const contentChanged = content !== document.content;

    if (contentChanged) {
      
      document.versions.push({
        content,
        htmlContent: htmlContent || "",
        savedBy: req.user._id,
        savedAt: new Date(),
        label: label || "",
      });

      if (document.versions.length > 50) {
        document.versions = document.versions.slice(-50);
      }
    }

    document.content = content;
    document.htmlContent = htmlContent || "";
    document.lastEditedBy = req.user._id;

    await document.save();

    res.json({
      message: "Saved",
      updatedAt: document.updatedAt,
      versionCount: document.versions.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/versions", protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "versions.savedBy",
      "name email",
    );

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

    const versions = document.versions
      .slice()
      .reverse()
      .map((v, index) => ({
        _id: v._id,
        savedBy: v.savedBy,
        savedAt: v.savedAt,
        label: v.label,
        
        versionIndex: document.versions.length - 1 - index,
      }));

    res.json({ versions, total: versions.length });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/versions/:versionId", protect, async (req, res, next) => {
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

    const version = document.versions.id(req.params.versionId);

    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }

    res.json({
      _id: version._id,
      content: version.content,
      htmlContent: version.htmlContent,
      savedAt: version.savedAt,
      label: version.label,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/versions/:versionId/restore",
  protect,
  async (req, res, next) => {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Only the owner can restore versions" });
      }

      const version = document.versions.id(req.params.versionId);

      if (!version) {
        return res.status(404).json({ message: "Version not found" });
      }

      document.versions.push({
        content: document.content,
        htmlContent: document.htmlContent,
        savedBy: req.user._id,
        savedAt: new Date(),
        label: `Before restore to ${new Date(version.savedAt).toLocaleString()}`,
      });

      document.content = version.content;
      document.htmlContent = version.htmlContent;
      document.lastEditedBy = req.user._id;

      await document.save();

      res.json({
        message: "Version restored",
        content: version.content,
        htmlContent: version.htmlContent,
      });
    } catch (error) {
      next(error);
    }
  },
);

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
