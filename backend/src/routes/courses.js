import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  getInstructorCourses,
} from "../controllers/courseController.js";
import { validateCourse } from "../utils/validation.js";

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get("/", getCourses);

// @route   GET /api/courses/instructor/my-courses
// @desc    Get instructor's courses
// @access  Private (instructor)
router.get(
  "/instructor/my-courses",
  authenticate,
  authorize("instructor"),
  getInstructorCourses
);

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get("/:id", getCourse);

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (instructor/admin)
router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  validateCourse,
  createCourse
);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (instructor/admin)
router.put(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  validateCourse,
  updateCourse
);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (instructor/admin)
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  deleteCourse
);

// @route   GET /api/courses/:id/enrollments
// @desc    Get course enrollments
// @access  Private (instructor/admin)
router.get(
  "/:id/enrollments",
  authenticate,
  authorize("instructor", "admin"),
  getCourseEnrollments
);

export default router;
