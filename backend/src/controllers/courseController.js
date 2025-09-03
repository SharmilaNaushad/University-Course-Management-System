import { validationResult } from "express-validator";
import { Op } from "sequelize";
import { User, Course, Enrollment } from "../models/index.js";

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      semester,
      year,
      search,
      instructor,
      available,
    } = req.query;

    // Build query
    const whereClause = { isActive: true };

    if (department) whereClause.department = department;
    if (semester) whereClause.semester = semester;
    if (year) whereClause.year = parseInt(year);
    if (instructor) whereClause.instructorId = instructor;
    if (available === "true") {
      whereClause[Op.and] = [
        { currentEnrollment: { [Op.lt]: { [Op.col]: "maxStudents" } } },
      ];
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course",
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (instructor/admin)
export const createCourse = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({
      where: { code: req.body.code.toUpperCase() },
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    // Set instructor to current user if not provided (for instructors)
    if (req.user.role === "instructor" && !req.body.instructorId) {
      req.body.instructorId = req.user.id;
    }

    // Validate instructor exists and has instructor role
    if (req.body.instructorId) {
      const instructor = await User.findByPk(req.body.instructorId);
      if (!instructor || instructor.role !== "instructor") {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor",
        });
      }
    }

    const courseData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      instructorId: req.body.instructorId || req.user.id,
    };

    const course = await Course.create(courseData);

    // Fetch created course with instructor details
    const courseWithInstructor = await Course.findByPk(course.id, {
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: { course: courseWithInstructor },
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating course",
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (instructor/admin)
export const updateCourse = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    let course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user can update this course
    if (req.user.role === "instructor" && course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    // Check if course code is being changed and if it already exists
    if (req.body.code && req.body.code.toUpperCase() !== course.code) {
      const existingCourse = await Course.findOne({
        where: {
          code: req.body.code.toUpperCase(),
          id: { [Op.ne]: course.id },
        },
      });

      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: "Course code already exists",
        });
      }
    }

    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    await course.update(updateData);

    // Fetch updated course with instructor details
    const updatedCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Course updated successfully",
      data: { course: updatedCourse },
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating course",
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (instructor/admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user can delete this course
    if (req.user.role === "instructor" && course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    // Check if there are active enrollments
    const activeEnrollments = await Enrollment.count({
      where: {
        courseId: course.id,
        status: { [Op.in]: ["enrolled", "pending"] },
      },
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course with active enrollments",
      });
    }

    // Soft delete by setting isActive to false
    await course.update({ isActive: false });

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting course",
    });
  }
};

// @desc    Get course enrollments
// @route   GET /api/courses/:id/enrollments
// @access  Private (instructor/admin)
export const getCourseEnrollments = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user can view enrollments
    if (req.user.role === "instructor" && course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view course enrollments",
      });
    }

    const enrollments = await Enrollment.findAll({
      where: { courseId: course.id },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "firstName", "lastName", "email", "username"],
        },
      ],
      order: [["enrollmentDate", "DESC"]],
    });

    res.json({
      success: true,
      data: { enrollments },
    });
  } catch (error) {
    console.error("Get course enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course enrollments",
    });
  }
};

// @desc    Get instructor courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (instructor)
export const getInstructorCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      semester,
      year,
      status = "active",
    } = req.query;

    const whereClause = { instructorId: req.user.id };

    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      whereClause.isActive = false;
    }

    if (semester) whereClause.semester = semester;
    if (year) whereClause.year = parseInt(year);

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching instructor courses",
    });
  }
};
