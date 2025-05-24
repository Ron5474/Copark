import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Paper
} from '@mui/material';
import { getZones } from '../../permit/actions';
import { Zone } from '../../types';

export default function ManageZones() {
  const theme = useTheme();
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const data = await getZones();
    setZones(data);
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
    </Box>
  );
}
