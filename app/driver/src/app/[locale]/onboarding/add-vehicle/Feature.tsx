/**
 * @file Feature.tsx
 * @description This file contains the Feature component which is used to display the features of the app
 * @author Swayam Shah
 */

import { Box, Typography } from '@mui/material';

export default function Feature({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
      gap: '10px',
      xs: {
        width: '100%',
      },
      sm: {
        width: '100%',
      },
      md: {
        width: '50%',
      },
      lg: {
        width: '30%',
      },
      xl: {
        width: '30%',
      },
    }}>
        <Box sx={{
          display: 'flex',
          width: '30%',
          height: 'auto',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <picture>
          <source media="(max-width: 600px)" srcSet={icon} />
          <img src={icon} alt="Feature Icon" style={{ width: '50px', height: 'auto'}} />
        </picture>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          width: '70%',
        }}>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.primary.dark }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "gray" }}>
          {desc}
        </Typography>
        </Box>
      </Box>
  );
}