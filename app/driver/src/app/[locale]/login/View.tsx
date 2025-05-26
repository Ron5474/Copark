/*
#######################################################################
#
# Copyright (C) 2025 Copark Inc. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
'use client'

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { signIn } from "next-auth/react"
import { useEffect } from 'react';
import { getUser } from '../shared/actions';
import { useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';


export default function LoginView() {
  // const { data: session } = useSession()
  const t = useTranslations("loginPage");
  const router = useRouter()
  const locale = useLocale()
  const handleClick = async (provider: string) => {
    await signIn(provider, { callbackUrl: `/driver/${locale}/login/blank`, basePath: '/driver' })
  }

  useEffect(() => {
      getUser().then((res) => {
        if (res) {
          router.push('/blank')
        }
      });
  }, [router])

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '65vh',
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ width: '100%', maxWidth: 300, margin: 'auto', paddingTop: 4 }}>
        <Typography component="h1" variant="h3" sx={{mb: 3}}>
            {t('title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          fullWidth
          sx={{color: 'black', borderColor: 'black'}}
          onClick={() => {
            // login()
            handleClick('github')
          }}
        >
          {t("github")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          fullWidth
          sx={{color: 'black', borderColor: 'black'}}
          onClick={() => {
            // login()
            handleClick('google')
          }}
        >
          {t("google")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<FacebookIcon />}
          fullWidth
          sx={{color: 'black', borderColor: 'black'}}
          onClick={() => {
            // login()
            handleClick('facebook')
          }}
        >
          {t("facebook")}
        </Button>
        <p style={{ color: 'gray', fontSize: '12px', marginTop: '10px' }}>
          {t("signup prompt")} <Link href="/signup" style={{ textDecoration: "underline" }}>{t("signup link")}</Link>
        </p>
      </Stack>
    </Container>
  );
}