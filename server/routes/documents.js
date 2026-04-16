const express = require("express");
const Document = require("../models/Document");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");
const { createNotification } = require("../utils/notificationHelper");

module.exports = (io) => {
  const router = express.Router();

  router.get("/", protect, async (req, res, next) => {
    try {
      const { search, page = 1, limit = 20, sort = "updatedAt" } = req.query;
      const baseQuery = {
        $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
        deleted: { $ne: true },
      };
      let query;
      let sortOption;
      if (search && search.trim()) {
        query = {
          ...baseQuery,
          $text: { $search: search.trim() },
        };
        sortOption = { score: { $meta: "textScore" } };
      } else {
        query = baseQuery;
        sortOption = { [sort]: -1 };
      }
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [documents, total] = await Promise.all([
        Document.find(query)
          .select("title owner updatedAt createdAt")
          .populate("owner", "name email")
          .select(
            search && search.trim() ? { score: { $meta: "textScore" } } : {},
          )
          .sort(sortOption)
          .skip(skip)
          .limit(parseInt(limit)),
        Document.countDocuments(query),
      ]);
      res.json({
        documents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
          hasMore: skip + documents.length < total,
        },
      });
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
      await logActivity(document, "document_created", req.user);
      await document.save();
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  });

  
  router.post("/:id/duplicate", protect, async (req, res, next) => {
    try {
      const original = await Document.findById(req.params.id);

      if (!original) {
        return res.status(404).json({ message: "Document not found" });
      }

      
      const hasAccess =
        original.owner.toString() === req.user._id.toString() ||
        original.collaborators.some(
          (c) => c.toString() === req.user._id.toString(),
        );

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      
      
      const duplicate = await Document.create({
        title: `${original.title} (Copy)`,
        content: original.content,
        htmlContent: original.htmlContent,
        owner: req.user._id,
        
      });

      
      const { logActivity } = require("../utils/activityLogger");
      await logActivity(duplicate, "document_created", req.user, {
        duplicatedFrom: original._id,
        originalTitle: original.title,
      });
      await duplicate.save();

      res.status(201).json(duplicate);
    } catch (error) {
      next(error);
    }
  });

  
  router.get("/trash", protect, async (req, res, next) => {
    try {
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const documents = await Document.find({
        owner: req.user._id,
        deleted: true,
        deletedAt: { $gte: thirtyDaysAgo }, 
      })
        .select("title deletedAt deletedBy updatedAt")
        .sort({ deletedAt: -1 });

      
      const docsWithExpiry = documents.map((doc) => {
        const deletedDate = new Date(doc.deletedAt);
        const expiresAt = new Date(
          deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        );
        const daysRemaining = Math.ceil(
          (expiresAt - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return {
          ...doc.toObject(),
          daysRemaining: Math.max(0, daysRemaining),
        };
      });

      res.json({ documents: docsWithExpiry });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", protect, async (req, res, next) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
        deleted: { $ne: true },
      })
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
      await logActivity(document, "title_changed", req.user, {
        newTitle: req.body.title,
      });
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

  
  router.post("/:id/restore", protect, async (req, res, next) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
        owner: req.user._id,
        deleted: true,
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found in trash" });
      }

      document.deleted = false;
      document.deletedAt = null;
      document.deletedBy = null;
      await document.save();

      res.json({ message: "Document restored", document });
    } catch (error) {
      next(error);
    }
  });

  
  router.delete("/:id/permanent", protect, async (req, res, next) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
        owner: req.user._id,
        deleted: true,
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found in trash" });
      }

      await document.deleteOne();
      res.json({ message: "Document permanently deleted" });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", protect, async (req, res, next) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
        deleted: { $ne: true },
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Only owner can delete" });
      }

      document.deleted = true;
      document.deletedAt = new Date();
      document.deletedBy = req.user._id;
      await document.save();

      res.json({ message: "Document moved to recycle bin" });
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
        return res
          .status(404)
          .json({ message: "No user found with that email" });
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
      await logActivity(document, "collaborator_added", req.user, {
        collaboratorName: userToAdd.name || email,
      });
      await document.save();

      await createNotification(io, {
        recipientId: userToAdd._id,
        type: "document_shared",
        title: "Document shared with you",
        message: `${req.user.name} shared "${document.title}" with you`,
        link: `/document/${document._id}`,
        senderId: req.user._id,
        senderName: req.user.name,
        metadata: { documentId: document._id, documentTitle: document.title },
      });

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

  router.delete(
    "/:id/collaborators/:userId",
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
    },
  );

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

  router.get("/:id/activity", protect, async (req, res, next) => {
    try {
      const document = await Document.findById(req.params.id).populate(
        "activity.user",
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
      const activityFeed = document.activity.sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      res.json({ activity: activityFeed.slice(0, 50) });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
