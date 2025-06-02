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
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { createLot, getAllLotDetails } from '../../permit/actions';
import { LotGroup } from '../../types';

export default function ManageLots() {
  const theme = useTheme();
  const [lots, setLots] = useState<LotGroup[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedLot, setSelectedLot] = useState<{name: string, price: string} | undefined>();
  const [newLot, setNewLot] = useState({
    name: '',
    daily: { price: 0 },
    quarterly: { price: 0, expireDate: '' },
    yearly: { price: 0, expireDate: '' }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const data = await getAllLotDetails();
      setLots(data);
    } catch (err) {
      console.error('Failed to fetch lots:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      await createLot({
        lot: newLot.name,
        daily: newLot.daily,
        quarterly: newLot.quarterly,
        yearly: newLot.yearly
      });

      setOpenDialog(false);
      await fetchLots(); // Refresh lots list
      
      // Reset form
      setNewLot({
        name: '',
        daily: { price: 0 },
        quarterly: { price: 0, expireDate: '' },
        yearly: { price: 0, expireDate: '' }
      });
    } catch (error) {
      console.error('Failed to create lot:', error);
    } finally {
      setIsSubmitting(false);
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
          Manage Lots
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
          Add New Lot
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
        {lots.map((group) => (
          <Box key={group.id} sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.dark,
                mb: 2,
                textTransform: 'capitalize'
              }}
            >
              {group.title} Permits
            </Typography>
            
            {group.lots.map((lot) => (
              <Box
                key={lot.name}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '20px',
                        fontWeight: 500,
                        color: theme.palette.primary.dark
                      }}
                    >
                      {lot.name}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Price:</strong> {lot.price}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => {
                      setSelectedLot(lot);
                      setEditDialog(true);
                    }}
                    sx={{ 
                      minWidth: 'auto',
                      color: theme.palette.primary.main
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        ))}

        {lots.length === 0 && (
          <Typography variant="body1" textAlign="center">
            No lots found
          </Typography>
        )}
      </Box>

      {/* Add/Edit dialogs kept as placeholders */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Lot</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Lot Name"
            value={newLot.name}
            onChange={(e) => setNewLot(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Daily Price</InputLabel>
            <OutlinedInput
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={newLot.daily.price}
              onChange={(e) => setNewLot(prev => ({
                ...prev,
                daily: { ...prev.daily, price: Number(e.target.value) }
              }))}
              label="Daily Price"
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Quarterly Price</InputLabel>
            <OutlinedInput
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={newLot.quarterly.price}
              onChange={(e) => setNewLot(prev => ({
                ...prev,
                quarterly: { ...prev.quarterly, price: Number(e.target.value) }
              }))}
              label="Quarterly Price"
            />
          </FormControl>
          
          <TextField
            fullWidth
            label="Quarterly Expiration Date"
            type="date"
            value={newLot.quarterly.expireDate?.split('T')[0] || ''}
            onChange={(e) => setNewLot(prev => ({
              ...prev,
              quarterly: { ...prev.quarterly, expireDate: `${e.target.value}T23:59:59-07:00` }
            }))}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Yearly Price</InputLabel>
            <OutlinedInput
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={newLot.yearly.price}
              onChange={(e) => setNewLot(prev => ({
                ...prev,
                yearly: { ...prev.yearly, price: Number(e.target.value) }
              }))}
              label="Yearly Price"
            />
          </FormControl>

          <TextField
            fullWidth
            label="Yearly Expiration Date"
            type="date"
            value={newLot.yearly.expireDate?.split('T')[0] || ''}
            onChange={(e) => setNewLot(prev => ({
              ...prev,
              yearly: { ...prev.yearly, expireDate: `${e.target.value}T23:59:59-07:00` }
            }))}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || !newLot.name}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Lot {selectedLot?.name}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>Coming soon...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
