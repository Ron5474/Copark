"use client";
/**
 * @file cardButton.tsx
 * @description This file contains the CardButton component.
 * @author Swayam Shah
 */

import { Box, Icon, Paper, Typography } from "@mui/material";

type CardButtonProps = {
  icon: string,
  text: string,
  click: () => void
};

function CardButton({icon, text, click}: CardButtonProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: "20px",
        margin: "20px",
        borderRadius: "10px",
        background: (theme) =>
          `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
      onClick={click}
    > <Box sx={{ display: "flex", gap: "15%", alignItems: "center", height: "100px" }}>
        <Icon sx={{ width: "100px", height: "100px" }}>
          <picture>
            <source
              srcSet={icon}
              type="image/svg"
            />
            <img
              src={icon}
              alt="Dashboard Icon"
              width={100}
              height={100}
            />
          </picture>
        </Icon>

        <Typography variant="h4" sx={{ fontWeight: 700, color: (theme) => theme.palette.getContrastText(theme.palette.secondary.main) }}>
          {text}
        </Typography>
      </Box>
    </Paper>
  );
}

export default CardButton;