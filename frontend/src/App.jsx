import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import ExercisesPage from './pages/ExercisesPage';
import { AuthProvider, useAuth } from './auth/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#388e3c',
    },
    secondary: {
      main: '#66bb6a',
    },
    background: {
      default: '#e8f5e9',
      paper: '#ffffff',
    },
  },
});

function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function SessionExpiredDialog() {
  const { sessionExpired, handleSessionExpired } = useAuth();
  return (
    <Dialog open={sessionExpired}>
      <DialogTitle>Session Expired</DialogTitle>
      <DialogContent>
        <Typography>Your session has expired. Please sign in again to continue.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSessionExpired} color="primary" variant="contained">Sign In</Button>
      </DialogActions>
    </Dialog>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SessionExpiredDialog />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
          <Route path="/exercises" element={<PrivateRoute><ExercisesPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/calendar" />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 