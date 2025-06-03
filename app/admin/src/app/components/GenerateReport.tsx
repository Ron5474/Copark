'use client'
import React, { useState } from 'react';
import { fetchAdminReport } from '../../report/actions';
import { Button, TextField, Box, Typography } from '@mui/material';

const downloadBase64Pdf = (base64: string) => {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = 'report.pdf';
  link.click();
};

export default function GenerateReportButton() {
  const [numDays, setNumDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const base64 = await fetchAdminReport(numDays);
    setLoading(false);
    if (!base64) {
      alert('Failed to generate report. Please try again.');
      return;
    }
    downloadBase64Pdf(base64);
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="body1">Number of days:</Typography>
      <TextField
        type="number"
        value={numDays}
        inputProps={{ min: 1 }}
        size="small"
        onChange={e => setNumDays(Number(e.target.value))}
        style={{ width: 100 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Download PDF Report'}
      </Button>
    </Box>
  );
}