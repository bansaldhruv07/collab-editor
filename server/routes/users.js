const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    next(error);
  }
});
router.put(
  '/me',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email } = req.body;
      if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(name && { name }),
          ...(email && { email: email.toLowerCase() }),
        },
        {
          new: true,
          runValidators: true,
        }
      ).select('-password');
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);
router.put(
  '/me/password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      const isSame = await user.matchPassword(newPassword);
      if (isSame) {
        return res.status(400).json({
          message: 'New password must be different from your current password',
        });
      }
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);
router.delete('/me', protect, async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    const Document = require('../models/Document');
    await Document.deleteMany({ owner: req.user._id });
    await Document.updateMany(
      { collaborators: req.user._id },
      { $pull: { collaborators: req.user._id } }
    );
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});
module.exports = router;