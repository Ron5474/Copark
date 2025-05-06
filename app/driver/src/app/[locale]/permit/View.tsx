'use client'

import { Fragment, useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Paper,
  Alert
} from '@mui/material'
import { useContext } from 'react';
import { DashboardContext } from '../dashboard/context';
import theme from '../theme'
import MemberVehicles from '../selectVehicle/member/Vehicle';

export default function BuyPermit() {
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [isVehicleSelected] = useState<boolean>(true)
  const [totalCost, setTotalCost] = useState<number>(5.00);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit');
  const context = useContext(DashboardContext);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Temporary Zones until we set them in backend
  const zones = useMemo(() => [
    { id: 'zone-a', name: 'Zone # 1234', price: 5.00 },
    { id: 'zone-b', name: 'Zone # 5678', price: 4.00 },
    { id: 'zone-c', name: 'Zone # 8901', price: 3.50 },
    { id: 'zone-d', name: 'Zone # 1569', price: 4.50 }
  ], []);
  
  useEffect(() => {
    if (selectedZone) {
      const zone = zones.find(z => z.id === selectedZone);
      if (zone) {
        setTotalCost(zone.price);
      }
    }
  }, [selectedZone, zones]);

  const handlePurchase = () => {
    // Backend Logic Goes Here
    alert('Permit purchased successfully!');
    context.setCurrentPage('dashboard');
  };

  return (
    <Fragment>
      <Box sx={{
        maxWidth: '95%',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        marginTop: '1vh',
      }}>
        <Typography
          variant="h5"
          gutterBottom
        >
          Buy Parking Permit
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Daily permit for today ({formattedDate})
        </Alert>

        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: '8px' }}>
          <SelectVehicle />
        </Paper>

        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            Step 2: Select Zone
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Typography
              variant="body1"
              sx={{ mb: 1 }}
            >
              Parking Zone
            </Typography>
            <TextField
              select
              fullWidth
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            >
              {zones.map((zone) => (
                <MenuItem key={zone.id} value={zone.id}>
                  {zone.name} - ${zone.price.toFixed(2)}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </Paper>

        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            Step 3: Payment
          </Typography>
          
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{ mt: 2 }}
          >
            <FormControlLabel 
              value="credit" 
              control={<Radio />} 
              label="Credit Card"
              sx={{
                width: '100%',
                m: 0,
                mb: 2,
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: 2,
                backgroundColor: paymentMethod === 'credit' ? '#f5f5f5' : 'white',
              }}
            />
            <FormControlLabel 
              value="paypal" 
              control={<Radio />} 
              label="PayPal"
              sx={{
                width: '100%',
                m: 0,
                mb: 2,
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: 2,
                backgroundColor: paymentMethod === 'paypal' ? '#f5f5f5' : 'white',
              }}
            />
          </RadioGroup>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">
              Daily Permit:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              ${totalCost.toFixed(2)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">
              Service Fee:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              $0.50
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Total:
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              ${(totalCost + 0.50).toFixed(2)}
            </Typography>
          </Box>
        </Paper>
        <Button
          fullWidth
          variant="contained"
          disabled={!selectedZone || !isVehicleSelected}
          onClick={handlePurchase}
          sx={{
            width: '100%',
            marginTop: '2vh',
            marginBottom: '4vh',
            fontSize: '1.15rem',
            color: 'white',
            backgroundColor: theme.palette.primary.main,
            textTransform: 'none',
          }}
        >
          Purchase Permit
        </Button>
      </Box>
    </Fragment>
  );
}


const SelectVehicle = () => {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
        Step 1: Select Vehicle
      </Typography>
      <MemberVehicles isCheckout={true} />
    </>
  )
}
