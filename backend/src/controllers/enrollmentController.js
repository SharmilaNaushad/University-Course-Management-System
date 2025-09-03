import { validationResult } from "express-validator";
import { Op } from "sequelize";
import { User, Course, Enrollment } from "../models/index.js";

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (student)
export const enrollInCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { courseId } = req.body;
    const studentId = req.user.id;

    // Check if course exists and is active
    const course = await Course.findOne({
      where: { id: courseId, isActive: true },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or inactive",
      });
    }

    // Check if course has available spots
    if (course.currentEnrollment >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "Course is full",
      });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { studentId, courseId },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: "enrolled",
    });

    // Fetch enrollment with related data
    const enrollmentWithDetails = await Enrollment.findByPk(enrollment.id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "code", "credits", "semester", "year"],
        },
        {
          model: User,
          as: "student",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: { enrollment: enrollmentWithDetails },
    });
  } catch (error) {
    console.error("Enroll in course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during enrollment",
    });
  }
};

// @desc    Get current user's enrollments
// @route   GET /api/enrollments/my
// @access  Private
export const getMyEnrollments = async (req, res) => {
  try {
    const { status, semester, year, page = 1, limit = 10 } = req.query;

    const whereClause = { studentId: req.user.id };
    const courseWhere = {};

    if (status) {
      whereClause.status = status;
    }

    if (semester) {
      courseWhere.semester = semester;
    }

    if (year) {
      courseWhere.year = parseInt(year);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: "course",
          where: Object.keys(courseWhere).length > 0 ? courseWhere : undefined,
          include: [
            {
              model: User,
              as: "instructor",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["enrollmentDate", "DESC"]],
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEnrollments: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get my enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrollments",
    });
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
export const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          include: [
            {
              model: User,
              as: "instructor",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
        {
          model: User,
          as: "student",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check access permissions
    const canAccess =
      req.user.role === "admin" ||
      req.user.id === enrollment.studentId ||
      (req.user.role === "instructor" &&
        req.user.id === enrollment.course.instructorId);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: { enrollment },
    });
  } catch (error) {
    console.error("Get enrollment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrollment",
    });
  }
};

// @desc    Update enrollment (grades, status)
// @route   PUT /api/enrollments/:id
// @access  Private (instructor/admin)
export const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, gradePoints, status, notes, completionDate } = req.body;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check if user can update this enrollment
    const canUpdate =
      req.user.role === "admin" ||
      (req.user.role === "instructor" &&
        req.user.id === enrollment.course.instructorId);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only course instructor or admin can update grades.",
      });
    }

    const updateData = {};
    if (grade !== undefined) updateData.grade = grade;
    if (gradePoints !== undefined) updateData.gradePoints = gradePoints;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (completionDate !== undefined)
      updateData.completionDate = completionDate;

    // Set completion date if status is changed to completed
    if (status === "completed" && !completionDate) {
      updateData.completionDate = new Date();
    }

    await enrollment.update(updateData);

    // Fetch updated enrollment with details
    const updatedEnrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "code", "credits"],
        },
        {
          model: User,
          as: "student",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Enrollment updated successfully",
      data: { enrollment: updatedEnrollment },
    });
  } catch (error) {
    console.error("Update enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating enrollment",
    });
  }
};

// @desc    Drop/withdraw from course
// @route   DELETE /api/enrollments/:id
// @access  Private
export const dropCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check permissions - student can drop own enrollment, admin can drop any
    const canDrop =
      req.user.role === "admin" || req.user.id === enrollment.studentId;

    if (!canDrop) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if course has already started (optional business rule)
    const now = new Date();
    if (enrollment.course.startDate <= now) {
      // Mark as withdrawn instead of deleting
      await enrollment.update({
        status: "withdrawn",
        completionDate: now,
      });

      res.json({
        success: true,
        message: "Successfully withdrawn from course",
      });
    } else {
      // Course hasn't started yet, can fully drop
      await enrollment.destroy();

      res.json({
        success: true,
        message: "Successfully dropped from course",
      });
    }
  } catch (error) {
    console.error("Drop course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while dropping course",
    });
  }
};
