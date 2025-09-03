import { Op } from "sequelize";
import { User, Course, Enrollment } from "../models/index.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "title", "code"],
          required: false,
        },
      ],
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this profile
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Can only view own profile.",
      });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "title", "code", "semester", "year"],
        },
        {
          model: Enrollment,
          as: "enrollments",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title", "code", "credits"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can update this profile
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Can only update own profile.",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only admin can update role and isActive
    const allowedFields = ["firstName", "lastName", "username", "profileImage"];
    if (req.user.role === "admin") {
      allowedFields.push("role", "isActive");
    }

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await user.update(updateData);

    // Fetch updated user without password
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has active enrollments or courses
    const activeEnrollments = await Enrollment.count({
      where: { studentId: id, status: "enrolled" },
    });

    const activeCourses = await Course.count({
      where: { instructorId: id, isActive: true },
    });

    if (activeEnrollments > 0 || activeCourses > 0) {
      // Soft delete - deactivate instead of removing
      await user.update({ isActive: false });
      res.json({
        success: true,
        message: "User account deactivated successfully",
      });
    } else {
      // Hard delete if no active relationships
      await user.destroy();
      res.json({
        success: true,
        message: "User deleted successfully",
      });
    }
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (admin)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalStudents = await User.count({ where: { role: "student" } });
    const totalInstructors = await User.count({
      where: { role: "instructor" },
    });
    const totalAdmins = await User.count({ where: { role: "admin" } });

    // Get user registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentUsers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: ["createdAt", "role"],
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalStudents,
          totalInstructors,
          totalAdmins,
        },
        recentRegistrations: recentUsers,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user statistics",
    });
  }
};
