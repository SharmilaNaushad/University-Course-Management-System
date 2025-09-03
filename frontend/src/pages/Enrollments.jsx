import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
} from "@mui/material";
import {
  School,
  Person,
  CalendarToday,
  LocationOn,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  MenuBook,
  Assignment,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Enrollments = () => {
  const { user, token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    enrollmentId: null,
  });
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${API_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.data.enrollments);
      } else {
        setError("Failed to load enrollments");
      }
    } catch (error) {
      setError("Network error occurred");
      console.error("Fetch enrollments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    try {
      const response = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEnrollments(
          enrollments.filter((enrollment) => enrollment.id !== enrollmentId)
        );
        setConfirmDialog({ open: false, enrollmentId: null });
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to unenroll from course");
      }
    } catch (error) {
      setError("Network error occurred");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "info";
      case "dropped":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckCircle />;
      case "pending":
        return <HourglassEmpty />;
      case "completed":
        return <School />;
      case "dropped":
        return <Cancel />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get random pastel color for course avatars
  const getRandomPastelColor = (courseCode) => {
    const hash = courseCode
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress color="primary" size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 6 }}>
      <Box mb={4} display="flex" alignItems="center">
        <MenuBook sx={{ fontSize: 38, mr: 2, color: "primary.main" }} />
        <Typography
          variant="h4"
          component="h1"
          fontWeight="600"
          color="primary.main"
        >
          My Enrollments
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          {error}
        </Alert>
      )}

      {user?.role === "instructor" && (
        <Box mb={4}>
          <Box mb={2} display="flex" alignItems="center">
            <Assignment
              sx={{ fontSize: 28, mr: 1.5, color: "secondary.main" }}
            />
            <Typography
              variant="h5"
              fontWeight="500"
              color="secondary.main"
            >
              Students in My Courses
            </Typography>
          </Box>
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "primary.light" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Enrolled Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow
                      key={enrollment.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: "secondary.light",
                              width: 36,
                              height: 36,
                              mr: 1.5,
                            }}
                          >
                            {enrollment.student?.firstName?.[0]}
                            {enrollment.student?.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {enrollment.student?.firstName}{" "}
                              {enrollment.student?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {enrollment.student?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {enrollment.course?.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {enrollment.course?.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(enrollment.status)}
                          label={enrollment.status}
                          color={getStatusColor(enrollment.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(enrollment.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          sx={{
                            borderRadius: 2,
                            boxShadow: 2,
                            "&:hover": {
                              boxShadow: 4,
                            },
                          }}
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              enrollmentId: enrollment.id,
                            })
                          }
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {user?.role === "student" && (
        <Grid container spacing={3}>
          {enrollments.map((enrollment) => (
            <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 8,
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: getRandomPastelColor(
                      enrollment.course?.code || "CS101"
                    ),
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        width: 45,
                        height: 45,
                        mr: 1.5,
                      }}
                    >
                      {enrollment.course?.code?.substring(0, 2)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {enrollment.course?.code}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(enrollment.status)}
                        label={enrollment.status}
                        color={getStatusColor(enrollment.status)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    fontWeight="600"
                    gutterBottom
                    sx={{
                      mb: 1,
                      height: 50,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {enrollment.course?.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    sx={{
                      mb: 2,
                      height: 60,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {enrollment.course?.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip
                      icon={<School />}
                      label={`${enrollment.course?.credits} Credits`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${enrollment.course?.semester} ${enrollment.course?.year}`}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" alignItems="center" mb={1}>
                    <Person fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="body2" fontWeight={500}>
                      {enrollment.course?.instructor?.firstName}{" "}
                      {enrollment.course?.instructor?.lastName}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarToday
                      fontSize="small"
                      sx={{ mr: 1, color: "primary.main" }}
                    />
                    <Typography variant="body2">
                      Enrolled: {formatDate(enrollment.createdAt)}
                    </Typography>
                  </Box>

                  {enrollment.course?.location && (
                    <Box display="flex" alignItems="center">
                      <LocationOn
                        fontSize="small"
                        sx={{ mr: 1, color: "primary.main" }}
                      />
                      <Typography variant="body2">
                        {enrollment.course.location}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                    onClick={() =>
                      setExpandedCard(
                        expandedCard === enrollment.id ? null : enrollment.id
                      )
                    }
                    endIcon={
                      expandedCard === enrollment.id ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )
                    }
                  >
                    Details
                  </Button>
                  {enrollment.status === "active" && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      sx={{ ml: "auto", borderRadius: 2 }}
                      onClick={() =>
                        setConfirmDialog({
                          open: true,
                          enrollmentId: enrollment.id,
                        })
                      }
                    >
                      Unenroll
                    </Button>
                  )}
                </CardActions>

                <Collapse
                  in={expandedCard === enrollment.id}
                  timeout="auto"
                  unmountOnExit
                >
                  <CardContent
                    sx={{
                      pt: 0,
                      bgcolor: "action.hover",
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" fontWeight={500}>
                          <strong>Department:</strong>
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {enrollment.course?.department}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="body2" fontWeight={500}>
                          <strong>Max Students:</strong>
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {enrollment.course?.maxStudents}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" fontWeight={500}>
                          <strong>Current Enrollment:</strong>
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {enrollment.course?.currentEnrollment} students
                        </Typography>
                      </Grid>

                      {enrollment.course?.startDate && (
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight={500}>
                            <strong>Start Date:</strong>
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {formatDate(enrollment.course.startDate)}
                          </Typography>
                        </Grid>
                      )}

                      {enrollment.course?.endDate && (
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight={500}>
                            <strong>End Date:</strong>
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {formatDate(enrollment.course.endDate)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {enrollments.length === 0 && !loading && (
        <Paper
          elevation={2}
          sx={{
            textAlign: "center",
            py: 6,
            px: 4,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px dashed",
            borderColor: "divider",
            mt: 4,
          }}
        >
          <School sx={{ fontSize: 80, color: "primary.light", mb: 2 }} />
          <Typography
            variant="h5"
            color="text.primary"
            gutterBottom
            fontWeight={500}
          >
            {user?.role === "student"
              ? "No enrollments found"
              : "No students enrolled in your courses"}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 500, mx: "auto" }}
          >
            {user?.role === "student"
              ? "Start by enrolling in courses from the Courses page"
              : "Students will appear here when they enroll in your courses"}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, borderRadius: 2, px: 3 }}
            href="/courses"
          >
            {user?.role === "student" ? "Browse Courses" : "View My Courses"}
          </Button>
        </Paper>
      )}

      {/* Confirm Unenroll Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, enrollmentId: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "error.light",
            color: "error.dark",
            py: 2,
          }}
        >
          {user?.role === "student" ? "Confirm Unenrollment" : "Remove Student"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            {user?.role === "student"
              ? "Are you sure you want to unenroll from this course? This action cannot be undone."
              : "Are you sure you want to remove this student from the course? This action cannot be undone."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() =>
              setConfirmDialog({ open: false, enrollmentId: null })
            }
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUnenroll(confirmDialog.enrollmentId)}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            {user?.role === "student" ? "Unenroll" : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Enrollments;
