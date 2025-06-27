import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/calendar" />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 