import { useEffect, useMemo, useState } from "react";

import {
    Autocomplete,
    Box,
    Button,
    createFilterOptions,
    Dialog,
    DialogContent,
    FormLabel,
    MenuItem,
    TextField,
} from "@mui/material";

import fetchTenLines, { fetchSeedData, frameToMS, hexSeed } from "../tenLines";
import NumericalInput from "./NumericalInput";
import RangeInput from "./RangeInput";
import { proxy } from "comlink";
import CalibrationTable from "./CalibrationTable";
import type { CalibrationState } from "../tenLines/generated";
import React from "react";

interface SeedListEntry {
    seed: number;
    frame: number;
}

export default function CalibrationForm({ sx }: { sx?: any }) {
    const [rows, setRows] = useState<CalibrationState[]>([]);
    const [searching, setSearching] = useState(false);
    const [formData, setFormData] = useState<{
        game: string;
        sound: string;
        buttonMode: string;
        button: string;
        heldButton: string;
        gameConsole: string;
        targetSeed: SeedListEntry;
        seedLeewayString: string;
        advanceMinString: string;
        advanceMaxString: string;
        nature: number;
        ivRangeStrings: [string, string][];
    }>({
        game: "fr",
        sound: "mono",
        buttonMode: "a",
        button: "a",
        heldButton: "none",
        gameConsole: "GBA",
        targetSeed: { seed: 0xdead, frame: 0 },
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
    });

    const [seedLeewayIsValid, setSeedLeewayIsValid] = useState(true);
    const seedLeeway = seedLeewayIsValid
        ? parseInt(formData.seedLeewayString, 10)
        : 0;
    const [advanceRangeIsValid, setAdvanceRangeIsValid] = useState(true);
    const advanceRange = advanceRangeIsValid
        ? [
              parseInt(formData.advanceMinString, 10),
              parseInt(formData.advanceMaxString, 10),
          ]
        : [0, 0];
    const [hpRangeIsValid, setHpRangeIsValid] = useState(true);
    const [atkRangeIsValid, setAtkRangeIsValid] = useState(true);
    const [defRangeIsValid, setDefRangeIsValid] = useState(true);
    const [spaRangeIsValid, setSpaRangeIsValid] = useState(true);
    const [spdRangeIsValid, setSpdRangeIsValid] = useState(true);
    const [speRangeIsValid, setSpeRangeIsValid] = useState(true);
    const ivRangesAreValid =
        hpRangeIsValid &&
        atkRangeIsValid &&
        defRangeIsValid &&
        spaRangeIsValid &&
        spdRangeIsValid &&
        speRangeIsValid;
    const ivRanges =
        formData.nature == -1
            ? [
                  [0, 31],
                  [0, 31],
                  [0, 31],
                  [0, 31],
                  [0, 31],
                  [0, 31],
              ]
            : ivRangesAreValid
            ? formData.ivRangeStrings.map((range) => [
                  parseInt(range[0], 10),
                  parseInt(range[1], 10),
              ])
            : [];

    const [seedList, setSeedList] = useState<SeedListEntry[]>([]);
    const [seedDialogOpen, setSeedDialogOpen] = useState(false);

    useEffect(() => {
        const fetchSeedList = async () => {
            const seedData = await fetchSeedData(formData.game);
            const tenLines = await fetchTenLines();
            const seedList = await tenLines.get_contiguous_seed_list(
                seedData,
                `${formData.sound}_${formData.buttonMode}_${formData.button}`,
                formData.game,
                formData.heldButton
            );
            setSeedList(seedList);
            setFormData((data) => ({
                ...data,
                targetSeed:
                    seedList.length > 0
                        ? seedList[0]
                        : { seed: 0xdead, frame: 0 },
            }));
        };
        fetchSeedList();
    }, [
        formData.game,
        formData.sound,
        formData.buttonMode,
        formData.button,
        formData.heldButton,
    ]);

    const targetSeedIndex = useMemo(
        () =>
            seedList.findIndex(
                (seed) => seed.seed === formData.targetSeed.seed
            ),
        [seedList, formData.targetSeed.seed]
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
            await tenLines.check_seeds(
                searchSeeds,
                advanceRange,
                formData.nature,
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
        stringify: (option: SeedListEntry) => `${hexSeed(option.seed, 16)}`,
    });

    return (
        <Box component="form" onSubmit={handleSubmit} sx={sx}>
            <TextField
                label="Game"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setFormData((data) => ({
                        ...data,
                        game: event.target.value,
                    }));
                }}
                value={formData.game}
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
                    setFormData((data) => ({
                        ...data,
                        sound: event.target.value,
                    }));
                }}
                value={formData.sound}
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
                    setFormData((data) => ({
                        ...data,
                        buttonMode: event.target.value,
                    }));
                }}
                value={formData.buttonMode}
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
                    setFormData((data) => ({
                        ...data,
                        button: event.target.value,
                    }));
                }}
                value={formData.button}
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
                    setFormData((data) => ({
                        ...data,
                        heldButton: event.target.value,
                    }));
                }}
                value={formData.heldButton}
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
                    setFormData((data) => ({
                        ...data,
                        gameConsole: event.target.value,
                    }));
                }}
                value={formData.gameConsole}
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
                value={formData.targetSeed}
                onChange={(_event, newValue) => {
                    setFormData((data) => ({
                        ...data,
                        targetSeed: newValue as SeedListEntry,
                    }));
                }}
                getOptionLabel={(item_) => {
                    const item = item_ as SeedListEntry;
                    return `${hexSeed(item.seed, 16)} (${frameToMS(
                        item.frame,
                        formData.gameConsole
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
                        setFormData((data) => ({
                            ...data,
                            seedLeewayString: value.value,
                        }));
                        setSeedLeewayIsValid(value.isValid);
                    }}
                    value={formData.seedLeewayString}
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
                                    <div key={i}>{hexSeed(seed.seed, 16)}</div>
                                ))}
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
            <RangeInput
                label="Advance"
                name="advanceRange"
                onChange={(_event, value) => {
                    setFormData((data) => ({
                        ...data,
                        advanceMinString: value.value[0],
                        advanceMaxString: value.value[1],
                    }));
                    setAdvanceRangeIsValid(value.isValid);
                }}
                value={[formData.advanceMinString, formData.advanceMaxString]}
                minimumValue={0}
                maximumValue={999999}
            />
            <TextField
                label="Nature"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setFormData((data) => ({
                        ...data,
                        nature: parseInt(event.target.value),
                    }));
                }}
                value={formData.nature}
                select
                fullWidth
            >
                <MenuItem value="-1">Any</MenuItem>
                <MenuItem value="0">Hardy</MenuItem>
                <MenuItem value="1">Lonely</MenuItem>
                <MenuItem value="2">Brave</MenuItem>
                <MenuItem value="3">Adamant</MenuItem>
                <MenuItem value="4">Naughty</MenuItem>
                <MenuItem value="5">Bold</MenuItem>
                <MenuItem value="6">Docile</MenuItem>
                <MenuItem value="7">Relaxed</MenuItem>
                <MenuItem value="8">Impish</MenuItem>
                <MenuItem value="9">Lax</MenuItem>
                <MenuItem value="10">Timid</MenuItem>
                <MenuItem value="11">Hasty</MenuItem>
                <MenuItem value="12">Serious</MenuItem>
                <MenuItem value="13">Jolly</MenuItem>
                <MenuItem value="14">Naive</MenuItem>
                <MenuItem value="15">Modest</MenuItem>
                <MenuItem value="16">Mild</MenuItem>
                <MenuItem value="17">Quiet</MenuItem>
                <MenuItem value="18">Bashful</MenuItem>
                <MenuItem value="19">Rash</MenuItem>
                <MenuItem value="20">Calm</MenuItem>
                <MenuItem value="21">Gentle</MenuItem>
                <MenuItem value="22">Sassy</MenuItem>
                <MenuItem value="23">Careful</MenuItem>
                <MenuItem value="24">Quirky</MenuItem>
            </TextField>
            {formData.nature !== -1 ? (
                <React.Fragment>
                    <RangeInput
                        label="HP"
                        name="hpRange"
                        onChange={(_event, value) => {
                            setFormData((data) => {
                                return {
                                    ...data,
                                    ivRangeStrings: [
                                        value.value,
                                        data.ivRangeStrings[1],
                                        data.ivRangeStrings[2],
                                        data.ivRangeStrings[3],
                                        data.ivRangeStrings[4],
                                        data.ivRangeStrings[5],
                                    ],
                                };
                            });
                            setHpRangeIsValid(value.isValid);
                        }}
                        value={formData.ivRangeStrings[0]}
                        minimumValue={0}
                        maximumValue={31}
                    />
                    <RangeInput
                        label="Attack"
                        name="atkRange"
                        onChange={(_event, value) => {
                            setFormData((data) => {
                                return {
                                    ...data,
                                    ivRangeStrings: [
                                        data.ivRangeStrings[0],
                                        value.value,
                                        data.ivRangeStrings[2],
                                        data.ivRangeStrings[3],
                                        data.ivRangeStrings[4],
                                        data.ivRangeStrings[5],
                                    ],
                                };
                            });
                            setAtkRangeIsValid(value.isValid);
                        }}
                        value={formData.ivRangeStrings[1]}
                        minimumValue={0}
                        maximumValue={31}
                    />
                    <RangeInput
                        label="Defense"
                        name="defRange"
                        onChange={(_event, value) => {
                            setFormData((data) => {
                                return {
                                    ...data,
                                    ivRangeStrings: [
                                        data.ivRangeStrings[0],
                                        data.ivRangeStrings[1],
                                        value.value,
                                        data.ivRangeStrings[3],
                                        data.ivRangeStrings[4],
                                        data.ivRangeStrings[5],
                                    ],
                                };
                            });
                            setDefRangeIsValid(value.isValid);
                        }}
                        value={formData.ivRangeStrings[2]}
                        minimumValue={0}
                        maximumValue={31}
                    />
                    <RangeInput
                        label="Special Attack"
                        name="spaRange"
                        onChange={(_event, value) => {
                            setFormData((data) => {
                                return {
                                    ...data,
                                    ivRangeStrings: [
                                        data.ivRangeStrings[0],
                                        data.ivRangeStrings[1],
                                        data.ivRangeStrings[2],
                                        value.value,
                                        data.ivRangeStrings[4],
                                        data.ivRangeStrings[5],
                                    ],
                                };
                            });
                            setSpaRangeIsValid(value.isValid);
                        }}
                        value={formData.ivRangeStrings[3]}
                        minimumValue={0}
                        maximumValue={31}
                    />
                    <RangeInput
                        label="Special Defense"
                        name="spdRange"
                        onChange={(_event, value) => {
                            setFormData((data) => {
                                return {
                                    ...data,
                                    ivRangeStrings: [
                                        data.ivRangeStrings[0],
                                        data.ivRangeStrings[1],
                                        data.ivRangeStrings[2],
                                        data.ivRangeStrings[3],
                                        value.value,
                                        data.ivRangeStrings[5],
                                    ],
                                };
                            });
                            setSpdRangeIsValid(value.isValid);
                        }}
                        value={formData.ivRangeStrings[4]}
                        minimumValue={0}
                        maximumValue={31}
                    />
                    <RangeInput
                        label="Speed"
                        name="speRange"
                        onChange={(_event, value) => {
                            setFormData((data) => {
                                return {
                                    ...data,
                                    ivRangeStrings: [
                                        data.ivRangeStrings[0],
                                        data.ivRangeStrings[1],
                                        data.ivRangeStrings[2],
                                        data.ivRangeStrings[3],
                                        data.ivRangeStrings[4],
                                        value.value,
                                    ],
                                };
                            });
                            setSpeRangeIsValid(value.isValid);
                        }}
                        value={formData.ivRangeStrings[5]}
                        minimumValue={0}
                        maximumValue={31}
                    />
                </React.Fragment>
            ) : (
                <FormLabel>
                    IV Calculation disabled. Searching all Natures.
                </FormLabel>
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
                target={formData.targetSeed}
                gameConsole={formData.gameConsole}
            />
        </Box>
    );
}
