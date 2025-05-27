'use client';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { signOut } from 'next-auth/react';

import { getUser } from '../../shared/actions';
import { userLoginAttempt } from '../../dashboard/actions';


function Blank() {
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    const loggedIn = async () => {
      console.log('Checking user login status...');
      if (!await getUser()) {
        router.push(`/login`);
      } else if (!await userLoginAttempt(locale)) {
        signOut({ callbackUrl: `/${locale}/signup` });
      } else {
        router.push('/dashboard');
      }
    }
    loggedIn();
  }, [router, locale]);

  return (
    <></>
  );
}

export default Blank;