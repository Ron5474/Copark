import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Alert
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import RestoreIcon from '@mui/icons-material/Restore';
import { getEnforcers, addEnforcer, suspendUser, reinstateUser, deleteUser } from '../../enforcement/actions';

export default function ManageEnforcement({ onNavigate }) {
  const theme = useTheme();
  const [enforcers, setEnforcers] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addError, setAddError] = useState('');
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
    fetchEnforcers();
  };

  const handleDeleteUser = async (enforcerId) => {
    await deleteUser(enforcerId);
    fetchEnforcers();
  };

  const handleAddEnforcer = async () => {
    setAddError(''); // Clear any previous error
    const result = await addEnforcer(newEnforcer);
    if (!result) {
      setAddError('An enforcer with this email already exists');
      return;
    }
    setOpenAddDialog(false);
    setNewEnforcer({ name: '', email: '' });
    fetchEnforcers();
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#ffffff' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          pb: 2
        }}
      >
        <img
          src="/admin/assets/logo-notitle.png"
          alt="CoPark Admin"
          style={{ height: 60, marginRight: 16 }}
        />
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: '32px'
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
        <Typography sx={{ mb: 2 }}>Enforcer Count: {enforcers.length}</Typography>

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
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 500,
                  color: theme.palette.primary.dark
                }}
              >
                {enforcer.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color:
                    enforcer.accountStatus === 'suspended'
                      ? theme.palette.secondary.main
                      : theme.palette.primary.main,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {enforcer.accountStatus}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Suspend / Restore */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {enforcer.accountStatus === 'suspended' ? 'Restore' : 'Suspend'}
                </Typography>
                <IconButton
                  onClick={() => handleUserStatus(enforcer.id, enforcer.accountStatus)}
                  sx={{
                    bgcolor: `${theme.palette.primary.main}20`,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                      color: '#ffffff'
                    }
                  }}
                  aria-label={
                    enforcer.accountStatus === 'suspended' ? 'Restore user' : 'Suspend user'
                  }
                >
                  {enforcer.accountStatus === 'suspended' ? <RestoreIcon /> : <GavelIcon />}
                </IconButton>
              </Box>

              {/* Delete */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Delete
                </Typography>
                <IconButton
                  onClick={() => handleDeleteUser(enforcer.id)}
                  sx={{
                    bgcolor: `${theme.palette.secondary.main}20`,
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
          </Box>
        ))}
      </Box>

      {/* Add Enforcer Dialog */}
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
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          Add New Enforcer
        </DialogTitle>
        <DialogContent>
          {addError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            aria-label='Input Name'
            label="Name"
            fullWidth
            value={newEnforcer.name}
            onChange={(e) => setNewEnforcer({ ...newEnforcer, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            aria-label='Input Email'
            label="Email"
            fullWidth
            value={newEnforcer.email}
            onChange={(e) => setNewEnforcer({ ...newEnforcer, email: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} sx={{ color: theme.palette.secondary.main }}>
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
    </Box>
  );
}
