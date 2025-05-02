import { Box } from "@mui/material";
import { CssBaseline } from "@mui/material";
import TopBar from "./components/topBar";

export default function Home() {
  return (
    <>
      <CssBaseline />
      <Box>
        <TopBar />
      </Box>
    </>
  );
}
