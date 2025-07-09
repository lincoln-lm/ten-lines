import { useState } from "react";

import { Box, Button, MenuItem, TextField } from "@mui/material";

import fetchTenLines, { SEED_IDENTIFIER_TO_GAME } from "../tenLines";
import NumericalInput from "./NumericalInput";
import { proxy } from "comlink";
import {
    type G3SearcherState,
    type G3WildSearcherState,
} from "../tenLines/generated";
import React from "react";
import { NATURES_EN } from "../tenLines/resources";
import IvEntry from "./IvEntry";
import StaticEncounterSelector from "./StaticEncounterSelector";
import { useSearchParams } from "react-router-dom";
import WildEncounterSelector from "./WildEncounterSelector";
import SearcherTable from "./SearcherTable";

export interface SearcherFormState {
    shininess: number;
    nature: number;
    ivRangeStrings: [string, string][];
    staticCategory: number;
    staticPokemon: number;
    wildCategory: number;
    wildLocation: number;
    wildPokemon: number;
    wildLead: number;
    method: number;
}

export interface SearcherURLState {
    game: string;
    trainerID: string;
    secretID: string;
}

function useSearcherURLState() {
    const [searchParams, setSearchParams] = useSearchParams();
    const game = searchParams.get("game") || "r_painting";
    const trainerID = searchParams.get("trainerID") || "0";
    const secretID = searchParams.get("secretID") || "0";
    const setSearcherURLState = (state: Partial<SearcherURLState>) => {
        setSearchParams((prev) => {
            for (const [key, value] of Object.entries(state)) {
                prev.set(key, value);
            }
            return prev;
        });
    };
    return {
        game,
        trainerID,
        secretID,
        setSearcherURLState,
    };
}

export default function CalibrationForm({ sx }: { sx?: any }) {
    const [searcherFormState, setSearcherFormState] =
        useState<SearcherFormState>({
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
            staticCategory: 0,
            staticPokemon: 0,
            wildCategory: 0,
            wildLocation: 0,
            wildPokemon: 0,
            wildLead: 255,
            method: 1,
        });
    const { game, trainerID, secretID, setSearcherURLState } =
        useSearcherURLState();

    const [rows, setRows] = useState<G3SearcherState[]>([]);
    const [searching, setSearching] = useState(false);

    const [ivRangesAreValid, setIvRangesAreValid] = useState(true);
    const ivRanges = ivRangesAreValid
        ? searcherFormState.ivRangeStrings.map((range) => [
              parseInt(range[0], 10),
              parseInt(range[1], 10),
          ])
        : [];

    const [trainerIDIsValid, setTrainerIDIsValid] = useState(true);
    const [secretIDIsValid, setSecretIDIsValid] = useState(true);

    const isNotSubmittable =
        searching || !trainerIDIsValid || !secretIDIsValid || !ivRangesAreValid;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isNotSubmittable) return;
        const submit = async () => {
            const tenLines = await fetchTenLines();
            setRows([]);
            setSearching(true);
            if (isStatic) {
                await tenLines.search_seeds_static(
                    parseInt(trainerID),
                    parseInt(secretID),
                    searcherFormState.staticCategory,
                    searcherFormState.staticPokemon,
                    searcherFormState.method,
                    searcherFormState.shininess,
                    searcherFormState.nature,
                    ivRanges,
                    proxy((results: G3SearcherState[]) => {
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
                await tenLines.search_seeds_wild(
                    parseInt(trainerID),
                    parseInt(secretID),
                    SEED_IDENTIFIER_TO_GAME[game],
                    searcherFormState.wildCategory,
                    searcherFormState.wildLocation,
                    searcherFormState.wildPokemon,
                    searcherFormState.method,
                    searcherFormState.wildLead,
                    searcherFormState.shininess,
                    searcherFormState.nature,
                    ivRanges,
                    proxy((results: G3WildSearcherState[]) => {
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

    const isStatic = searcherFormState.method <= 4;
    const isFRLG = game.startsWith("fr") || game.startsWith("lg");
    const isFRLGE = isFRLG || game.startsWith("e_");

    if (searcherFormState.staticCategory == 3 && !isFRLG) {
        searcherFormState.staticCategory = 0;
        setSearcherFormState(searcherFormState);
    }
    if (searcherFormState.staticCategory == 6 && !isFRLGE) {
        searcherFormState.staticCategory = 0;
        setSearcherFormState(searcherFormState);
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={sx}>
            <TextField
                label="Game"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) =>
                    setSearcherURLState({
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
            <Box sx={{ flexDirection: "row", display: "flex" }}>
                <NumericalInput
                    label="Trainer ID"
                    margin="normal"
                    onChange={(_event, value) => {
                        setSearcherURLState({ trainerID: value.value });
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
                        setSearcherURLState({ secretID: value.value });
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
                    setSearcherFormState((data) => ({
                        ...data,
                        method: parseInt(event.target.value),
                    }));
                }}
                value={searcherFormState.method}
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
                    staticCategory={searcherFormState.staticCategory}
                    staticPokemon={searcherFormState.staticPokemon}
                    game={SEED_IDENTIFIER_TO_GAME[game]}
                    onChange={(staticCategory, staticPokemon) => {
                        setSearcherFormState((data) => ({
                            ...data,
                            staticCategory,
                            staticPokemon,
                        }));
                    }}
                />
            )}
            {!isStatic && (
                <WildEncounterSelector
                    wildCategory={searcherFormState.wildCategory}
                    wildLocation={searcherFormState.wildLocation}
                    wildPokemon={searcherFormState.wildPokemon}
                    wildLead={searcherFormState.wildLead}
                    game={SEED_IDENTIFIER_TO_GAME[game]}
                    onChange={(
                        wildCategory,
                        wildLocation,
                        wildPokemon,
                        wildLead,
                        _
                    ) => {
                        setSearcherFormState((data) => ({
                            ...data,
                            wildCategory,
                            wildLocation,
                            wildPokemon,
                            wildLead,
                        }));
                    }}
                    shouldFilterPokemon={true}
                    allowAnyPokemon
                    isSearcher
                />
            )}
            <TextField
                label="Shininess"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setSearcherFormState((data) => ({
                        ...data,
                        shininess: parseInt(event.target.value),
                    }));
                }}
                value={searcherFormState.shininess}
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
                    setSearcherFormState((data) => ({
                        ...data,
                        nature: parseInt(event.target.value),
                    }));
                }}
                value={searcherFormState.nature}
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
            <IvEntry
                onChange={(_event, value) => {
                    setIvRangesAreValid(value.isValid);
                    setSearcherFormState((data) => ({
                        ...data,
                        ivRangeStrings: value.value,
                    }));
                }}
                value={searcherFormState.ivRangeStrings}
            />
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isNotSubmittable}
                fullWidth
            >
                {searching ? "Searching..." : "Submit"}
            </Button>
            <SearcherTable rows={rows} isStatic={isStatic} />
        </Box>
    );
}
