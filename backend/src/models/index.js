import { sequelize } from "../config/database.js";
import User from "./User.js";
import Course from "./Course.js";
import Enrollment from "./Enrollment.js";

// Define associations
User.hasMany(Course, {
  foreignKey: "instructorId",
  as: "courses",
});

Course.belongsTo(User, {
  foreignKey: "instructorId",
  as: "instructor",
});

User.hasMany(Enrollment, {
  foreignKey: "studentId",
  as: "enrollments",
});

Course.hasMany(Enrollment, {
  foreignKey: "courseId",
  as: "enrollments",
});

Enrollment.belongsTo(User, {
  foreignKey: "studentId",
  as: "student",
});

Enrollment.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// Many-to-many relationship through Enrollment
User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: "studentId",
  otherKey: "courseId",
  as: "enrolledCourses",
});

Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: "courseId",
  otherKey: "studentId",
  as: "enrolledStudents",
});

export { sequelize, User, Course, Enrollment };
