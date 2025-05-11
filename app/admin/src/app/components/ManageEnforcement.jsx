import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, useTheme } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HomeIcon from '@mui/icons-material/Home';
import RestoreIcon from '@mui/icons-material/Restore';
import { getEnforcers, addEnforcer, suspendUser, reinstateUser, deleteUser } from '../../enforcement/actions';

export default function ManageEnforcement({ onNavigate }) {
  const theme = useTheme();
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

  const handleUserStatus = async (enforcerId, currentStatus) => {
    if (currentStatus === 'suspended') {
      await reinstateUser(enforcerId);
    } else {
      await suspendUser(enforcerId);
    }
    fetchEnforcers(); // Refresh the list after status change
  };

  const handleDeleteUser = async (enforcerId) => {
    await deleteUser(enforcerId);
    fetchEnforcers(); // Refresh the list after deletion
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
    <Box sx={{ 
      p: 4,
      bgcolor: '#ffffff'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        pb: 2
      }}>
        <img src="/assets/admin_logo.png" alt="CoPark Admin" style={{ height: 60, marginRight: 16 }} />
        <Typography 
          variant="h4" 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: "32px"
          }}
        >
          Manage Enforcers
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          Add Enforcer
        </Button>
      </Box>

      <Box 
        data-testid="enforcers-list"
        sx={{ 
          p: 3, 
          background: '#ffffff', 
          maxWidth: 900, 
          mx: 'auto',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: '15px'
        }}
      >
        {<p>Enforcer Count: {enforcers.length}</p>}
        {enforcers.map((enforcer) => (
          <Box
            key={enforcer.id}
            data-testid="enforcer-item"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#C6DDF4',
              border: `1px solid ${theme.palette.primary.light}20`,
              p: 3,
              mb: 2,
              borderRadius: '15px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Box>
              <Typography sx={{ 
                fontSize: "20px",
                fontWeight: 500,
                color: theme.palette.primary.dark
              }}>
                {enforcer.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: enforcer.accountStatus === 'suspended' ? theme.palette.secondary.main : theme.palette.primary.main,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {enforcer.accountStatus}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => handleUserStatus(enforcer.id, enforcer.accountStatus)}
                sx={{
                  // Same light background for both states
                  bgcolor: `${theme.palette.primary.main} + 20`,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                    color: '#ffffff'
                  }
                }}
                aria-label={enforcer.accountStatus === 'suspended' ? 'Restore user' : 'Suspend user'}
              >
                {enforcer.accountStatus === 'suspended' ? (
                  <RestoreIcon />
                ) : (
                  <GavelIcon />
                )}
              </IconButton>
              <IconButton
                onClick={() => handleDeleteUser(enforcer.id)}
                sx={{
                  bgcolor: theme.palette.secondary.main + '20',
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: theme.palette.secondary.main,
                    color: '#ffffff'
                  }
                }}
                aria-label="Delete user"
                disabled={enforcer.accountStatus === 'deleted'}
              >
                <PersonOffIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Add Enforcer Dialog - Updated styles */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '15px',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          color: theme.palette.primary.main,
          fontWeight: 700 
        }}>
          Add New Enforcer
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newEnforcer.name}
            onChange={(e) => setNewEnforcer({ ...newEnforcer, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={newEnforcer.email}
            onChange={(e) => setNewEnforcer({ ...newEnforcer, email: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenAddDialog(false)}
            sx={{ color: theme.palette.secondary.main }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddEnforcer}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: '#ffffff',
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ position: 'fixed', bottom: 24, right: 24 }}>
        <IconButton
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
          size="large"
          onClick={() => onNavigate('home')}
          aria-label="Go to Home"
        >
          <HomeIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
