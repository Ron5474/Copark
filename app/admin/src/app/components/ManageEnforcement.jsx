import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, IconButton, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HomeIcon from '@mui/icons-material/Home';
import RestoreIcon from '@mui/icons-material/Restore'; // Add this import
import { useRouter } from 'next/navigation';
import { getEnforcers, addEnforcer, suspendUser } from '../../enforcement/actions';

export default function ManageEnforcement({ onNavigate }) {
  const router = useRouter();
  const [enforcers, setEnforcers] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newEnforcer, setNewEnforcer] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchEnforcers();
  }, []);

  const fetchEnforcers = async () => {
    const data = await getEnforcers();
    setEnforcers(data);
  };

  const handlesuspendUser = async (enforcerId) => {
    await suspendUser(enforcerId);
    fetchEnforcers(); // Refresh the list after suspension
  };

  const handleAddEnforcer = async () => {
    await addEnforcer(newEnforcer);
    setOpenAddDialog(false);
    setNewEnforcer({
      name: '',
      email: ''
    });
    fetchEnforcers();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <img src="/admin_logo.png" alt="CoPark Admin" style={{ height: 60, marginRight: 16 }} />
        <Button
          variant="contained"
          startIcon={<GroupIcon />}
          sx={{ mr: 2, bgcolor: '#bdbdbd', color: 'black' }}
        >
          Manage Enforcer
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{ bgcolor: '#bdbdbd', color: 'black' }}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Enforcer
        </Button>
      </Box>

      <Paper sx={{ p: 2, background: '#e0e0e0', maxWidth: 900, mx: 'auto' }}>
        {enforcers.map((enforcer) => (
          <Box
            key={enforcer.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'white',
              p: 2,
              mb: 2,
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography>{enforcer.name}</Typography>
              <Typography
                variant="caption"
                color={enforcer.accountStatus === 'suspended' ? 'error' : 'success.main'}
              >
                {enforcer.accountStatus}
              </Typography>
            </Box>
            <Box>
              <IconButton
                onClick={() => handlesuspendUser(enforcer.id)}
                color={enforcer.accountStatus === 'suspended' ? 'primary' : 'default'}
              >
                {enforcer.accountStatus === 'suspended' ? (
                  <RestoreIcon fontSize="large" />
                ) : (
                  <GavelIcon fontSize="large" />
                )}
              </IconButton>
              <IconButton>
                <PersonOffIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        ))}
        <Box sx={{ height: 120, background: '#d3d3d3', borderRadius: 1 }} />
      </Paper>

      {/* Add Enforcer Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Enforcer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newEnforcer.name}
            onChange={(e) => setNewEnforcer({ ...newEnforcer, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={newEnforcer.email}
            onChange={(e) => setNewEnforcer({ ...newEnforcer, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEnforcer}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Home Icon */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24 }}>
        <IconButton
          color="primary"
          size="large"
          onClick={() => onNavigate('home')}
          aria-label="Go to Home"
        >
          <HomeIcon sx={{ fontSize: 48 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
