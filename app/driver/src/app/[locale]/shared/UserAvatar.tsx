'use client';
/**
 * @file UserAvatar.tsx
 * @description This file contains the UserAvatar component.
 * @author Swayam Shah
 */

import { Avatar, Menu, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUser } from './actions';
import { Session } from 'next-auth';
import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function UserAvatar() {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [anchorEl, setAnchorEl] = useState<HTMLElement|null>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    const locale = window.location.pathname.split('/')[1];
    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }
    signOut({ callbackUrl: `/${locale}` });
  };

  const handleProfile = () => {
    handleClose();
  };


  useEffect(() => {
    async function fetchUser() {
      const res = await getUser();
      setSession(res);
    }
    fetchUser();
  }, [])
  return (
    <>
      <Avatar
        alt={session?.user?.name==null?undefined:session?.user?.name}
        src={session?.user?.image==null?undefined:session?.user?.image}
        sx={{
          width: 40,
          height: 40,        
        }}

        onClick={(e) => {handleOpen(e)}}
      />
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        >
        <MenuItem onClick={() => {handleLogout()}}>{session?'Logout': 'Login'}</MenuItem>
        {session && <MenuItem onClick={() => {handleProfile()}}>Profile</MenuItem>}
      </Menu>
    </>
  );
}

export default UserAvatar;
