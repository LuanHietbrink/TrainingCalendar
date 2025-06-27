import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const sessionTypes = [
  { value: 'track', label: 'Track Work' },
  { value: 'gym', label: 'Gym' },
  { value: 'other', label: 'Other' },
];

export default function ExercisesPage() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [current, setCurrent] = useState({ _id: null, name: '', type: sessionTypes[0].value });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchExercises = async () => {
    const res = await authFetch('http://localhost:5000/api/exercises');
    const data = await res.json();
    setExercises(data);
  };

  useEffect(() => { fetchExercises(); }, []);

  const handleOpenDialog = (exercise = null) => {
    if (exercise) {
      setCurrent(exercise);
      setIsEdit(true);
    } else {
      setCurrent({ _id: null, name: '', type: sessionTypes[0].value });
      setIsEdit(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrent({ _id: null, name: '', type: sessionTypes[0].value });
    setIsEdit(false);
  };

  const handleSave = async () => {
    if (isEdit) {
      await authFetch(`http://localhost:5000/api/exercises/${current._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: current.name, type: current.type }),
      });
    } else {
      await authFetch('http://localhost:5000/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: current.name, type: current.type }),
      });
    }
    fetchExercises();
    handleCloseDialog();
  };

  const handleDelete = async () => {
    await authFetch(`http://localhost:5000/api/exercises/${deleteId}`, { method: 'DELETE' });
    setDeleteDialogOpen(false);
    setDeleteId(null);
    fetchExercises();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom>Manage Exercises</Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate('/calendar')}>
          Back to Calendar
        </Button>
      </Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Add Exercise
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercises.map((ex) => (
              <TableRow key={ex._id}>
                <TableCell>{ex.name}</TableCell>
                <TableCell>{sessionTypes.find(t => t.value === ex.type)?.label || ex.type}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(ex)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => { setDeleteId(ex._id); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{isEdit ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={current.name}
            onChange={e => setCurrent(c => ({ ...c, name: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Type"
            value={current.type}
            onChange={e => setCurrent(c => ({ ...c, type: e.target.value }))}
            fullWidth
            margin="normal"
          >
            {sessionTypes.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEdit ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Exercise</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this exercise?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 