import React from 'react';
import { Box, Button, Paper, Typography, IconButton, Grid } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter } from 'next/navigation';

const enforcers = [
  { name: 'Name of Enforcer 1' },
  { name: 'Name of Enforcer 2' },
  { name: 'Name of Enforcer 3' },
];

export default function ManageEnforcement({ onNavigate }) {
  const router = useRouter();

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
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
        >
          Add Enforcer
        </Button>
      </Box>

      {/* Enforcer List */}
      <Paper sx={{ p: 2, background: '#e0e0e0', maxWidth: 900, mx: 'auto' }}>
        {enforcers.map((enforcer, idx) => (
          <Box
            key={enforcer.name}
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
            <Typography>{enforcer.name}</Typography>
            <Box>
              <IconButton>
                <GavelIcon fontSize="large" />
              </IconButton>
              <IconButton>
                <PersonOffIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        ))}
        {/* Empty space at the bottom */}
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
