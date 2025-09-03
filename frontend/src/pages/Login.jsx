import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Fade,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    // <Container component="main" maxWidth={false} sx={{ px: isMobile ? 2 : 3 }}>
    <Container component="main" maxWidth= "sm" sx={{ px: isMobile ? 2 : 3 }}>
      <Fade in={true} timeout={800}>
        <Box
          sx={{
            marginTop: isMobile ? 4 : 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              padding: isMobile ? 3 : 5,
              width: "100%",
              borderRadius: 2,
              background: "linear-gradient(to bottom right, #ffffff, #f5f5f5)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            <Typography
              component="h1"
              variant={isMobile ? "h5" : "h4"}
              align="center"
              fontWeight="bold"
              sx={{
                mb: 3,
                background: "linear-gradient(45deg, #1976d2, #5e35b1)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back
            </Typography>

            {error && (
              <Fade in={!!error}>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 1,
                    animation: "pulse 1.5s infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 0.8 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.8 },
                    },
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                mt: 1,
                "& .MuiTextField-root": { mb: 3 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                  },
                },
              }}
            >
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)",
                  background: "linear-gradient(45deg, #1976d2, #5e35b1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 15px rgba(25, 118, 210, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
                disabled={loading}
                startIcon={!loading && <LoginIcon />}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box textAlign="center">
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      textDecoration: "none",
                      color: "#1976d2",
                      fontWeight: "bold",
                      transition: "color 0.3s ease",
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    color: "text.secondary",
                    opacity: 0.8,
                    fontSize: "0.875rem",
                  }}
                >
                  <Link
                    to="/forgot-password"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      transition: "color 0.3s ease",
                      "&:hover": { color: "#1976d2" },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default Login;
