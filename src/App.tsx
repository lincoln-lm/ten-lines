import "./App.css";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import InitialSeedForm from "./components/InitialSeedForm";
import SearcherForm from "./components/SearcherForm";
import { Box, Tab, Tabs } from "@mui/material";
import CalibrationForm from "./components/CalibrationForm";
import FrLgSeedsTimestamp from "./wasm/src/generated/frlg_seeds_timestamp.txt?raw";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import BingoPage, { getBingoActive } from "./components/BingoPage";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

function TenLinesPages() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "0") ?? 0;
    const bingoActive = getBingoActive();

    const pages = [
        <InitialSeedForm
            key={0}
            sx={{ maxWidth: 1100, minWidth: 1100, width: 1100 }}
            hidden={currentPage != 0}
        />,
        <CalibrationForm
            key={1}
            sx={{ maxWidth: 1100, minWidth: 1100, width: 1100 }}
            hidden={currentPage != 1}
        />,
        <SearcherForm
            key={2}
            sx={{ maxWidth: 1100, minWidth: 1100, width: 1100 }}
            hidden={currentPage != 2}
        />,
        bingoActive && <BingoPage key={3} hidden={currentPage != 3} />,
    ];

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box>
                <Tabs
                    value={currentPage}
                    onChange={(_, newValue) => {
                        setSearchParams((prev) => {
                            prev.set("page", newValue);
                            return prev;
                        });
                    }}
                    variant="fullWidth"
                >
                    <Tab label="Searcher" value={2} />
                    <Tab label="Initial Seed" value={0} />
                    <Tab label="Calibration" value={1} />
                    {bingoActive && <Tab label="Bingo" value={3} />}
                </Tabs>
                {pages}
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

function App() {
    return (
        <BrowserRouter>
            <TenLinesPages />
        </BrowserRouter>
    );
}

export default App;
