import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      field: "student_id",
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    courseId: {
      type: DataTypes.INTEGER,
      field: "course_id",
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("enrolled", "completed", "dropped", "withdrawn"),
      allowNull: false,
      defaultValue: "enrolled",
    },
    grade: {
      type: DataTypes.STRING(2),
      allowNull: true,
      validate: {
        isIn: [
          [
            "A+",
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D+",
            "D",
            "D-",
            "F",
            "I",
            "W",
          ],
        ],
      },
    },
    gradePoints: {
      type: DataTypes.DECIMAL(3, 2),
      field: "grade_points",
      allowNull: true,
      validate: {
        min: 0.0,
        max: 4.0,
      },
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      field: "enrollment_date",
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completionDate: {
      type: DataTypes.DATE,
      field: "completion_date",
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "enrollments",
    indexes: [
      {
        unique: true,
        fields: ["student_id", "course_id"],
      },
      {
        fields: ["student_id"],
      },
      {
        fields: ["course_id"],
      },
      {
        fields: ["status"],
      },
    ],
    hooks: {
      afterCreate: async (enrollment) => {
        // Update course enrollment count
        const Course = sequelize.models.Course;
        await Course.increment("currentEnrollment", {
          where: { id: enrollment.courseId },
        });
      },
      afterUpdate: async (enrollment) => {
        if (enrollment.changed("status")) {
          const Course = sequelize.models.Course;
          const previousStatus = enrollment._previousDataValues.status;
          const currentStatus = enrollment.status;

          // If status changed from enrolled to something else, decrement
          if (previousStatus === "enrolled" && currentStatus !== "enrolled") {
            await Course.decrement("currentEnrollment", {
              where: { id: enrollment.courseId },
            });
          }
          // If status changed to enrolled from something else, increment
          else if (
            previousStatus !== "enrolled" &&
            currentStatus === "enrolled"
          ) {
            await Course.increment("currentEnrollment", {
              where: { id: enrollment.courseId },
            });
          }
        }
      },
      beforeDestroy: async (enrollment) => {
        // Decrement course enrollment count if student was enrolled
        if (enrollment.status === "enrolled") {
          const Course = sequelize.models.Course;
          await Course.decrement("currentEnrollment", {
            where: { id: enrollment.courseId },
          });
        }
      },
    },
  }
);

export default Enrollment;
