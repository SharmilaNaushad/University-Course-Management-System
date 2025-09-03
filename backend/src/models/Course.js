import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 10],
        notEmpty: true,
        is: /^[A-Z]{2,4}[0-9]{3,4}$/,
      },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100],
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6,
      },
      defaultValue: 3,
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
      },
    },
    semester: {
      type: DataTypes.ENUM("Spring", "Summer", "Fall", "Winter"),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2020,
        max: 2030,
      },
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      field: "max_students",
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 1,
        max: 200,
      },
    },
    currentEnrollment: {
      type: DataTypes.INTEGER,
      field: "current_enrollment",
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    instructorId: {
      type: DataTypes.INTEGER,
      field: "instructor_id",
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    schedule: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: "is_active",
      allowNull: false,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      field: "start_date",
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      field: "end_date",
      allowNull: false,
    },
  },
  {
    tableName: "courses",
    validate: {
      endDateAfterStartDate() {
        if (this.endDate <= this.startDate) {
          throw new Error("End date must be after start date");
        }
      },
      enrollmentNotExceedMax() {
        if (this.currentEnrollment > this.maxStudents) {
          throw new Error("Current enrollment cannot exceed maximum students");
        }
      },
    },
    hooks: {
      beforeUpdate: (course) => {
        if (course.currentEnrollment > course.maxStudents) {
          throw new Error("Current enrollment cannot exceed maximum students");
        }
      },
    },
  }
);

export default Course;
