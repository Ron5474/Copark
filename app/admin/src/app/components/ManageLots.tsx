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
} from '@mui/material';
import { getLots, createLot, updateLot } from '../../permit/actions';
import { Lot, LotGroup } from '../../types';

export default function ManageLots() {
  const theme = useTheme();
  const [lots, setLots] = useState<LotGroup[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [error, setError] = useState<string>('');
  const [newLot, setNewLot] = useState({
    lot: '',
    daily: { price: 0 },
    quarterly: { price: 0, expireDate: '' },
    yearly: { price: 0, expireDate: '' }
  });
  const [editingLot, setEditingLot] = useState({
    lot: '',
    price: 0,
    type: '',
    quarterlyExpireDate: '',
    yearlyExpireDate: ''
  });

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const data = await getLots();
      setLots(data);
    } catch (err) {
      void err;
      setError('Failed to fetch lots');
    }
  };

  const handleSubmit = async () => {
    try {
      await createLot(newLot);
      setOpenDialog(false);
      fetchLots(); // Refresh the lots list
      setNewLot({ // Reset form
        lot: '',
        daily: { price: 0 },
        quarterly: { price: 0, expireDate: '' },
        yearly: { price: 0, expireDate: '' }
      });
    } catch (err) {
      void err;
      setError('Failed to create lot');
    }
  };

  const handleEditClick = (lot: Lot, groupId: string) => {
    // Find existing data for the lot across all groups
    const quarterlyGroup = lots.find(group => group.id === 'quarterly');
    const yearlyGroup = lots.find(group => group.id === 'yearly');
    const quarterlyLot = quarterlyGroup?.lots.find(l => l.name === lot.name);
    const yearlyLot = yearlyGroup?.lots.find(l => l.name === lot.name);
    
    setEditingLot({
      lot: lot.name,
      price: Number(lot.price.replace('$', '')),
      type: groupId,
      quarterlyExpireDate: quarterlyLot?.expireDate || '',
      yearlyExpireDate: yearlyLot?.expireDate || ''
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const lotGroup = lots.find(group => group.id === editingLot.type);
      const originalLot = lotGroup?.lots.find(l => l.name === editingLot.lot);

      const updateData = {
        lot: editingLot.lot,
        daily: { 
          price: editingLot.type === 'daily' ? editingLot.price : Number(originalLot?.price.replace('$', ''))
        },
        quarterly: {
          price: editingLot.type === 'quarterly' ? editingLot.price : Number(originalLot?.price.replace('$', '')),
          expireDate: editingLot.quarterlyExpireDate
        },
        yearly: {
          price: editingLot.type === 'yearly' ? editingLot.price : Number(originalLot?.price.replace('$', '')),
          expireDate: editingLot.yearlyExpireDate
        }
      };

      await updateLot(updateData);
      setEditDialog(false);
      fetchLots();
      setEditingLot({ 
        lot: '', 
        price: 0, 
        type: '', 
        quarterlyExpireDate: '',
        yearlyExpireDate: '' 
      });
    } catch (err) {
      void err;
      setError('Failed to update lot');
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
        {lots.map((lotGroup) => (
          <Box
            key={lotGroup.id}
            sx={{
              mb: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.dark,
                mb: 2,
                fontWeight: 600
              }}
            >
              {lotGroup.title.charAt(0).toUpperCase() + lotGroup.title.slice(1)} Lots
            </Typography>
            
            {lotGroup.lots.map((lot) => (
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
                      Lot {lot.name}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Price:</strong> {lot.price}
                    </Typography>
                    {/* {lot.activeDate && (
                      <Typography sx={{ mb: 1 }}>
                        <strong>Active Date:</strong> {new Date(lot.activeDate).toLocaleDateString()}
                      </Typography>
                    )} */}
                    {lot.expireDate && lotGroup.title != 'daily' && (
                      <Typography>
                        <strong>Expire Date:</strong> {new Date(lot.expireDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    onClick={() => handleEditClick(lot, lotGroup.id)}
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

        {error && (
          <Typography 
            color="error"
            sx={{ 
              mt: 2,
              fontSize: '0.875rem'
            }}
          >
            {error}
          </Typography>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Lot</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 300 }}>
            <TextField 
              label="Lot ID"
              value={newLot.lot}
              onChange={(e) => setNewLot({...newLot, lot: e.target.value})}
            />
            <TextField 
              label="Daily Price"
              type="number"
              inputProps={{ min: 0 }}
              value={newLot.daily.price}
              onChange={(e) => setNewLot({
                ...newLot, 
                daily: { price: Math.max(0, Number(e.target.value)) }
              })}
            />
            <TextField 
              label="Quarterly Price"
              type="number"
              inputProps={{ min: 0 }}
              value={newLot.quarterly.price}
              onChange={(e) => setNewLot({
                ...newLot,
                quarterly: { 
                  ...newLot.quarterly,
                  price: Math.max(0, Number(e.target.value))
                }
              })}
            />
            <TextField 
              label="Quarterly Expire Date"
              type="date"
              value={newLot.quarterly.expireDate?.split('T')[0]}
              onChange={(e) => setNewLot({
                ...newLot,
                quarterly: {
                  ...newLot.quarterly,
                  expireDate: `${e.target.value}T23:59:59-07:00`
                }
              })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField 
              label="Yearly Price"
              type="number"
              inputProps={{ min: 0 }}
              value={newLot.yearly.price}
              onChange={(e) => setNewLot({
                ...newLot,
                yearly: {
                  ...newLot.yearly,
                  price: Math.max(0, Number(e.target.value))
                }
              })}
            />
            <TextField 
              label="Yearly Expire Date"
              type="date"
              value={newLot.yearly.expireDate?.split('T')[0]}
              onChange={(e) => setNewLot({
                ...newLot,
                yearly: {
                  ...newLot.yearly,
                  expireDate: `${e.target.value}T23:59:59-07:00`
                }
              })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={
              !newLot.lot || 
              (newLot.quarterly.price > 0 && !newLot.quarterly.expireDate) ||
              (newLot.yearly.price > 0 && !newLot.yearly.expireDate)
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Lot Price</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 300 }}>
            <TextField 
              label="Price"
              type="number"
              inputProps={{ min: 0 }}
              value={editingLot.price}
              onChange={(e) => setEditingLot({
                ...editingLot,
                price: Math.max(0, Number(e.target.value))
              })}
            />
            {editingLot.type === 'quarterly' && (
              <TextField 
                label="Quarterly Expire Date"
                type="date"
                value={editingLot.quarterlyExpireDate?.split('T')[0]}
                onChange={(e) => setEditingLot({
                  ...editingLot,
                  quarterlyExpireDate: `${e.target.value}T23:59:59-07:00`
                })}
                InputLabelProps={{ shrink: true }}
              />
            )}
            {editingLot.type === 'yearly' && (
              <TextField 
                label="Yearly Expire Date"
                type="date"
                value={editingLot.yearlyExpireDate?.split('T')[0]}
                onChange={(e) => setEditingLot({
                  ...editingLot,
                  yearlyExpireDate: `${e.target.value}T23:59:59-07:00`
                })}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}