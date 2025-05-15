import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GavelIcon from '@mui/icons-material/Gavel';
import AddAPIUser from './AddAPIUser'; // Assuming this component exists in the same directory
import { getAPIUsers, suspendAPIUser, APIUser } from '@/api/actions'; // Using existing actions

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ManageAPIUsers({ onNavigate }: { onNavigate: (page: string) => void }) {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [apiUsers, setApiUsers] = useState<APIUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const users = await getAPIUsers();
    setApiUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ p: 4, bgcolor: '#ffffff' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          pb: 2,
        }}
      >
        <img src="/admin/assets/logo-notitle.png" alt="CoPark Admin" style={{ height: 60, marginRight: 16 }} />
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: '32px',
          }}
        >
          Manage API Users
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          Add API User
        </Button>
      </Box>

      <Paper
        sx={{
          p: 3,
          background: '#ffffff',
          maxWidth: 900,
          mx: 'auto',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: '15px',
        }}
      >
        {loading ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            Loading...
          </Typography>
        ) : apiUsers?.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No API users found
          </Typography>
        ) : (
          <Box>
            {apiUsers?.map((user) => (
              <Box
                key={user.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#D9F1E4',
                  border: `1px solid ${theme.palette.primary.light}20`,
                  p: 3,
                  mb: 2,
                  borderRadius: '15px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '20px', fontWeight: 500 }}>
                    {user.name}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: theme.palette.text.secondary }}>
                    {user.email} – {user.role}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: user.accountStatus === 'suspended' ? theme.palette.secondary.main : theme.palette.primary.main,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {user.accountStatus}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Suspend User */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Suspend
                    </Typography>
                    <IconButton
                      onClick={async () => {
                        await suspendAPIUser(user.id);
                        fetchUsers();
                      }}
                      sx={{
                        bgcolor: `${theme.palette.primary.main}20`,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: theme.palette.primary.main,
                          color: '#ffffff',
                        },
                      }}
                      aria-label="Suspend user"
                    >
                      <GavelIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Add API User Dialog */}
      <AddAPIUser
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onUserAdded={fetchUsers}  // After adding a new user, refresh the user list
      />
    </Box>
  );
}
