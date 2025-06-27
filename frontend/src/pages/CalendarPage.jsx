import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, MenuItem, List, ListItem, ListItemText, Divider, CircularProgress, Select, InputLabel, FormControl, Chip, Stack, Tooltip, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const sessionTypes = [
  { value: 'track', label: 'Track Work' },
  { value: 'gym', label: 'Gym' },
  { value: 'other', label: 'Other' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function CalendarPage() {
  const { authFetch, logout, user } = useAuth();
  const navigate = useNavigate();
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(null); // 'YYYY-MM-DD' or null
  const [sessions, setSessions] = useState({}); // { 'YYYY-MM-DD': [session, ...] }
  const [newSession, setNewSession] = useState({ type: '', exercises: [] });
  const [exercise, setExercise] = useState({ name: '', sets: '', reps: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [hoveredDay, setHoveredDay] = useState(null); // 'YYYY-MM-DD' or null
  const [showAddSession, setShowAddSession] = useState(false); // for modal add form
  const [editSessionIdx, setEditSessionIdx] = useState(null); // index of session being edited
  const [editSession, setEditSession] = useState({ type: '', exercises: [] });
  const [editExercise, setEditExercise] = useState({ name: '', sets: '', reps: '' });
  const [editSaving, setEditSaving] = useState(false);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month); // 0 (Sun) - 6 (Sat)

  // Load all sessions for the user on mount
  useEffect(() => {
    setLoading(true);
    authFetch('http://localhost:5000/api/calendar')
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authFetch]);

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(dateStr);
    setShowAddSession(false);
    setNewSession({ type: '', exercises: [] });
    setExercise({ name: '', sets: '', reps: '' });
  };

  const handleAddSession = async () => {
    setSaving(true);
    try {
      await authFetch(`http://localhost:5000/api/calendar/${selectedDay}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      // Refresh sessions
      const res = await authFetch('http://localhost:5000/api/calendar');
      const data = await res.json();
      setSessions(data);
      setNewSession({ type: '', exercises: [] });
      setShowAddSession(false);
    } catch (err) {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleAddExercise = () => {
    setNewSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise],
    }));
    setExercise({ name: '', sets: '', reps: '' });
  };

  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleYearChange = (e) => setYear(Number(e.target.value));

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  // Generate calendar grid: array of weeks, each week is array of days (or null for empty)
  const weeks = [];
  let week = Array(firstDayOfWeek).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  }

  // Generate year options (e.g., 10 years back and forward)
  const yearOptions = [];
  for (let y = now.getFullYear() - 10; y <= now.getFullYear() + 10; y++) {
    yearOptions.push(y);
  }

  // Helper to get session type label
  const getSessionTypeLabel = (type) => {
    const found = sessionTypes.find(s => s.value === type);
    return found ? found.label : type;
  };

  // Modal content for selected day
  const selectedDaySessions = selectedDay ? (sessions[selectedDay] || []) : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Edit session handlers
  const handleEditSessionClick = (idx) => {
    setEditSessionIdx(idx);
    setEditSession({ ...selectedDaySessions[idx] });
    setEditExercise({ name: '', sets: '', reps: '' });
  };

  const handleEditSessionSave = async () => {
    setEditSaving(true);
    try {
      await authFetch(`http://localhost:5000/api/calendar/${selectedDay}/${editSessionIdx}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSession),
      });
      // Refresh sessions
      const res = await authFetch('http://localhost:5000/api/calendar');
      const data = await res.json();
      setSessions(data);
      setEditSessionIdx(null);
    } catch (err) {
      // handle error
    } finally {
      setEditSaving(false);
    }
  };

  const handleEditAddExercise = () => {
    setEditSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, editExercise],
    }));
    setEditExercise({ name: '', sets: '', reps: '' });
  };

  const handleDeleteSession = async (idx) => {
    try {
      await authFetch(`http://localhost:5000/api/calendar/${selectedDay}/${idx}`, {
        method: 'DELETE',
      });
      // Refresh sessions
      const res = await authFetch('http://localhost:5000/api/calendar');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      // handle error
    }
  };

  return (
    <Box sx={{ p: 2, background: '#f4f6f8', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Training Calendar
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ ml: 2 }}
        >
          Log out
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <IconButton onClick={handlePrevMonth} size="small"><ArrowBackIosNewIcon /></IconButton>
        <FormControl size="small">
          <InputLabel id="month-label">Month</InputLabel>
          <Select
            labelId="month-label"
            value={month}
            label="Month"
            onChange={handleMonthChange}
            sx={{ minWidth: 120 }}
          >
            {months.map((m, idx) => (
              <MenuItem key={m} value={idx}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            value={year}
            label="Year"
            onChange={handleYearChange}
            sx={{ minWidth: 100 }}
          >
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={handleNextMonth} size="small"><ArrowForwardIosIcon /></IconButton>
      </Box>
      <Box sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        background: '#fff',
        boxShadow: 1,
        p: 2,
        maxWidth: 1100,
        mx: 'auto',
      }}>
        <Grid container spacing={0} sx={{ mb: 1 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
            <Grid item xs={12/7} key={wd}>
              <Box sx={{
                background: '#f3f6fb',
                borderBottom: '1px solid #e0e0e0',
                py: 1,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: 1,
              }}>{wd}</Box>
            </Grid>
          ))}
        </Grid>
        {weeks.map((week, i) => (
          <Grid container spacing={0} key={i}>
            {week.map((day, j) => {
              if (!day) {
                return <Grid item xs={12/7} key={j}><Box sx={{ minHeight: 100, borderRight: j < 6 ? '1px solid #e0e0e0' : 'none', borderBottom: '1px solid #e0e0e0', background: '#fafbfc' }} /></Grid>;
              }
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const daySessions = sessions[dateStr] || [];
              return (
                <Grid item xs={12/7} key={j}>
                  <Box
                    sx={{
                      minHeight: 100,
                      borderRight: j < 6 ? '1px solid #e0e0e0' : 'none',
                      borderBottom: '1px solid #e0e0e0',
                      position: 'relative',
                      background: dateStr === todayISO() ? 'rgba(56,142,60,0.08)' : '#fff',
                      transition: 'background 0.2s',
                      '&:hover': {
                        background: '#f1f8e9',
                        boxShadow: 2,
                      },
                      px: 1,
                      pt: 1,
                      pb: 0.5,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoveredDay(dateStr)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => handleDayClick(day)}
                  >
                    <Box sx={{ position: 'absolute', top: 6, right: 8, fontSize: 13, color: '#888' }}>{day}</Box>
                    <Stack spacing={0.5} sx={{ mt: 3, mb: 1 }}>
                      {daySessions.map((session, idx) => (
                        <Chip
                          key={idx}
                          size="small"
                          label={getSessionTypeLabel(session.type)}
                          color={session.type === 'track' ? 'success' : session.type === 'gym' ? 'primary' : 'default'}
                          sx={{ width: '100%', justifyContent: 'flex-start', fontWeight: 500 }}
                        />
                      ))}
                    </Stack>
                    {hoveredDay === dateStr && (
                      <Tooltip title="Add Session">
                        <Fab
                          color="primary"
                          size="small"
                          sx={{ position: 'absolute', bottom: 8, right: 8, minHeight: 32, minWidth: 32, zIndex: 1, boxShadow: 1 }}
                          onClick={e => { e.stopPropagation(); setSelectedDay(dateStr); setShowAddSession(true); }}
                        >
                          <AddIcon fontSize="small" />
                        </Fab>
                      </Tooltip>
                    )}
                    {daySessions.length > 0 && (
                      <Typography variant="caption" color="secondary" sx={{ position: 'absolute', bottom: 8, left: 8 }}>
                        {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
      <Dialog open={!!selectedDay} onClose={() => { setSelectedDay(null); setShowAddSession(false); setEditSessionIdx(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDay} — Sessions
          <IconButton
            aria-label="close"
            onClick={() => { setSelectedDay(null); setShowAddSession(false); setEditSessionIdx(null); }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDaySessions.length === 0 && !showAddSession && editSessionIdx === null && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>No sessions for this day.</Typography>
          )}
          {selectedDaySessions.length > 0 && !showAddSession && editSessionIdx === null && (
            <List sx={{ mb: 2 }}>
              {selectedDaySessions.map((session, idx) => (
                <Paper key={idx} sx={{ mb: 2, p: 2, background: '#f9fbe7', position: 'relative' }} elevation={0}>
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleEditSessionClick(idx)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDeleteSession(idx)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {getSessionTypeLabel(session.type)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                  </Typography>
                  <List dense>
                    {session.exercises.map((ex, exIdx) => (
                      <ListItem key={exIdx} sx={{ pl: 0 }}>
                        <ListItemText
                          primary={
                            <span>
                              <b>{ex.name}</b> — {ex.sets} sets x {ex.reps} reps
                            </span>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
            </List>
          )}
          {showAddSession && editSessionIdx === null && (
            <Box>
              <TextField
                select
                label="Session Type"
                value={newSession.type}
                onChange={e => setNewSession(s => ({ ...s, type: e.target.value }))}
                fullWidth
                margin="normal"
              >
                {sessionTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Exercises</Typography>
              <List>
                {newSession.exercises.map((ex, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${ex.name} — ${ex.sets} sets x ${ex.reps} reps`}
                    />
                  </ListItem>
                ))}
              </List>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={4}>
                  <TextField
                    label="Exercise"
                    value={exercise.name}
                    onChange={e => setExercise(ex => ({ ...ex, name: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Sets"
                    type="number"
                    value={exercise.sets}
                    onChange={e => setExercise(ex => ({ ...ex, sets: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Reps"
                    type="number"
                    value={exercise.reps}
                    onChange={e => setExercise(ex => ({ ...ex, reps: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="primary" onClick={handleAddExercise}>
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          )}
          {editSessionIdx !== null && (
            <Box>
              <TextField
                select
                label="Session Type"
                value={editSession.type}
                onChange={e => setEditSession(s => ({ ...s, type: e.target.value }))}
                fullWidth
                margin="normal"
              >
                {sessionTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Exercises</Typography>
              <List>
                {editSession.exercises.map((ex, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${ex.name} — ${ex.sets} sets x ${ex.reps} reps`}
                    />
                  </ListItem>
                ))}
              </List>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={4}>
                  <TextField
                    label="Exercise"
                    value={editExercise.name}
                    onChange={e => setEditExercise(ex => ({ ...ex, name: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Sets"
                    type="number"
                    value={editExercise.sets}
                    onChange={e => setEditExercise(ex => ({ ...ex, sets: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Reps"
                    type="number"
                    value={editExercise.reps}
                    onChange={e => setEditExercise(ex => ({ ...ex, reps: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="primary" onClick={handleEditAddExercise}>
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!showAddSession && editSessionIdx === null && (
            <Button onClick={() => setShowAddSession(true)} variant="contained" color="primary">
              Add Session
            </Button>
          )}
          {showAddSession && editSessionIdx === null && (
            <Button onClick={handleAddSession} variant="contained" color="primary" disabled={saving}>
              {saving ? <CircularProgress size={24} /> : 'Save Session'}
            </Button>
          )}
          {editSessionIdx !== null && (
            <Button onClick={handleEditSessionSave} variant="contained" color="primary" disabled={editSaving}>
              {editSaving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          )}
          <Button onClick={() => { setSelectedDay(null); setShowAddSession(false); setEditSessionIdx(null); }} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 