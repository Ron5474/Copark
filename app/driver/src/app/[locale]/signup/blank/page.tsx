'use client';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { signUp } from '../actions';
import { userLoginAttempt } from '../../dashboard/actions';


function Blank() {
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    const loggedIn = async () => {
      await signUp(locale);
      const res = await userLoginAttempt(locale);
      if (res == "complete") {
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