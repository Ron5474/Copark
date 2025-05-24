import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { LocalParking, AddCircle } from '@mui/icons-material';
import { getZones, createZone } from '../../permit/actions';
import { Zone } from '../../types';

export default function ManageZones() {
  const theme = useTheme();
  const [zones, setZones] = useState<Zone[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newZone, setNewZone] = useState({
    zone: 0,
    hourly: 0,
    maxDuration: { hours: 0, minutes: 0 },
    openTime: '08:00',
    closeTime: '18:00'
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const data = await getZones();
    setZones(data);
  };

  const handleCreateZone = async () => {
    try {
      const result = await createZone(newZone);
      if (result) {
        setOpenDialog(false);
        fetchZones();
        setNewZone({
          zone: 0,
          hourly: 0,
          maxDuration: { hours: 0, minutes: 0 },
          openTime: '08:00',
          closeTime: '18:00'
        });
      }
    } catch (err) {
      void err;
      setError(err instanceof Error ? err.message : 'Failed to create zone');
    }
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
          Manage Zones
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          Add New Zone
        </Button>
      </Box>

      <Box
        sx={{
          p: 3,
          background: '#ffffff',
          maxWidth: 900,
          mx: 'auto',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: '15px'
        }}
      >
        <Typography sx={{ mb: 2 }}>Zone Count: {zones.length}</Typography>

        {zones.map((zone) => (
          <Box
            key={zone.zone}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#E8F4F4',
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
                Zone {zone.zone}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Rate:</strong> ${zone.hourly}/hour
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Max Duration:</strong> {zone.maxDuration.hours}h {zone.maxDuration.minutes}m
              </Typography>
              <Typography>
                <strong>Hours:</strong> {zone.openTime} - {zone.closeTime}
              </Typography>
            </Box>
          </Box>
        ))}

        {zones.length === 0 && (
          <Typography variant="body1" textAlign="center">
            No zones found
          </Typography>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Zone</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Zone Number"
              type="number"
              value={newZone.zone}
              onChange={(e) => setNewZone({...newZone, zone: parseInt(e.target.value)})}
              fullWidth
            />
            <TextField
              label="Hourly Rate"
              type="number"
              value={newZone.hourly}
              onChange={(e) => setNewZone({...newZone, hourly: parseFloat(e.target.value)})}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Max Hours"
                type="number"
                value={newZone.maxDuration.hours}
                onChange={(e) => setNewZone({
                  ...newZone, 
                  maxDuration: {...newZone.maxDuration, hours: parseInt(e.target.value)}
                })}
              />
              <TextField
                label="Max Minutes"
                type="number"
                value={newZone.maxDuration.minutes}
                onChange={(e) => setNewZone({
                  ...newZone, 
                  maxDuration: {...newZone.maxDuration, minutes: parseInt(e.target.value)}
                })}
              />
            </Box>
            <TextField
              label="Open Time"
              type="time"
              value={newZone.openTime}
              onChange={(e) => setNewZone({...newZone, openTime: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Close Time"
              type="time"
              value={newZone.closeTime}
              onChange={(e) => setNewZone({...newZone, closeTime: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateZone}
            variant="contained"
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
