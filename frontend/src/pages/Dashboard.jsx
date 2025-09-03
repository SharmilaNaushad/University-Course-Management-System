import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import SchoolIcon from "@mui/icons-material/School";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import SpeedIcon from "@mui/icons-material/Speed";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === "student") {
        // Fetch student enrollments
        const response = await fetch(`${API_URL}/enrollments/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalEnrollments: data.data.enrollments.length,
            activeEnrollments: data.data.enrollments.filter(
              (e) => e.status === "enrolled"
            ).length,
            completedCourses: data.data.enrollments.filter(
              (e) => e.status === "completed"
            ).length,
          });
        }
      } else if (user?.role === "instructor") {
        // Fetch instructor courses
        const response = await fetch(
          `${API_URL}/courses/instructor/my-courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalCourses: data.data.courses.length,
            totalStudents: data.data.courses.reduce(
              (sum, course) => sum + course.currentEnrollment,
              0
            ),
            averageEnrollment:
              data.data.courses.length > 0
                ? Math.round(
                    data.data.courses.reduce(
                      (sum, course) => sum + course.currentEnrollment,
                      0
                    ) / data.data.courses.length
                  )
                : 0,
          });
        }
      }
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        sx={{
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: isMobile ? 2 : 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 2 : 4,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.8) 100%)",
            backdropFilter: "blur(10px)",
            mb: 4,
          }}
        >
          <Fade in={true} timeout={1000}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                background:
                  "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome, {user?.firstName} {user?.lastName}!
            </Typography>
          </Fade>

          <Fade in={true} timeout={1200}>
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 3, opacity: 0.8 }}
            >
              {user?.role === "student"
                ? "Student Dashboard"
                : user?.role === "instructor"
                ? "Instructor Dashboard"
                : "Dashboard"}
            </Typography>
          </Fade>

          {error && (
            <Fade in={true} timeout={600}>
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.9 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.9 },
                  },
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}
        </Paper>

        <Grid container spacing={isMobile ? 2 : 3}>
          {user?.role === "student" && stats && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 30px rgba(33,150,243,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <SchoolIcon
                          sx={{
                            fontSize: 40,
                            color: "#2196F3",
                            mr: 2,
                            p: 1,
                            borderRadius: "50%",
                            background: "rgba(33,150,243,0.1)",
                          }}
                        />
                        <Typography color="textSecondary" variant="h6">
                          Total Enrollments
                        </Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "bold",
                          animation: "countUp 2s ease-out forwards",
                          "@keyframes countUp": {
                            "0%": { opacity: 0, transform: "translateY(20px)" },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        {stats.totalEnrollments}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 30px rgba(76,175,80,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <LibraryBooksIcon
                          sx={{
                            fontSize: 40,
                            color: "#4CAF50",
                            mr: 2,
                            p: 1,
                            borderRadius: "50%",
                            background: "rgba(76,175,80,0.1)",
                          }}
                        />
                        <Typography color="textSecondary" variant="h6">
                          Active Courses
                        </Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "bold",
                          animation: "countUp 2s ease-out forwards",
                          "@keyframes countUp": {
                            "0%": { opacity: 0, transform: "translateY(20px)" },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        {stats.activeEnrollments}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: "300ms" }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 30px rgba(156,39,176,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 40,
                            color: "#9C27B0",
                            mr: 2,
                            p: 1,
                            borderRadius: "50%",
                            background: "rgba(156,39,176,0.1)",
                          }}
                        />
                        <Typography color="textSecondary" variant="h6">
                          Completed Courses
                        </Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "bold",
                          animation: "countUp 2s ease-out forwards",
                          "@keyframes countUp": {
                            "0%": { opacity: 0, transform: "translateY(20px)" },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        {stats.completedCourses}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </>
          )}

          {user?.role === "instructor" && stats && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 30px rgba(233,30,99,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <LibraryBooksIcon
                          sx={{
                            fontSize: 40,
                            color: "#E91E63",
                            mr: 2,
                            p: 1,
                            borderRadius: "50%",
                            background: "rgba(233,30,99,0.1)",
                          }}
                        />
                        <Typography color="textSecondary" variant="h6">
                          Total Courses
                        </Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "bold",
                          animation: "countUp 2s ease-out forwards",
                          "@keyframes countUp": {
                            "0%": { opacity: 0, transform: "translateY(20px)" },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        {stats.totalCourses}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 30px rgba(0,150,136,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <PeopleIcon
                          sx={{
                            fontSize: 40,
                            color: "#009688",
                            mr: 2,
                            p: 1,
                            borderRadius: "50%",
                            background: "rgba(0,150,136,0.1)",
                          }}
                        />
                        <Typography color="textSecondary" variant="h6">
                          Total Students
                        </Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "bold",
                          animation: "countUp 2s ease-out forwards",
                          "@keyframes countUp": {
                            "0%": { opacity: 0, transform: "translateY(20px)" },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        {stats.totalStudents}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: "300ms" }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 30px rgba(255,152,0,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <BarChartIcon
                          sx={{
                            fontSize: 40,
                            color: "#FF9800",
                            mr: 2,
                            p: 1,
                            borderRadius: "50%",
                            background: "rgba(255,152,0,0.1)",
                          }}
                        />
                        <Typography color="textSecondary" variant="h6">
                          Avg. Enrollment
                        </Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "bold",
                          animation: "countUp 2s ease-out forwards",
                          "@keyframes countUp": {
                            "0%": { opacity: 0, transform: "translateY(20px)" },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        {stats.averageEnrollment}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Fade in={true} timeout={1200} style={{ transitionDelay: "400ms" }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  background:
                    "linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)",
                  mt: 2,
                }}
              >
                <CardContent sx={{ p: isMobile ? 3 : 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <RocketLaunchIcon
                      sx={{
                        fontSize: 40,
                        color: "white",
                        mr: 2,
                        p: 1,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                      }}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      color="white"
                      fontWeight="bold"
                    >
                      Quick Actions
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                    {user?.role === "student"
                      ? "Browse available courses and manage your enrollments from the navigation menu."
                      : user?.role === "instructor"
                      ? "Create new courses and manage your existing courses from the navigation menu."
                      : "Use the navigation menu to access different features of the system."}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default Dashboard;
