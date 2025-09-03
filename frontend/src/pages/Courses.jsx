import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Paper,
  Container,
  Fade,
  Zoom,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  School,
  Person,
  Event,
  LocationOn,
  AccessTime,
  Group,
  CheckCircle,
  Search,
  BookmarkBorder,
  Bookmark,
  FilterList,
  Sort,
  LibraryBooks,
  Timeline,
  ArrowUpward,
  ArrowForward,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Courses = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    description: "",
    credits: 3,
    department: "",
    semester: "Fall",
    year: 2025,
    maxStudents: 30,
    startDate: "",
    endDate: "",
    location: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [animateCards, setAnimateCards] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    // Trigger card animations after data is loaded
    if (!loading && courses.length > 0) {
      setAnimateCards(true);
    }
  }, [loading, courses]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses);
      } else {
        setError("Failed to load courses");
      }
    } catch (error) {
      setError("Network error occurred");
      console.error("Fetch courses error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        // Refresh courses to update enrollment count
        fetchCourses();
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to enroll in course");
      }
    } catch (error) {
      setError("Network error occurred");
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        setOpenCreateDialog(false);
        // Reset form
        setNewCourse({
          title: "",
          code: "",
          description: "",
          credits: 3,
          department: "",
          semester: "Fall",
          year: 2025,
          maxStudents: 30,
          startDate: "",
          endDate: "",
          location: "",
        });
        // Refresh courses
        fetchCourses();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create course");
      }
    } catch (error) {
      setError("Network error occurred");
    }
  };

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({
      ...newCourse,
      [name]: name === "credits" || name === "maxStudents" || name === "year" ? Number(value) : value,
    });
  };

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Department filter
      const matchesDepartment = filterDepartment === "all" || course.department === filterDepartment;
      
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "date") {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (sortBy === "students") {
        return (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0);
      }
      return 0;
    });

  // Get unique departments for filter
  const departments = [...new Set(courses.map(course => course.department))].filter(Boolean);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Generate random gradient for course cards
  const getRandomGradient = (index) => {
    const gradients = [
      "linear-gradient(135deg, #60a5fa20 0%, #3b82f620 100%)",
      "linear-gradient(135deg, #a78bfa20 0%, #8b5cf620 100%)",
      "linear-gradient(135deg, #f59e0b20 0%, #d9770020 100%)",
      "linear-gradient(135deg, #10b98120 0%, #05966920 100%)",
      "linear-gradient(135deg, #f4354620 0%, #e1163c20 100%)",
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "50vh" 
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: "text.secondary" }}>
          Loading courses...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: isMobile ? 2 : 3 }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
              mb: 4 
            }}
          >
            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #1976d2, #5e35b1)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Explore Courses
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
              </Typography>
            </Box>
            
            {user?.role === "instructor" && (
              <Zoom in={true} timeout={800}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => setOpenCreateDialog(true)}
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.25, 
                    px: 2.5,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    background: "linear-gradient(45deg, #1976d2, #5e35b1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(37, 99, 235, 0.25)",
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  Create Course
                </Button>
              </Zoom>
            )}
          </Box>

          {error && (
            <Fade in={!!error} timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.9 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.9 }
                  }
                }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Slide direction="down" in={true} timeout={600}>
            <Paper sx={{ 
              p: isMobile ? 2 : 3, 
              mb: 4, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(to right, #fafafa, #f5f5f5)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'center'
            }}>
              <TextField
                placeholder="Search courses..."
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                    },
                  }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                width: { xs: '100%', md: 'auto' },
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                  <InputLabel id="department-filter-label">Department</InputLabel>
                  <Select
                    labelId="department-filter-label"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    label="Department"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterList fontSize="small" />
                      </InputAdornment>
                    }
                    sx={{ 
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    startAdornment={
                      <InputAdornment position="start">
                        <Sort fontSize="small" />
                      </InputAdornment>
                    }
                    sx={{ 
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="date">Start Date</MenuItem>
                    <MenuItem value="students">Popularity</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Slide>

          {filteredCourses.length === 0 ? (
            <Fade in={true} timeout={800}>
              <Paper 
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 4, 
                  bgcolor: '#f8fafc',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  mt: 4
                }}
              >
                <School sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 3 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>No courses found</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                  {searchQuery 
                    ? "Try adjusting your search or filters to find more courses." 
                    : "There are no courses available at this time."}
                </Typography>
              </Paper>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
                  <Zoom 
                    in={animateCards} 
                    style={{ 
                      transitionDelay: `${index * 50}ms`,
                      transitionDuration: '400ms'
                    }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease-in-out',
                        background: getRandomGradient(index),
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 1, 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.8)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <Typography 
                          variant="overline" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: 'text.secondary',
                            fontSize: '0.7rem'
                          }}
                        >
                          {course.code}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={course.department || "General"} 
                          sx={{ 
                            borderRadius: '9999px', 
                            fontSize: '0.625rem',
                            height: 24,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }} 
                        />
                      </Box>
                      
                      <CardContent sx={{ p: 3, flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            mb: 1.5,
                            minHeight: '2.8rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {course.title}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 2,
                            gap: 1
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: theme.palette.primary.main,
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {course.instructor?.firstName?.charAt(0) || "I"}
                          </Avatar>
                          <Typography 
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: 'text.secondary'
                            }}
                          >
                            {course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : "Instructor TBA"}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minHeight: '4.5rem'
                          }}
                        >
                          {course.description || "No description available"}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            mt: 'auto'
                          }}
                        >
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5
                            }}
                          >
                            <Event 
                              fontSize="small" 
                              sx={{ color: theme.palette.primary.main, opacity: 0.8 }} 
                            />
                            <Typography 
                              variant="caption"
                              sx={{ fontWeight: 500 }}
                            >
                              {formatDate(course.startDate)}
                            </Typography>
                          </Box>
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              bgcolor: 'rgba(255,255,255,0.7)',
                              borderRadius: 10,
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Group 
                              fontSize="small" 
                              sx={{ color: theme.palette.info.main }} 
                            />
                            <Typography 
                              variant="caption"
                              sx={{ fontWeight: 500 }}
                            >
                              {(course.enrolledStudents?.length || 0)}/{course.maxStudents || "∞"}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      
                      <Divider />
                      
                      <CardActions 
                        sx={{ 
                          p: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {user?.role === "student" && (
                          <Button
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={() => handleEnroll(course._id)}
                            disabled={
                              course.enrolledStudents?.some(
                                (enrollment) => enrollment.student === user._id
                              ) ||
                              (course.enrolledStudents?.length || 0) >= course.maxStudents
                            }
                            startIcon={
                              course.enrolledStudents?.some(
                                (enrollment) => enrollment.student === user._id
                              ) ? (
                                <CheckCircle />
                              ) : (
                                <School />
                              )
                            }
                            sx={{ 
                              borderRadius: '8px',
                              py: 1,
                              background: course.enrolledStudents?.some(
                                (enrollment) => enrollment.student === user._id
                              ) 
                                ? 'linear-gradient(45deg, #4CAF50, #388E3C)'
                                : 'linear-gradient(45deg, #1976d2, #5e35b1)',
                              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                              transition: 'all 0.3s ease',
                              '&:hover:not(:disabled)': {
                                boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            {course.enrolledStudents?.some(
                              (enrollment) => enrollment.student === user._id
                            )
                              ? "Enrolled"
                              : (course.enrolledStudents?.length || 0) >= course.maxStudents
                              ? "Class Full"
                              : "Enroll Now"}
                          </Button>
                        )}
                        {user?.role === "instructor" && course.instructor?._id === user._id && (
                          <Button
                            component={Link}
                            to={`/courses/${course._id}`}
                            variant="outlined"
                            fullWidth
                            color="primary"
                            endIcon={<ArrowForward />}
                            sx={{ 
                              borderRadius: '8px',
                              py: 1,
                              borderWidth: '2px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                                transform: 'translateY(-2px)',
                                borderWidth: '2px'
                              }
                            }}
                          >
                            Manage Course
                          </Button>
                        )}
                        {user?.role === "admin" && (
                          <Button
                            component={Link}
                            to={`/courses/${course._id}`}
                            variant="outlined"
                            fullWidth
                            color="primary"
                            endIcon={<ArrowForward />}
                            sx={{ 
                              borderRadius: '8px',
                              py: 1,
                              borderWidth: '2px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                                transform: 'translateY(-2px)',
                                borderWidth: '2px'
                              }
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>

      {/* Create Course Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(to bottom, #ffffff, #f9fafb)'
          }
        }}
        TransitionComponent={Zoom}
        transitionDuration={400}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e2e8f0', 
            pb: 2,
            pt: 3,
            px: 3
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
            Create New Course
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Complete the form below to create a new course
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Fade in={openCreateDialog} timeout={400}>
            <Grid container spacing={2} component="form" onSubmit={handleCreateCourse}>
              <Grid item xs={12} sm={8}>
                <TextField
                  name="title"
                  label="Course Title"
                  fullWidth
                  required
                  value={newCourse.title}
                  onChange={handleCourseInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="code"
                  label="Course Code"
                  fullWidth
                  required
                  value={newCourse.code}
                  onChange={handleCourseInputChange}
                  margin="normal"
                  placeholder="e.g., CS101"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={newCourse.description}
                  onChange={handleCourseInputChange}
                  margin="normal"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="department"
                  label="Department"
                  fullWidth
                  value={newCourse.department}
                  onChange={handleCourseInputChange}
                  margin="normal"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="credits"
                  label="Credits"
                  type="number"
                  fullWidth
                  InputProps={{ 
                    inputProps: { min: 1, max: 6 },
                    sx: { borderRadius: 2 }
                  }}
                  value={newCourse.credits}
                  onChange={handleCourseInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="maxStudents"
                  label="Max Students"
                  type="number"
                  fullWidth
                  InputProps={{ 
                    inputProps: { min: 1 },
                    sx: { borderRadius: 2 }
                  }}
                  value={newCourse.maxStudents}
                  onChange={handleCourseInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="semester-label">Semester</InputLabel>
                  <Select
                    labelId="semester-label"
                    name="semester"
                    value={newCourse.semester}
                    onChange={handleCourseInputChange}
                    label="Semester"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Fall">Fall</MenuItem>
                    <MenuItem value="Spring">Spring</MenuItem>
                    <MenuItem value="Summer">Summer</MenuItem>
                    <MenuItem value="Winter">Winter</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="year"
                  label="Year"
                  type="number"
                  fullWidth
                  InputProps={{ 
                    inputProps: { min: 2023, max: 2030 },
                    sx: { borderRadius: 2 }
                  }}
                  value={newCourse.year}
                  onChange={handleCourseInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  value={newCourse.location}
                  onChange={handleCourseInputChange}
                  margin="normal"
                  placeholder="e.g., Room 101"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newCourse.startDate}
                  onChange={handleCourseInputChange}
                  margin="normal"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="endDate"
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newCourse.endDate}
                  onChange={handleCourseInputChange}
                  margin="normal"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)} 
            color="inherit"
            sx={{ 
              borderRadius: 2,
              px: 3, 
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCourse} 
            variant="contained" 
            color="primary"
            sx={{ 
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              background: "linear-gradient(45deg, #1976d2, #5e35b1)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 18px rgba(37, 99, 235, 0.25)",
                transform: "translateY(-2px)"
              }
            }}
          >
            Create Course
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;
