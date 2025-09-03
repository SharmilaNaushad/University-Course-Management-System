import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from "../controllers/userController.js";

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (admin)
router.get("/", authenticate, authorize("admin"), getAllUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (admin)
router.get("/stats", authenticate, authorize("admin"), getUserStats);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (admin, or own profile)
router.get("/:id", authenticate, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Private (admin, or own profile)
router.put("/:id", authenticate, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID
// @access  Private (admin only)
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

export default router;
