/**
 * @file zoneField.tsx
 * @description This file contains the ZoneField component.
 * @author Swayam Shah
 */

import { Button } from "@mui/material";


function ZoneField() {
  return (
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
      Enter Zone Number
    </Button>
  )
}

export default ZoneField;