'use client';
/**
 * @file zoneField.tsx
 * @description This file contains the ZoneField component.
 * @author Swayam Shah
 */

import { Button, ThemeProvider } from "@mui/material";
import proptypes from "prop-types";
import theme from "../theme";


function ZoneField({text}: {text: string}) {
  return (
    <ThemeProvider theme={theme}>
    <Button sx={{
      width: "fit-content",
      color: (theme) => theme.palette.secondary.main,
      backgroundColor: (theme) => theme.palette.primary.light,
      borderColor: (theme) => theme.palette.primary.main,
      padding: "25px 30px",
      borderWidth: "3px",
      borderStyle: "solid",
      borderRadius: "30px"
       }}>
      {text}
    </Button>
    </ThemeProvider>
  )
}

ZoneField.prototype = {
  text: proptypes.string.isRequired,
}

export default ZoneField;