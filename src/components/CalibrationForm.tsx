import { useEffect, useMemo, useState } from "react";

import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    createFilterOptions,
    Dialog,
    DialogContent,
    FormControlLabel,
    MenuItem,
    TextField,
} from "@mui/material";

import fetchTenLines, {
    fetchSeedData,
    frameToMS,
    hexSeed,
    SEED_IDENTIFIER_TO_GAME,
} from "../tenLines";
import NumericalInput from "./NumericalInput";
import RangeInput from "./RangeInput";
import { proxy } from "comlink";
import CalibrationTable from "./CalibrationTable";
import {
    type CalibrationState,
    type CalibrationWildState,
    type FRLGContiguousSeedEntry,
} from "../tenLines/generated";
import React from "react";
import { NATURES_EN } from "../tenLines/resources";
import IvEntry from "./IvEntry";
import IvCalculator from "./IvCalculator";
import StaticEncounterSelector from "./StaticEncounterSelector";
import { useSearchParams } from "react-router-dom";
import WildEncounterSelector from "./WildEncounterSelector";

export interface CalibrationFormState {
    seedLeewayString: string;
    shininess: number;
    nature: number;
    ivRangeStrings: [string, string][];
    ivCalculatorText: string;
    staticCategory: number;
    staticPokemon: number;
    wildCategory: number;
    wildLocation: number;
    wildPokemon: number;
    wildLead: number;
    shouldFilterPokemon: boolean;
    method: number;
}

export interface CalibrationURLState {
    game: string;
    sound: string;
    buttonMode: string;
    button: string;
    heldButton: string;
    gameConsole: string;
    targetInitialSeed: string;
    advanceMin: string;
    advanceMax: string;
    ttvAdvanceMin: string;
    ttvAdvanceMax: string;
    trainerID: string;
    secretID: string;
    teachyTVMode: string;
}

function useCalibrationURLState() {
    const [searchParams, setSearchParams] = useSearchParams();
    const game = searchParams.get("game") || "r_painting";
    const sound = searchParams.get("sound") || "mono";
    const buttonMode = searchParams.get("buttonMode") || "a";
    const button = searchParams.get("button") || "a";
    const heldButton = searchParams.get("heldButton") || "none";
    const gameConsole = searchParams.get("gameConsole") || "GBA";
    const advanceMin = searchParams.get("advanceMin") || "0";
    const advanceMax = searchParams.get("advanceMax") || "100";
    const ttvAdvanceMin = searchParams.get("ttvAdvanceMin") || "0";
    const ttvAdvanceMax = searchParams.get("ttvAdvanceMax") || "100";
    const trainerID = searchParams.get("trainerID") || "0";
    const secretID = searchParams.get("secretID") || "0";
    const teachyTVMode = searchParams.get("teachyTVMode") || "false";
    const targetSeedValue =
        parseInt(searchParams.get("targetInitialSeed") || "DEAD", 16) || 0xdead;
    const setCalibrationURLState = (state: Partial<CalibrationURLState>) => {
        setSearchParams((prev) => {
            for (const [key, value] of Object.entries(state)) {
                prev.set(key, value);
            }
            return prev;
        });
    };
    return {
        game,
        sound,
        buttonMode,
        button,
        heldButton,
        gameConsole,
        targetSeedValue,
        advanceMin,
        advanceMax,
        ttvAdvanceMin,
        ttvAdvanceMax,
        trainerID,
        secretID,
        teachyTVMode,
        setCalibrationURLState,
    };
}

export default function CalibrationForm({
    sx,
    hidden,
}: {
    sx?: any;
    hidden?: boolean;
}) {
    const [calibrationFormState, setCalibrationFormState] =
        useState<CalibrationFormState>({
            seedLeewayString: "20",
            shininess: 255,
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
            wildCategory: 0,
            wildLocation: 0,
            wildPokemon: 0,
            wildLead: 255,
            shouldFilterPokemon: false,
            method: 1,
        });
    const {
        game,
        sound,
        buttonMode,
        button,
        heldButton,
        gameConsole,
        targetSeedValue,
        advanceMin,
        advanceMax,
        ttvAdvanceMin,
        ttvAdvanceMax,
        trainerID,
        secretID,
        teachyTVMode,
        setCalibrationURLState,
    } = useCalibrationURLState();

    const isStatic = calibrationFormState.method <= 4;
    const isFRLG = game.startsWith("fr") || game.startsWith("lg");
    const isFRLGE = isFRLG || game.startsWith("e_");

    const [rows, setRows] = useState<
        CalibrationState[] | CalibrationWildState[]
    >([]);
    const [searching, setSearching] = useState(false);

    const [seedLeewayIsValid, setSeedLeewayIsValid] = useState(true);
    const seedLeeway = seedLeewayIsValid
        ? parseInt(calibrationFormState.seedLeewayString, 10)
        : 0;
    const [advanceRangeIsValid, setAdvanceRangeIsValid] = useState(true);
    const advanceRange = advanceRangeIsValid
        ? [parseInt(advanceMin, 10), parseInt(advanceMax, 10)]
        : [0, 0];
    const isTeachyTVMode = teachyTVMode === "true" && isFRLG;
    const [ttvAdvanceRangeIsValid, setTTVAdvanceRangeIsValid] = useState(true);
    const ttvAdvanceRange = !isTeachyTVMode
        ? [0, 0]
        : ttvAdvanceRangeIsValid
        ? [parseInt(ttvAdvanceMin, 10), parseInt(ttvAdvanceMax, 10)]
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

    const [trainerIDIsValid, setTrainerIDIsValid] = useState(true);
    const [secretIDIsValid, setSecretIDIsValid] = useState(true);

    const [seedList, setSeedList] = useState<FRLGContiguousSeedEntry[]>([]);
    const [seedDialogOpen, setSeedDialogOpen] = useState(false);

    const isNotSubmittable =
        searching ||
        seedList.length === 0 ||
        !trainerIDIsValid ||
        !secretIDIsValid ||
        !seedLeewayIsValid ||
        !advanceRangeIsValid ||
        (isTeachyTVMode && !ttvAdvanceRangeIsValid) ||
        !ivRangesAreValid;

    useEffect(() => {
        const fetchSeedList = async () => {
            if (!isFRLG) {
                setSeedList(
                    [...Array(0x10000).keys()].map((seed) => ({
                        initialSeed: seed,
                        seedFrame: seed,
                    }))
                );
                return;
            }
            const seedData = await fetchSeedData(game);
            const tenLines = await fetchTenLines();
            const seedList = await tenLines.get_contiguous_seed_list(
                seedData,
                `${sound}_${buttonMode}_${button}`,
                game,
                heldButton
            );
            setSeedList(seedList);
            if (
                seedList.findIndex(
                    (seed: FRLGContiguousSeedEntry) =>
                        seed.initialSeed === targetSeedValue
                ) == -1
            ) {
                setCalibrationURLState({
                    targetInitialSeed: hexSeed(
                        seedList.length > 0
                            ? seedList[Math.min(51, seedList.length - 1)]
                                  .initialSeed
                            : 0xdead,
                        16
                    ),
                });
            }
        };
        fetchSeedList();
    }, [game, sound, buttonMode, button, heldButton]);

    const targetSeedIndex = useMemo(
        () =>
            seedList.findIndex((seed) => seed.initialSeed === targetSeedValue),
        [seedList, targetSeedValue]
    );

    const targetSeed: FRLGContiguousSeedEntry =
        targetSeedIndex === -1
            ? { initialSeed: 0xdead, seedFrame: 0 }
            : seedList[targetSeedIndex];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isNotSubmittable) return;
        const searchSeeds = seedList.slice(
            Math.max(0, targetSeedIndex - seedLeeway),
            Math.min(seedList.length, targetSeedIndex + seedLeeway + 1)
        );
        const submit = async () => {
            const tenLines = await fetchTenLines();
            setRows([]);
            setSearching(true);
            if (isStatic) {
                await tenLines.check_seeds_static(
                    searchSeeds,
                    advanceRange,
                    ttvAdvanceRange,
                    parseInt(trainerID),
                    parseInt(secretID),
                    calibrationFormState.staticCategory,
                    calibrationFormState.staticPokemon,
                    calibrationFormState.method,
                    calibrationFormState.shininess,
                    calibrationFormState.nature,
                    ivRanges,
                    proxy((results: CalibrationState[]) => {
                        setRows((rows) => {
                            if (rows.length > 1000 || results.length === 0) {
                                return rows;
                            }
                            return [...rows, ...results];
                        });
                    }),
                    proxy(setSearching)
                );
            } else {
                await tenLines.check_seeds_wild(
                    searchSeeds,
                    advanceRange,
                    ttvAdvanceRange,
                    parseInt(trainerID),
                    parseInt(secretID),
                    SEED_IDENTIFIER_TO_GAME[game],
                    calibrationFormState.wildCategory,
                    calibrationFormState.wildLocation,
                    !calibrationFormState.shouldFilterPokemon
                        ? -1
                        : calibrationFormState.wildPokemon,
                    calibrationFormState.method,
                    calibrationFormState.wildLead,
                    calibrationFormState.shininess,
                    calibrationFormState.nature,
                    ivRanges,
                    proxy((results: CalibrationWildState[]) => {
                        setRows((rows) => {
                            if (rows.length > 1000 || results.length === 0) {
                                return rows;
                            }
                            return [...rows, ...results];
                        });
                    }),
                    proxy(setSearching)
                );
            }
        };
        submit();
    };

    const targetSeedFilterOptions = createFilterOptions({
        limit: 100,
        // don't match based on ms
        stringify: (option: FRLGContiguousSeedEntry) =>
            `${hexSeed(option.initialSeed, 16)}`,
    });

    if (calibrationFormState.staticCategory == 3 && !isFRLG) {
        calibrationFormState.staticCategory = 0;
        setCalibrationFormState(calibrationFormState);
    }
    if (calibrationFormState.staticCategory == 6 && !isFRLGE) {
        calibrationFormState.staticCategory = 0;
        setCalibrationFormState(calibrationFormState);
    }

    if (hidden) {
        return null;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ sx }}>
            <TextField
                label="Game"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) =>
                    setCalibrationURLState({
                        game: event.target.value,
                    })
                }
                value={game}
                select
                fullWidth
            >
                <MenuItem value="r_painting">Ruby Painting Seed</MenuItem>
                <MenuItem value="s_painting">Sapphire Painting Seed</MenuItem>
                <MenuItem value="e_painting">Emerald Painting Seed</MenuItem>
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
            {isFRLG && (
                <React.Fragment>
                    <TextField
                        label="Sound"
                        margin="normal"
                        style={{ textAlign: "left" }}
                        onChange={(event) =>
                            setCalibrationURLState({
                                sound: event.target.value,
                            })
                        }
                        value={sound}
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
                        onChange={(event) =>
                            setCalibrationURLState({
                                buttonMode: event.target.value,
                            })
                        }
                        value={buttonMode}
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
                        onChange={(event) =>
                            setCalibrationURLState({
                                button: event.target.value,
                            })
                        }
                        value={button}
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
                        onChange={(event) =>
                            setCalibrationURLState({
                                heldButton: event.target.value,
                            })
                        }
                        value={heldButton}
                        select
                        fullWidth
                    >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="startup_select">
                            Startup Select
                        </MenuItem>
                        <MenuItem value="startup_a">Startup A</MenuItem>
                        <MenuItem value="blackout_r">Blackout R</MenuItem>
                        <MenuItem value="blackout_a">Blackout A</MenuItem>
                        <MenuItem value="blackout_l">Blackout L</MenuItem>
                        <MenuItem value="blackout_al">Blackout A+L</MenuItem>
                    </TextField>
                </React.Fragment>
            )}

            <TextField
                label="Console"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) =>
                    setCalibrationURLState({
                        gameConsole: event.target.value,
                    })
                }
                value={gameConsole}
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
                value={targetSeed}
                onChange={(_event, newValue) => {
                    setCalibrationURLState({
                        targetInitialSeed: hexSeed(newValue.initialSeed, 16),
                    });
                }}
                getOptionLabel={(item_) => {
                    const item = item_ as FRLGContiguousSeedEntry;
                    return `${hexSeed(item.initialSeed, 16)} (${frameToMS(
                        item.seedFrame,
                        gameConsole
                    )}ms)`;
                }}
                filterOptions={targetSeedFilterOptions}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Target Seed"
                        margin="normal"
                        error={seedList.length === 0}
                        helperText={
                            seedList.length === 0
                                ? "No known seeds for this game & settings"
                                : undefined
                        }
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
                label={isTeachyTVMode ? "Final A Press Frame" : "Advances"}
                name="advanceRange"
                onChange={(_event, value) => {
                    setCalibrationURLState({
                        advanceMin: value.value[0],
                        advanceMax: value.value[1],
                    });
                    setAdvanceRangeIsValid(value.isValid);
                }}
                value={[advanceMin, advanceMax]}
                minimumValue={0}
                maximumValue={999999}
            />
            {isTeachyTVMode && (
                <RangeInput
                    label="TeachyTV Advances"
                    name="ttvRange"
                    onChange={(_event, value) => {
                        setCalibrationURLState({
                            ttvAdvanceMin: value.value[0],
                            ttvAdvanceMax: value.value[1],
                        });
                        setTTVAdvanceRangeIsValid(value.isValid);
                    }}
                    value={[ttvAdvanceMin, ttvAdvanceMax]}
                    minimumValue={0}
                    maximumValue={999999}
                />
            )}
            {isFRLG && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isTeachyTVMode}
                            onChange={(e) => {
                                setCalibrationURLState({
                                    teachyTVMode: e.target.checked.toString(),
                                });
                            }}
                        />
                    }
                    label="TeachyTV Mode"
                />
            )}
            <Box sx={{ flexDirection: "row", display: "flex" }}>
                <NumericalInput
                    label="Trainer ID"
                    margin="normal"
                    onChange={(_event, value) => {
                        setCalibrationURLState({ trainerID: value.value });
                        setTrainerIDIsValid(value.isValid);
                    }}
                    value={trainerID}
                    minimumValue={0}
                    maximumValue={65535}
                    isHex={false}
                    name="trainerID"
                />
                <span
                    style={{
                        margin: "0 10px",
                        alignSelf: "center",
                    }}
                >
                    /
                </span>
                <NumericalInput
                    label="Secret ID"
                    margin="normal"
                    onChange={(_event, value) => {
                        setCalibrationURLState({ secretID: value.value });
                        setSecretIDIsValid(value.isValid);
                    }}
                    value={secretID}
                    minimumValue={0}
                    maximumValue={65535}
                    isHex={false}
                    name="secretID"
                />
            </Box>
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
                <MenuItem value="5">Wild 1</MenuItem>
                <MenuItem value="7">Wild 2</MenuItem>
                <MenuItem value="8">Wild 4</MenuItem>
            </TextField>
            {isStatic && (
                <StaticEncounterSelector
                    staticCategory={calibrationFormState.staticCategory}
                    staticPokemon={calibrationFormState.staticPokemon}
                    game={SEED_IDENTIFIER_TO_GAME[game]}
                    onChange={(staticCategory, staticPokemon) => {
                        setCalibrationFormState((data) => ({
                            ...data,
                            staticCategory,
                            staticPokemon,
                        }));
                    }}
                />
            )}
            {!isStatic && (
                <WildEncounterSelector
                    wildCategory={calibrationFormState.wildCategory}
                    wildLocation={calibrationFormState.wildLocation}
                    wildPokemon={calibrationFormState.wildPokemon}
                    wildLead={calibrationFormState.wildLead}
                    shouldFilterPokemon={
                        calibrationFormState.shouldFilterPokemon
                    }
                    game={SEED_IDENTIFIER_TO_GAME[game]}
                    onChange={(
                        wildCategory,
                        wildLocation,
                        wildPokemon,
                        wildLead,
                        shouldFilterPokemon
                    ) => {
                        setCalibrationFormState((data) => ({
                            ...data,
                            wildCategory,
                            wildLocation,
                            wildPokemon,
                            wildLead,
                            shouldFilterPokemon,
                        }));
                    }}
                />
            )}
            <TextField
                label="Shininess"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setCalibrationFormState((data) => ({
                        ...data,
                        shininess: parseInt(event.target.value),
                    }));
                }}
                value={calibrationFormState.shininess}
                select
                fullWidth
            >
                <MenuItem value="255">Any</MenuItem>
                <MenuItem value="1">Star</MenuItem>
                <MenuItem value="2">Square</MenuItem>
                <MenuItem value="3">Star/Square</MenuItem>
            </TextField>
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
                            if (isStatic) {
                                return await tenLines.calc_ivs_static(
                                    calibrationFormState.staticCategory,
                                    calibrationFormState.staticPokemon,
                                    parsedLines,
                                    calibrationFormState.nature
                                );
                            }
                            return await tenLines.calc_ivs_generic(
                                calibrationFormState.wildPokemon & 0x7ff,
                                calibrationFormState.wildPokemon >> 11,
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
                disabled={isNotSubmittable}
                fullWidth
            >
                {searching ? "Searching..." : "Submit"}
            </Button>
            <CalibrationTable
                rows={rows}
                target={targetSeed}
                gameConsole={gameConsole}
                isStatic={isStatic}
                isTeachyTVMode={isTeachyTVMode}
            />
        </Box>
    );
}
