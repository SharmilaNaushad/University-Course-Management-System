import { body } from "express-validator";

export const validateRegister = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Role must be either student, instructor, or admin"),

  body("department")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),

  body("phone")
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage("Please provide a valid phone number"),

  body("studentId")
    .optional()
    .matches(/^[A-Z0-9]{6,12}$/)
    .withMessage("Student ID must be 6-12 alphanumeric characters"),
];

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

export const validateUpdateProfile = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("department")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),

  body("phone")
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage("Please provide a valid phone number"),
];

export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

export const validateCourse = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Course title must be between 3 and 100 characters"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Course code is required")
    .matches(/^[A-Z]{2,4}[0-9]{3,4}$/)
    .withMessage("Course code must be in format like CS101, MATH2001"),

  body("description")
    .trim()
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Course description must be between 10 and 2000 characters"),

  body("credits")
    .isInt({ min: 1, max: 6 })
    .withMessage("Credits must be between 1 and 6"),

  body("department").trim().notEmpty().withMessage("Department is required"),

  body("semester")
    .isIn(["Fall", "Spring", "Summer", "Winter"])
    .withMessage("Semester must be Fall, Spring, Summer, or Winter"),

  body("year")
    .isInt({ min: 2020, max: 2030 })
    .withMessage("Year must be between 2020 and 2030"),

  body("maxStudents")
    .isInt({ min: 1, max: 200 })
    .withMessage("Maximum students must be between 1 and 200"),

  body("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  body("endDate").isISO8601().withMessage("End date must be a valid ISO date"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),
];

export const validateEnrollment = [
  body("courseId").isInt({ min: 1 }).withMessage("Valid course ID is required"),
];

export const validateGrade = [
  body("letter")
    .optional()
    .isIn([
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
      "F",
      "I",
      "W",
    ])
    .withMessage("Invalid grade letter"),

  body("points")
    .optional()
    .isFloat({ min: 0, max: 4.0 })
    .withMessage("Grade points must be between 0 and 4.0"),

  body("percentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Percentage must be between 0 and 100"),
];
