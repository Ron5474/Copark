import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import RestoreIcon from '@mui/icons-material/Restore';
import { getDrivers, suspendUser, reinstateUser, deleteUser } from '../../driver/actions';

export default function ManageDrivers({ onNavigate }) {
  const theme = useTheme();
  const [drivers, setDrivers] = useState([]);

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

  const handleDeleteUser = async (enforcerId) => {
    await deleteUser(enforcerId);
    fetchDrivers();
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
          Manage Drivers
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 3,
          background: '#ffffff',
          maxWidth: 900,
          mx: 'auto',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: '15px'
        }}
      >
        <Typography sx={{ mb: 2 }}>Driver Count: {drivers.length}</Typography>

        {drivers.map((enforcer) => (
          <Box
            key={enforcer.id}
            data-testid="driver-item"
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
              {/* Suspend / Restore Action */}
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

              {/* Delete Action */}
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
      </Paper>
    </Box>
  );
}
