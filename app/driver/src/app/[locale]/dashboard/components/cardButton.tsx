// "use client";
// /**
//  * @file cardButton.tsx
//  * @description This file contains the CardButton component.
//  * @author Swayam Shah
//  */

// import { Box, Icon, Paper, Typography } from "@mui/material";

// type CardButtonProps = {
//   icon: string,
//   text: string,
//   click: () => void
// };

// function CardButton({icon, text, click}: CardButtonProps) {
//   return (
//     <Paper
//       elevation={3}
//       sx={{
//         padding: "20px",
//         margin: "20px",
//         borderRadius: "10px",
//         background: (theme) =>
//           `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.main} 100%)`,
//       }}
//       onClick={click}
//     > <Box sx={{ display: "flex", gap: "15%", alignItems: "center", height: "100px" }}>
//         <Icon sx={{ width: "100px", height: "100px" }}>
//           <picture>
//             <source
//               srcSet={icon}
//               type="image/svg"
//             />
//             <img
//               src={icon}
//               alt="Dashboard Icon"
//               width={100}
//               height={100}
//             />
//           </picture>
//         </Icon>

//         <Typography variant="h4" sx={{ fontWeight: 700, color: (theme) => theme.palette.getContrastText(theme.palette.secondary.main) }}>
//           {text}
//         </Typography>
//       </Box>
//     </Paper>
//   );
// }

// export default CardButton;
"use client";

import { Box, Paper, Typography, Collapse, IconButton, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

type CardButtonProps = {
  icon: string;
  text: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  hideArrow?: boolean;
  badgeText?: string;
};

function CardButton({
  text,
  expanded,
  onToggle,
  children,
  hideArrow = false,
  badgeText,
}: CardButtonProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        my: 2,
        minHeight: "100px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #e0f7f7 0%, #b2dfdb 100%)",
        border: "1px solid #80cbc4",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        onClick={onToggle}
        sx={{ cursor: "pointer" }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {text}
          </Typography>
          {badgeText && (
            <Chip
              label={badgeText}
              size="small"
              sx={{
                mt: 0.5,
                fontWeight: 600,
                backgroundColor:
                  badgeText === "Best Value"
                    ? "#aed581"
                    : "#81d4fa",
                    // : badgeText === "Quick Access"
                    // ? "#81d4fa"
                    // : "#eeeeee",
                color:
                  badgeText === "Best Value"
                    ? "#33691e"
                    : "#01579b",
                    // : badgeText === "Quick Access"
                    // ? "#01579b"
                    // : "#333",
              }}
            />
          )}
        </Box>

        {!hideArrow && (
          <IconButton
            aria-label={expanded ? `Collapse ${text}` : `Expand ${text}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          mt={2}
          px={2}
          py={1}
          sx={{ backgroundColor: "#f0fdfd", borderRadius: "12px" }}
        >
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default CardButton;
