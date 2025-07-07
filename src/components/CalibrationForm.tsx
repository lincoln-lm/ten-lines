import { useEffect, useMemo, useState } from "react";

import {
    Autocomplete,
    Box,
    Button,
    createFilterOptions,
    Dialog,
    DialogContent,
    MenuItem,
    TextField,
} from "@mui/material";

import fetchTenLines, { fetchSeedData, frameToMS, hexSeed } from "../tenLines";
import NumericalInput from "./NumericalInput";
import RangeInput from "./RangeInput";
import { proxy } from "comlink";
import CalibrationTable from "./CalibrationTable";
import {
    type CalibrationState,
    type FRLGContiguousSeedEntry,
} from "../tenLines/generated";
import React from "react";
import { NATURES_EN } from "../tenLines/resources";
import IvEntry from "./IvEntry";
import IvCalculator from "./IvCalculator";
import StaticEncounterSelector from "./StaticEncounterSelector";

export interface CalibrationFormState {
    game: string;
    sound: string;
    buttonMode: string;
    button: string;
    heldButton: string;
    gameConsole: string;
    targetSeed: FRLGContiguousSeedEntry;
    seedLeewayString: string;
    advanceMinString: string;
    advanceMaxString: string;
    nature: number;
    ivRangeStrings: [string, string][];
    ivCalculatorText: string;
    staticCategory: number;
    staticPokemon: number;
    method: number;
}

export default function CalibrationForm({
    calibrationFormState,
    setCalibrationFormState,
    sx,
}: {
    calibrationFormState: CalibrationFormState;
    setCalibrationFormState: (
        state:
            | CalibrationFormState
            | ((state: CalibrationFormState) => CalibrationFormState)
    ) => void;
    sx?: any;
}) {
    const [rows, setRows] = useState<CalibrationState[]>([]);
    const [searching, setSearching] = useState(false);

    const [seedLeewayIsValid, setSeedLeewayIsValid] = useState(true);
    const seedLeeway = seedLeewayIsValid
        ? parseInt(calibrationFormState.seedLeewayString, 10)
        : 0;
    const [advanceRangeIsValid, setAdvanceRangeIsValid] = useState(true);
    const advanceRange = advanceRangeIsValid
        ? [
              parseInt(calibrationFormState.advanceMinString, 10),
              parseInt(calibrationFormState.advanceMaxString, 10),
          ]
        : [0, 0];
    const [ivRangesAreValid, setIvRangesAreValid] = useState(true);
    const ivRanges =
        calibrationFormState.nature == -1
            ? [
                  [0, 31],
                  [0, 31],
                  [0, 31],
                  [0, 31],
                  [0, 31],
                  [0, 31],
              ]
            : ivRangesAreValid
            ? calibrationFormState.ivRangeStrings.map((range) => [
                  parseInt(range[0], 10),
                  parseInt(range[1], 10),
              ])
            : [];

    const [seedList, setSeedList] = useState<FRLGContiguousSeedEntry[]>([]);
    const [seedDialogOpen, setSeedDialogOpen] = useState(false);

    useEffect(() => {
        const fetchSeedList = async () => {
            const seedData = await fetchSeedData(calibrationFormState.game);
            const tenLines = await fetchTenLines();
            const seedList = await tenLines.get_contiguous_seed_list(
                seedData,
                `${calibrationFormState.sound}_${calibrationFormState.buttonMode}_${calibrationFormState.button}`,
                calibrationFormState.game,
                calibrationFormState.heldButton
            );
            setSeedList(seedList);
            setCalibrationFormState((data) => ({
                ...data,
                targetSeed:
                    seedList.length > 0
                        ? seedList[Math.min(51, seedList.length - 1)]
                        : { seed: 0xdead, frame: 0 },
            }));
        };
        fetchSeedList();
    }, [
        calibrationFormState.game,
        calibrationFormState.sound,
        calibrationFormState.buttonMode,
        calibrationFormState.button,
        calibrationFormState.heldButton,
    ]);

    const targetSeedIndex = useMemo(
        () =>
            seedList.findIndex(
                (seed) =>
                    seed.initialSeed ===
                    calibrationFormState.targetSeed.initialSeed
            ),
        [seedList, calibrationFormState.targetSeed.initialSeed]
    );

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (
            seedList.length === 0 ||
            !seedLeewayIsValid ||
            !advanceRangeIsValid ||
            !ivRangesAreValid
        )
            return;
        const searchSeeds = seedList.slice(
            Math.max(0, targetSeedIndex - seedLeeway),
            Math.min(seedList.length, targetSeedIndex + seedLeeway + 1)
        );
        const submit = async () => {
            const tenLines = await fetchTenLines();
            setRows([]);
            setSearching(true);
            await tenLines.check_seeds_static(
                searchSeeds,
                advanceRange,
                calibrationFormState.staticCategory,
                calibrationFormState.staticPokemon,
                calibrationFormState.method,
                calibrationFormState.nature,
                ivRanges,
                proxy((results: CalibrationState[]) => {
                    if (rows.length > 1000) {
                        return;
                    }
                    if (results.length !== 0) {
                        setRows((rows) => [...rows, ...results]);
                    }
                }),
                proxy(setSearching)
            );
        };
        submit();
    };

    const targetSeedFilterOptions = createFilterOptions({
        limit: 100,
        // don't match based on ms
        stringify: (option: FRLGContiguousSeedEntry) =>
            `${hexSeed(option.initialSeed, 16)}`,
    });

    return (
        <Box component="form" onSubmit={handleSubmit} sx={sx}>
            <TextField
                label="Game"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        game: event.target.value,
                    }));
                }}
                value={calibrationFormState.game}
                select
                fullWidth
            >
                {/* <MenuItem value="painting">Painting Seed</MenuItem> */}
                <MenuItem value="fr">FireRed (ENG)</MenuItem>
                <MenuItem value="fr_eu">FireRed (SPA/FRE/ITA/GER)</MenuItem>
                <MenuItem value="fr_jpn_1_0">FireRed (JPN) (1.0)</MenuItem>
                <MenuItem value="fr_jpn_1_1">FireRed (JPN) (1.1)</MenuItem>
                <MenuItem value="fr_mgba">FireRed (ENG) (MGBA 10.5)</MenuItem>
                <MenuItem value="lg">LeafGreen (ENG)</MenuItem>
                <MenuItem value="lg_eu">LeafGreen (SPA/FRE/ITA/GER)</MenuItem>
                <MenuItem value="lg_jpn">LeafGreen (JPN)</MenuItem>
                <MenuItem value="lg_mgba">LeafGreen (ENG) (MGBA 10.5)</MenuItem>
            </TextField>
            <TextField
                label="Sound"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        sound: event.target.value,
                    }));
                }}
                value={calibrationFormState.sound}
                select
                fullWidth
            >
                <MenuItem value="mono">Mono</MenuItem>
                <MenuItem value="stereo">Stereo</MenuItem>
            </TextField>
            <TextField
                label="Button Mode"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        buttonMode: event.target.value,
                    }));
                }}
                value={calibrationFormState.buttonMode}
                select
                fullWidth
            >
                <MenuItem value="a">L=A</MenuItem>
                <MenuItem value="h">Help</MenuItem>
                <MenuItem value="r">LR</MenuItem>
            </TextField>
            <TextField
                label="A Button"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        button: event.target.value,
                    }));
                }}
                value={calibrationFormState.button}
                select
                fullWidth
            >
                <MenuItem value="a">A</MenuItem>
                <MenuItem value="start">Start</MenuItem>
                <MenuItem value="l">L (L=A)</MenuItem>
            </TextField>
            <TextField
                label="Held Button"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        heldButton: event.target.value,
                    }));
                }}
                value={calibrationFormState.heldButton}
                select
                fullWidth
            >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="startup_select">Startup Select</MenuItem>
                <MenuItem value="startup_a">Startup A</MenuItem>
                <MenuItem value="blackout_r">Blackout R</MenuItem>
                <MenuItem value="blackout_a">Blackout A</MenuItem>
                <MenuItem value="blackout_l">Blackout L</MenuItem>
                <MenuItem value="blackout_al">Blackout A+L</MenuItem>
            </TextField>
            <TextField
                label="Console"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        gameConsole: event.target.value,
                    }));
                }}
                value={calibrationFormState.gameConsole}
                select
                fullWidth
            >
                <MenuItem value="GBA">Game Boy Advance</MenuItem>
                <MenuItem value="GBP">Game Boy Player</MenuItem>
                <MenuItem value="NDS">Nintendo DS</MenuItem>
                <MenuItem value="3DS">Nintendo 3DS (open_agb_firm)</MenuItem>
            </TextField>
            <Autocomplete
                options={seedList}
                value={calibrationFormState.targetSeed}
                onChange={(_event, newValue) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        targetSeed: newValue as FRLGContiguousSeedEntry,
                    }));
                }}
                getOptionLabel={(item_) => {
                    const item = item_ as FRLGContiguousSeedEntry;
                    return `${hexSeed(item.initialSeed, 16)} (${frameToMS(
                        item.seedFrame,
                        calibrationFormState.gameConsole
                    )}ms)`;
                }}
                filterOptions={targetSeedFilterOptions}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Target Seed"
                        margin="normal"
                    />
                )}
                disablePortal
                disableClearable
                selectOnFocus
                fullWidth
            />
            <Box sx={{ flexDirection: "row", display: "flex" }}>
                <NumericalInput
                    label="Seed +/-"
                    margin="normal"
                    onChange={(_event, value) => {
                        setCalibrationFormState((data) => ({
                            ...data,
                            seedLeewayString: value.value,
                        }));
                        setSeedLeewayIsValid(value.isValid);
                    }}
                    value={calibrationFormState.seedLeewayString}
                    minimumValue={0}
                    maximumValue={10000}
                    isHex={false}
                    name="seedLeeway"
                />
                <Button
                    sx={{ my: 2 }}
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setSeedDialogOpen(true);
                    }}
                >
                    Show Seeds
                </Button>
                <Dialog
                    open={seedDialogOpen}
                    onClose={() => {
                        setSeedDialogOpen(false);
                    }}
                >
                    <DialogContent sx={{ minWidth: 150, textAlign: "center" }}>
                        <Box>
                            {seedList
                                .slice(
                                    Math.max(targetSeedIndex - seedLeeway, 0),
                                    Math.min(
                                        targetSeedIndex + seedLeeway + 1,
                                        seedList.length
                                    )
                                )
                                .map((seed, i) => (
                                    <div key={i}>
                                        {hexSeed(seed.initialSeed, 16)}
                                    </div>
                                ))}
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
            <RangeInput
                label="Advance"
                name="advanceRange"
                onChange={(_event, value) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        advanceMinString: value.value[0],
                        advanceMaxString: value.value[1],
                    }));
                    setAdvanceRangeIsValid(value.isValid);
                }}
                value={[
                    calibrationFormState.advanceMinString,
                    calibrationFormState.advanceMaxString,
                ]}
                minimumValue={0}
                maximumValue={999999}
            />
            <TextField
                label="Method"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        method: parseInt(event.target.value),
                    }));
                }}
                value={calibrationFormState.method}
                select
                fullWidth
            >
                <MenuItem value="1">Static 1</MenuItem>
                {/* <MenuItem value="3">Static 2</MenuItem> */}
                <MenuItem value="4">Static 4</MenuItem>
                {/* <MenuItem value="5">Wild 1</MenuItem>
                <MenuItem value="7">Wild 2</MenuItem>
                <MenuItem value="8">Wild 4</MenuItem> */}
            </TextField>
            <StaticEncounterSelector
                staticCategory={calibrationFormState.staticCategory}
                staticPokemon={calibrationFormState.staticPokemon}
                onChange={(staticCategory, staticPokemon) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        staticCategory,
                        staticPokemon,
                    }));
                }}
            />
            <TextField
                label="Nature"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        nature: parseInt(event.target.value),
                    }));
                }}
                value={calibrationFormState.nature}
                select
                fullWidth
            >
                <MenuItem value="-1">Any</MenuItem>
                {NATURES_EN.map((nature, index) => (
                    <MenuItem key={index} value={index}>
                        {nature}
                    </MenuItem>
                ))}
            </TextField>
            {calibrationFormState.nature !== -1 ? (
                <React.Fragment>
                    <IvCalculator
                        onChange={(_event, value) => {
                            setCalibrationFormState((data) => ({
                                ...data,
                                ivCalculatorText: value.value,
                            }));
                            if (value.isValid) {
                                console.log(value.calculatedValue);
                                setCalibrationFormState((data) => ({
                                    ...data,
                                    ivRangeStrings: value.calculatedValue.map(
                                        (ivRange) => [
                                            ivRange.min.toString(),
                                            ivRange.max.toString(),
                                        ]
                                    ),
                                }));
                            }
                        }}
                        calculateIVs={async (parsedLines) => {
                            const tenLines = await fetchTenLines();
                            return await tenLines.calc_ivs_static(
                                calibrationFormState.staticCategory,
                                calibrationFormState.staticPokemon,
                                parsedLines,
                                calibrationFormState.nature
                            );
                        }}
                        value={calibrationFormState.ivCalculatorText}
                    />
                    <IvEntry
                        onChange={(_event, value) => {
                            setIvRangesAreValid(value.isValid);
                            setCalibrationFormState((data) => ({
                                ...data,
                                ivRangeStrings: value.value,
                            }));
                        }}
                        value={calibrationFormState.ivRangeStrings}
                    />
                </React.Fragment>
            ) : (
                <span>IV Calculation disabled. Searching all Natures.</span>
            )}
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={searching}
                fullWidth
            >
                {searching ? "Searching..." : "Submit"}
            </Button>
            <CalibrationTable
                rows={rows}
                target={calibrationFormState.targetSeed}
                gameConsole={calibrationFormState.gameConsole}
            />
        </Box>
    );
}
