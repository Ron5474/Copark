'use client'

import { useEffect, useState } from 'react'
import { getAllPermits } from '../../permit/actions'
import type { Permit } from '../../types'
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Switch,
  Typography,
  FormControlLabel,
} from '@mui/material'

export default function AllPermitsTable() {
  const [permits, setPermits] = useState<Permit[]>([])
  const [activeOnly, setActiveOnly] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAllPermits(activeOnly)
      .then(setPermits)
      .catch(err => {
        void err;
        setError('Failed to fetch permit data')
      })
      .finally(() => setLoading(false))
  }, [activeOnly])

  if (error) {
    return (
      <Box>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">All Permits {activeOnly ? '(Active Only)' : '(All)'}</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
          }
          label="Active Only"
        />
      </Box>

      <Paper sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Area</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell>Active Date</TableCell>
              <TableCell>Expire Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : permits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No permits found.</TableCell>
              </TableRow>
            ) : (
              permits.map((permit, index) => (
                <TableRow key={index}>
                  <TableCell>{permit.type}</TableCell>
                  <TableCell>{permit.area}</TableCell>
                  <TableCell>{new Date(permit.purchaseDate).toLocaleString()}</TableCell>
                  <TableCell>{new Date(permit.activeDate).toLocaleString()}</TableCell>
                  <TableCell>{new Date(permit.expireDate).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
