import "./App.css";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import TenLinesForm from "./components/TenLinesForm";
import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
// import CalibrationForm from "./components/CalibrationForm";
import FrLgSeedsTimestamp from "./wasm/src/generated/frlg_seeds_timestamp.txt?raw";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

function App() {
    const [currentPage, setCurrentPage] = useState(0);
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box>
                <Tabs
                    value={currentPage}
                    onChange={(_, newValue) => setCurrentPage(newValue)}
                    variant="fullWidth"
                >
                    <Tab label="Initial Seed" value={0} />
                    {/* <Tab label="Calibration" value={1} /> */}
                </Tabs>
                <TenLinesForm
                    sx={
                        currentPage !== 0
                            ? { display: "none" }
                            : { maxWidth: 1000 }
                    }
                />
                {/* <CalibrationForm
                    sx={currentPage !== 1 ? { display: "none" } : {}}
                /> */}
            </Box>

            <footer>
                Original "10 lines" was created by Shao, FRLG seeds farmed by
                blisy, po, HunarPG, and トノ
                <br />
                Powered by{" "}
                <a href="https://github.com/Admiral-Fish/PokeFinder">
                    PokeFinderCore
                </a>
                <br />
                FRLG seed data as of {FrLgSeedsTimestamp}
            </footer>
        </ThemeProvider>
    );
}

export default App;
