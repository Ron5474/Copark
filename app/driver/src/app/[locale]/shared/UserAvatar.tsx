'use client';
/**
 * @file UserAvatar.tsx
 * @description This file contains the UserAvatar component.
 * @author Swayam Shah
 */

import { Avatar } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUser } from './actions';
import { Session } from 'next-auth';

function UserAvatar() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    async function fetchUser() {
      const res = await getUser();
      setSession(res);
    }
    fetchUser();
  }, [])
  return (
    <Avatar
      alt="User Avatar"
      src={session?.user?.image || undefined}
      sx={{
        width: 40,
        height: 40,        
      }}
    />
  );
}

export default UserAvatar;
