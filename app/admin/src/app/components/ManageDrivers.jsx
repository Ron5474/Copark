import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HomeIcon from '@mui/icons-material/Home';
import RestoreIcon from '@mui/icons-material/Restore';
import { getDrivers, suspendUser, reinstateUser, deleteUser } from '../../driver/actions';

export default function ManageDrivers({ onNavigate }) {
  const [enforcers, setDrivers] = useState([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const data = await getDrivers();
    setDrivers(data);
  };

  const handleUserStatus = async (enforcerId, currentStatus) => {
    if (currentStatus === 'suspended') {
      await reinstateUser(enforcerId);
    } else {
      await suspendUser(enforcerId);
    }
    fetchDrivers();
  };

  const handleDeleteUser = async (driverId) => {
    await deleteUser(driverId);
    fetchDrivers();
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
                onClick={() => handleUserStatus(enforcer.id, enforcer.accountStatus)}
                color={enforcer.accountStatus === 'suspended' ? 'primary' : 'default'}
                aria-label={enforcer.accountStatus === 'suspended' ? 'Restore user' : 'Suspend user'}
              >
                {enforcer.accountStatus === 'suspended' ? (
                  <RestoreIcon fontSize="large" />
                ) : (
                  <GavelIcon fontSize="large" />
                )}
              </IconButton>
              <IconButton
                onClick={() => handleDeleteUser(enforcer.id)}
                color="error"
                aria-label="Delete user"
                disabled={enforcer.accountStatus === 'deleted'}
              >
                <PersonOffIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        ))}
        <Box sx={{ height: 120, background: '#d3d3d3', borderRadius: 1 }} />
      </Paper>

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
