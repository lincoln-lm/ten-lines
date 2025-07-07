import "./App.css";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import TenLinesForm, {
    type TenLinesFormState,
} from "./components/TenLinesForm";
import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import CalibrationForm, {
    type CalibrationFormState,
} from "./components/CalibrationForm";
import FrLgSeedsTimestamp from "./wasm/src/generated/frlg_seeds_timestamp.txt?raw";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

function App() {
    const [currentPage, setCurrentPage] = useState(0);

    const [tenLinesFormState, setTenLinesFormState] =
        useState<TenLinesFormState>({
            targetSeed: "DEADBEEF",
            targetSeedIsValid: true,
            count: "10",
            countIsValid: true,
            game: "painting",
            gameConsole: "GBA",
        });

    const [calibrationState, setCalibrationState] =
        useState<CalibrationFormState>({
            game: "fr",
            sound: "mono",
            buttonMode: "a",
            button: "a",
            heldButton: "none",
            gameConsole: "GBA",
            targetSeed: { initialSeed: 0xdead, seedFrame: 0 },
            seedLeewayString: "20",
            advanceMinString: "0",
            advanceMaxString: "100",
            nature: -1,
            ivRangeStrings: [
                ["0", "31"],
                ["0", "31"],
                ["0", "31"],
                ["0", "31"],
                ["0", "31"],
                ["0", "31"],
            ],
            ivCalculatorText: "",
            staticCategory: 0,
            staticPokemon: 0,
            method: 1,
        });

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
                    <Tab label="Calibration" value={1} />
                </Tabs>
                {currentPage === 0 && (
                    <TenLinesForm
                        tenLinesFormState={tenLinesFormState}
                        setTenLinesFormState={setTenLinesFormState}
                        sx={{ maxWidth: 1000 }}
                    />
                )}
                {currentPage === 1 && (
                    <CalibrationForm
                        calibrationFormState={calibrationState}
                        setCalibrationFormState={setCalibrationState}
                        sx={{ maxWidth: 1000 }}
                    />
                )}
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
