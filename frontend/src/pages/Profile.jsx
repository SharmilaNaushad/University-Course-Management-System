import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  Person,
  Email,
  School,
  Edit,
  Save,
  Cancel,
  Lock,
  Visibility,
  VisibilityOff,
  CalendarToday,
  Badge,
  Phone,
  LocationOn,
  AccountCircle,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Add refs and state for the tilt effect
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    transition: "transform 0.1s ease-out"
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    bio: user?.bio || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const API_URL = "http://localhost:8000/api";

  // Handle mouse movement for tilt effect
  const handleMouseMove = (e) => {
    if (!cardRef.current || isMobile) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation degrees (-10 to 10 degrees)
    const maxRotation = 5;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxRotation;
    const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * maxRotation;
    
    // Apply transform with slight scale
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: "transform 0.1s ease-out",
      boxShadow: `${rotateY/2}px ${-rotateX/2}px 15px rgba(0,0,0,0.15)`
    });
  };

  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.5s ease-out",
      boxShadow: theme.shadows[3]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.data.user);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error occurred");
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setSuccess("Password changed successfully!");
        setShowPasswordDialog(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await response.json();
        setError(data.message || "Failed to change password");
      }
    } catch (error) {
      setError("Network error occurred");
      console.error("Change password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      bio: user?.bio || "",
    });
    setIsEditing(false);
    setError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || "";
    const last = user?.lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  // Get a consistent color for the avatar based on the user's name
  const getUserColor = () => {
    if (!user?.firstName && !user?.lastName) return "primary.main";
    const nameHash = (user.firstName + user.lastName)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = nameHash % 360;
    return `hsl(${hue}, 75%, 60%)`;
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 8 }}>
      <Box mb={4} display="flex" alignItems="center">
        <AccountCircle sx={{ fontSize: 38, mr: 2, color: "primary.main" }} />
        <Typography
          variant="h4"
          component="h1"
          fontWeight="600"
          color="primary.main"
        >
          My Profile
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

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Card with tilt effect */}
        <Grid item xs={12} md={4}>
          <Card
            ref={cardRef}
            elevation={3}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              height: "100%",
              transform: tiltStyle.transform,
              transition: tiltStyle.transition,
              boxShadow: tiltStyle.boxShadow || theme.shadows[3],
              "&:hover": {
                transform: tiltStyle.transform,
              },
            }}
          >
            <Box
              sx={{
                backgroundColor: getUserColor(),
                height: 80,
                position: "relative",
              }}
            />
            <CardContent
              sx={{
                textAlign: "center",
                pt: 7,
                pb: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 40,
                  position: "absolute",
                  top: 30,
                  left: "50%",
                  transform: "translateX(-50%)",
                  border: "4px solid white",
                  bgcolor: getUserColor(),
                  boxShadow: theme.shadows[4],
                }}
              >
                {getInitials()}
              </Avatar>

              <Typography variant="h5" fontWeight="600" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>

              <Chip
                icon={user?.role === "student" ? <School /> : <Badge />}
                label={user?.role?.toUpperCase()}
                color={user?.role === "student" ? "primary" : "secondary"}
                sx={{ mb: 2, fontWeight: 500, px: 1 }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 1,
                  mb: 2,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                Member since {formatDate(user?.createdAt).split(",")[0]}
              </Box>

              <Divider sx={{ mx: -2, mb: 2 }} />

              <Button
                fullWidth
                variant="contained"
                startIcon={<Lock />}
                onClick={() => setShowPasswordDialog(true)}
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  "&:hover": {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              height: "100%",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box display="flex" alignItems="center">
                <Person
                  sx={{
                    color: "primary.main",
                    mr: 1.5,
                    fontSize: 28,
                  }}
                />
                <Typography
                  variant="h5"
                  fontWeight="500"
                  color="primary.main"
                >
                  Personal Information
                </Typography>
              </Box>

              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    sx={{ mr: 1, borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      "&:hover": {
                        boxShadow: 4,
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" mb={2}>
                <CircularProgress size={30} />
              </Box>
            )}

            <form onSubmit={handleSaveProfile}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: (
                        <CalendarToday color="action" sx={{ mr: 1 }} />
                      ),
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: (
                        <LocationOn color="action" sx={{ mr: 1, mt: 1 }} />
                      ),
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself..."
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
              </Grid>
            </form>

            <Divider sx={{ my: 4 }} />

            <Box mb={2} display="flex" alignItems="center">
              <Badge
                sx={{
                  color: "secondary.main",
                  mr: 1.5,
                  fontSize: 28,
                }}
              />
              <Typography
                variant="h5"
                fontWeight="500"
                color="secondary.main"
              >
                Account Information
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
                borderColor: "divider",
              }}
            >
              <List disablePadding>
                <ListItem
                  sx={{
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="text.secondary">
                        Email Address
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" fontWeight={500}>
                        {user?.email}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem
                  sx={{
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="text.secondary">
                        Role
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        textTransform="capitalize"
                      >
                        {user?.role}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem
                  sx={{
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="text.secondary">
                        Account Created
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(user?.createdAt)}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(user?.updatedAt)}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1,
          },
        }}
      >
        <form onSubmit={handleChangePassword}>
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center">
              <Lock sx={{ color: "primary.main", mr: 1.5 }} />
              <Typography variant="h5" fontWeight={500}>
                Change Password
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Current Password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    sx: { borderRadius: 1.5 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="New Password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  helperText="Password must be at least 6 characters long"
                  InputProps={{
                    sx: { borderRadius: 1.5 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    sx: { borderRadius: 1.5 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  startIcon={showPassword ? <VisibilityOff /> : <Visibility />}
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ borderRadius: 2 }}
                >
                  {showPassword ? "Hide" : "Show"} Passwords
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setShowPasswordDialog(false)}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 3,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Profile;
