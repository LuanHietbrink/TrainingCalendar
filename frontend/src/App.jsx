import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import ExercisesPage from './pages/ExercisesPage';
import SessionTypesPage from './pages/SessionTypesPage';
import { AuthProvider, useAuth } from './auth/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#388e3c',
      light: '#4caf50',
      dark: '#2e7d32',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#4caf50',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#424242',
      disabled: '#9e9e9e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: '#1a1a1a',
      fontWeight: 500,
    },
    h2: {
      color: '#1a1a1a',
      fontWeight: 500,
    },
    h3: {
      color: '#1a1a1a',
      fontWeight: 500,
    },
    h4: {
      color: '#1a1a1a',
      fontWeight: 500,
    },
    h5: {
      color: '#1a1a1a',
      fontWeight: 500,
    },
    h6: {
      color: '#1a1a1a',
      fontWeight: 500,
    },
    body1: {
      color: '#424242',
    },
    body2: {
      color: '#424242',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
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
          <Route path="/session-types" element={<SessionTypesPage />} />
          <Route path="*" element={<Navigate to="/calendar" />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 