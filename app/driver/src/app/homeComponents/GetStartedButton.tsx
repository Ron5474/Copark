/**
 * @file getStartedButton.tsx
 * @description This file contains the Get Started button component.
 * @author Swayam Shah
 */

import { Button } from "@mui/material";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

function GetStartedButton() {
  return (
    <Button
      variant="contained"
      sx={{
        backgroundColor: (theme) => theme.palette.secondary.main,
        color: "white",
        fontSize: "20px",
        fontWeight: 700,
        borderRadius: "30px",
        padding: "10px 20px",
      }}
    >
      Get Started
      <ArrowRightAltIcon sx={{ marginLeft: "10px" }} />
    </Button>
  );
}

export default GetStartedButton;
