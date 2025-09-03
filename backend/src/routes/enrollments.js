import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  enrollInCourse,
  getMyEnrollments,
  updateEnrollment,
  dropCourse,
  getEnrollmentById,
} from "../controllers/enrollmentController.js";
import { validateEnrollment } from "../utils/validation.js";

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll in a course
// @access  Private (student)
router.post(
  "/",
  authenticate,
  authorize("student"),
  validateEnrollment,
  enrollInCourse
);

// @route   GET /api/enrollments/my
// @desc    Get current user's enrollments
// @access  Private
router.get("/my", authenticate, getMyEnrollments);

// @route   GET /api/enrollments/:id
// @desc    Get enrollment by ID
// @access  Private
router.get("/:id", authenticate, getEnrollmentById);

// @route   PUT /api/enrollments/:id
// @desc    Update enrollment (for grades, etc.)
// @access  Private (instructor/admin)
router.put(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  updateEnrollment
);

// @route   DELETE /api/enrollments/:id
// @desc    Drop/withdraw from course
// @access  Private (student can drop own, admin can drop any)
router.delete("/:id", authenticate, dropCourse);

export default router;
