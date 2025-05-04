/**
 * @file getStartedButton.tsx
 * @description This file contains the Get Started button component.
 * @author Swayam Shah
 */

import { Button } from "@mui/material";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useRouter } from "next/navigation";

function GetStartedButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/login");
  };

  return (
    <Button
      onClick={() => handleClick()}
      variant="contained"
      aria-label="go-to-login"
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
