import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SessionTypesPage() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [sessionTypes, setSessionTypes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [current, setCurrent] = useState({ _id: null, value: '', label: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchSessionTypes = async () => {
    const res = await authFetch('http://localhost:5000/api/session_types');
    const data = await res.json();
    setSessionTypes(data);
  };

  useEffect(() => { fetchSessionTypes(); }, []);

  const handleOpenDialog = (sessionType = null) => {
    if (sessionType) {
      setCurrent(sessionType);
      setIsEdit(true);
    } else {
      setCurrent({ _id: null, value: '', label: '' });
      setIsEdit(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrent({ _id: null, value: '', label: '' });
    setIsEdit(false);
  };

  const handleSave = async () => {
    if (isEdit) {
      await authFetch(`http://localhost:5000/api/session_types/${current._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: current.value, label: current.label }),
      });
    } else {
      await authFetch('http://localhost:5000/api/session_types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: current.value, label: current.label }),
      });
    }
    fetchSessionTypes();
    handleCloseDialog();
  };

  const handleDelete = async () => {
    await authFetch(`http://localhost:5000/api/session_types/${deleteId}`, { method: 'DELETE' });
    setDeleteDialogOpen(false);
    setDeleteId(null);
    fetchSessionTypes();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom>Manage Session Types</Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate('/calendar')}>
          Back to Calendar
        </Button>
      </Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Add Session Type
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Value</TableCell>
              <TableCell>Label</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessionTypes.map((st) => (
              <TableRow key={st._id}>
                <TableCell>{st.value}</TableCell>
                <TableCell>{st.label}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(st)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => { setDeleteId(st._id); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{isEdit ? 'Edit Session Type' : 'Add Session Type'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Value"
            value={current.value}
            onChange={e => setCurrent(c => ({ ...c, value: e.target.value }))}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Label"
            value={current.label}
            onChange={e => setCurrent(c => ({ ...c, label: e.target.value }))}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEdit ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Session Type</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this session type?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 