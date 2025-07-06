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
    type StaticTemplateDisplayInfo,
    type CalibrationState,
    type FRLGContiguousSeedEntry,
} from "../tenLines/generated";
import React from "react";
import { getNameEn, NATURES_EN } from "../tenLines/resources";
import IvEntry from "./IvEntry";
import IvCalculator from "./IvCalculator";

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
        targetSeed: FRLGContiguousSeedEntry;
        seedLeewayString: string;
        advanceMinString: string;
        advanceMaxString: string;
        nature: number;
        ivRangeStrings: [string, string][];
        ivCalculatorText: string;
        staticCategory: number;
        staticPokemon: number;
    }>({
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
    const [ivRangesAreValid, setIvRangesAreValid] = useState(true);
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

    const [seedList, setSeedList] = useState<FRLGContiguousSeedEntry[]>([]);
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
                        ? seedList[Math.min(51, seedList.length - 1)]
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

    const [staticTemplates, setStaticTemplates] = useState<
        StaticTemplateDisplayInfo[]
    >([]);

    useEffect(() => {
        const fetchStaticTemplates = async () => {
            const tenLines = await fetchTenLines();
            const staticTemplates = await tenLines.get_static_template_info(
                formData.staticCategory
            );
            setStaticTemplates(staticTemplates);
            setFormData((data) => ({
                ...data,
                staticPokemon:
                    staticTemplates.length > 0 ? staticTemplates[0].index : 0,
            }));
        };
        fetchStaticTemplates();
    }, [formData.staticCategory]);

    const targetSeedIndex = useMemo(
        () =>
            seedList.findIndex(
                (seed) => seed.initialSeed === formData.targetSeed.initialSeed
            ),
        [seedList, formData.targetSeed.initialSeed]
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
                formData.staticCategory,
                formData.staticPokemon,
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
                        targetSeed: newValue as FRLGContiguousSeedEntry,
                    }));
                }}
                getOptionLabel={(item_) => {
                    const item = item_ as FRLGContiguousSeedEntry;
                    return `${hexSeed(item.initialSeed, 16)} (${frameToMS(
                        item.seedFrame,
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
                label="Category"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setFormData((data) => ({
                        ...data,
                        staticCategory: parseInt(event.target.value),
                    }));
                }}
                value={formData.staticCategory}
                select
                fullWidth
            >
                <MenuItem value="0">Starters</MenuItem>
                <MenuItem value="1">Fossils</MenuItem>
                <MenuItem value="2">Gifts</MenuItem>
                <MenuItem value="3">Game Corner</MenuItem>
                <MenuItem value="4">Stationary</MenuItem>
                <MenuItem value="5">Legends</MenuItem>
                <MenuItem value="6">Events</MenuItem>
                <MenuItem value="7">Roamers</MenuItem>
            </TextField>
            <TextField
                label="Pokemon"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setFormData((data) => ({
                        ...data,
                        staticPokemon: parseInt(event.target.value),
                    }));
                }}
                value={formData.staticPokemon}
                select
                fullWidth
            >
                {staticTemplates.map((template) => (
                    <MenuItem key={template.index} value={template.index}>
                        {getNameEn(template.species, template.form)}
                    </MenuItem>
                ))}
            </TextField>
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
                {NATURES_EN.map((nature, index) => (
                    <MenuItem key={index} value={index}>
                        {nature}
                    </MenuItem>
                ))}
            </TextField>
            {formData.nature !== -1 ? (
                <React.Fragment>
                    <IvCalculator
                        onChange={(_event, value) => {
                            setFormData((data) => ({
                                ...data,
                                ivCalculatorText: value.value,
                            }));
                            if (value.isValid) {
                                console.log(value.calculatedValue);
                                setFormData((data) => ({
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
                                formData.staticCategory,
                                formData.staticPokemon,
                                parsedLines,
                                formData.nature
                            );
                        }}
                        value={formData.ivCalculatorText}
                    />
                    <IvEntry
                        onChange={(_event, value) => {
                            setIvRangesAreValid(value.isValid);
                            setFormData((data) => ({
                                ...data,
                                ivRangeStrings: value.value,
                            }));
                        }}
                        value={formData.ivRangeStrings}
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
                target={formData.targetSeed}
                gameConsole={formData.gameConsole}
            />
        </Box>
    );
}
