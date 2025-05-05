/**
 * @file howToUseCard.tsx
 * @description This file contains the HowToUseCard component.
 * @author Swayam Shah
 */

import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import theme from "../theme";

function HowToUseCard({number, image, description, variant}: {number: number, image: string, description: string, variant: string}) {
  return (
    <Box sx={{
      backgroundImage: `url(${image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundTransform: "scaleX(-1)",
      display: "flex",
      alignItems: "center",
      gap: "5%",
      width: "100%",
      height: "fit-content",
      padding: "30px 15px 30px 30px",
      borderRadius: "25px",
    }}>
      {variant === "secondary" &&(
      <Box sx={{ position: 'relative', width: '62px', height: '62px' }}>
      {/* Background Shadow Layer */}
      <Box
        sx={{
          position: 'absolute',
          top: -6,
          left: -6,
          width: '62px',
          height: '62px',
          borderRadius: '15px',
          backgroundColor: 'rgba(244, 90, 89, 0.3)',
          zIndex: 2,
        }}
      />
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '62px',
        height: '62px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.secondary.main,
        borderRadius: '15px',
        zIndex: 2,
      }}>
        <Typography sx={{
          fontSize: "32px",
          color: "white",
          fontWeight: 700,
        }}>
          {number}
        </Typography>
      </Box>
      </Box>)}

      {variant === "primary" &&(
      <Box sx={{ position: 'relative', width: '62px', height: '62px' }}>
      {/* Background Shadow Layer */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: -8,
          width: '62px',
          height: '62px',
          borderRadius: '15px',
          backgroundColor: 'rgba(65, 169, 171, 0.3)',
          zIndex: 2,
          rotate: "45deg",
        }}
      />
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '62px',
        height: '62px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '15px',
        rotate: "45deg",
        zIndex: 2,
      }}>
        <Typography sx={{
          fontSize: "32px",
          color: "white",
          fontWeight: 700,
          transform: "rotate(-45deg)",
        }}>
          {number}
        </Typography>
      </Box>
      </Box>)}

      <Box sx={{
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        padding: "30px 15px 30px 15px",
        borderRadius: "25px",
        color: theme.palette.secondary.main,
      }}>
        <Typography sx={{
          fontSize: "20px",
          fontWeight: 500,
        }}>
        {description}
        </Typography>
      </Box>

    </Box>
  );
}

HowToUseCard.proptypes = {
  number: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
};

export default HowToUseCard;

