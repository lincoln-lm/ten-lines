import { proxy } from "comlink";
import { useState } from "react";

import { Box, Button, MenuItem, TextField } from "@mui/material";

import fetchTenLines, { fetchSeedData, hexSeed } from "../tenLines";
import NumericalInput from "./NumericalInput";
import InitialSeedTable from "./InitialSeedTable";
import type { InitialSeedResult } from "../tenLines/generated";
import { useSearchParams } from "react-router-dom";
import TeachyTVEntry from "./TeachyTVEntry";

export interface InitialSeedFormState {
    targetSeedIsValid: boolean;
    countIsValid: boolean;
    offsetIsValid: boolean;
}

export interface InitialSeedURLState {
    targetSeed: string;
    count: string;
    offset: string;
    game: string;
    gameConsole: string;
    teachyTVMode: string;
    teachyTVRegularOut: string;
}

function useInitialSeedURLState() {
    const [searchParams, setSearchParams] = useSearchParams();
    const targetSeed = searchParams.get("targetSeed") || "DEADBEEF";
    const count = searchParams.get("count") || "10";
    const offset = searchParams.get("offset") || "0";
    const game = searchParams.get("game") || "r_painting";
    const gameConsole = searchParams.get("gameConsole") || "GBA";
    const teachyTVMode = searchParams.get("teachyTVMode") || "false";
    const teachyTVRegularOut = searchParams.get("teachyTVRegularOut") || "3600";
    const setInitialSeedURLState = (state: Partial<InitialSeedURLState>) => {
        setSearchParams((prev) => {
            for (const [key, value] of Object.entries(state)) {
                prev.set(key, value);
            }
            return prev;
        });
    };
    return {
        targetSeed,
        count,
        offset,
        game,
        gameConsole,
        teachyTVMode,
        teachyTVRegularOut,
        setInitialSeedURLState,
    };
}

export default function TenLinesForm({
    sx,
    hidden,
}: {
    sx?: any;
    hidden?: boolean;
}) {
    const [initialSeedFormState, setInitialSeedFormState] =
        useState<InitialSeedFormState>({
            targetSeedIsValid: true,
            countIsValid: true,
            offsetIsValid: true,
        });
    const {
        targetSeed,
        count,
        offset,
        game,
        gameConsole,
        teachyTVMode,
        teachyTVRegularOut,
        setInitialSeedURLState,
    } = useInitialSeedURLState();
    const [data, setData] = useState<InitialSeedResult[]>([]);
    const isNotSubmittable =
        !initialSeedFormState.targetSeedIsValid ||
        !initialSeedFormState.countIsValid ||
        !initialSeedFormState.offsetIsValid;
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isNotSubmittable) return;
        fetchTenLines().then((lib) => {
            setData([]);
            if (!isFRLG) {
                lib.ten_lines_painting(
                    parseInt(targetSeed, 16),
                    parseInt(count, 10),
                    parseInt(offset, 10),
                    proxy(setData)
                );
            } else {
                fetchSeedData(game).then((data) => {
                    lib.ten_lines_frlg(
                        parseInt(targetSeed, 16),
                        parseInt(count, 10),
                        parseInt(offset, 10),
                        game,
                        isTeachyTVMode
                            ? parseInt(teachyTVRegularOut, 10) ?? 0
                            : 0,
                        data,
                        proxy(setData)
                    );
                });
            }
        });
    };

    const isFRLG = !game.endsWith("painting");
    const isTeachyTVMode = teachyTVMode === "true" && isFRLG;

    if (hidden) {
        return null;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ sx }}>
            <NumericalInput
                label="Target Seed"
                name="targetSeed"
                minimumValue={0}
                maximumValue={0xffffffff}
                isHex={true}
                onChange={(_, value) => {
                    setInitialSeedURLState({
                        targetSeed: value.isValid
                            ? hexSeed(parseInt(value.value, 16), 32)
                            : value.value,
                    });
                    setInitialSeedFormState((data) => ({
                        ...data,
                        targetSeedIsValid: value.isValid,
                    }));
                }}
                value={targetSeed}
            ></NumericalInput>
            <NumericalInput
                label="Result Count"
                name="resultCount"
                minimumValue={0}
                maximumValue={5000}
                onChange={(_, value) => {
                    setInitialSeedURLState({
                        count: value.value,
                    });
                    setInitialSeedFormState((data) => ({
                        ...data,
                        countIsValid: value.isValid,
                    }));
                }}
                value={count}
            ></NumericalInput>
            <NumericalInput
                label="Offset"
                name="offset"
                minimumValue={0}
                maximumValue={4294967295}
                onChange={(_, value) => {
                    setInitialSeedURLState({
                        offset: value.value,
                    });
                    setInitialSeedFormState((data) => ({
                        ...data,
                        offsetIsValid: value.isValid,
                    }));
                }}
                value={offset}
            ></NumericalInput>
            <TextField
                label="Game"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setInitialSeedURLState({ game: event.target.value });
                    setData([]);
                }}
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
            <TextField
                label="Console"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setInitialSeedURLState({ gameConsole: event.target.value });
                }}
                value={gameConsole}
                select
                fullWidth
            >
                <MenuItem value="GBA">Game Boy Advance</MenuItem>
                <MenuItem value="GBP">Game Boy Player</MenuItem>
                <MenuItem value="NDS">Nintendo DS</MenuItem>
                <MenuItem value="3DS">Nintendo 3DS (open_agb_firm)</MenuItem>
            </TextField>
            {isFRLG && (
                <TeachyTVEntry
                    isTeachyTVMode={isTeachyTVMode}
                    teachyTVRegularOut={teachyTVRegularOut}
                    onChange={(isTeachyTVMode, teachyTVRegularOut) => {
                        setInitialSeedURLState({
                            teachyTVMode: isTeachyTVMode.toString(),
                            teachyTVRegularOut: teachyTVRegularOut.value,
                        });
                    }}
                ></TeachyTVEntry>
            )}
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isNotSubmittable}
                fullWidth
            >
                Submit
            </Button>
            <InitialSeedTable
                rows={data}
                isFRLG={isFRLG}
                gameConsole={gameConsole}
                isTeachyTVMode={isTeachyTVMode}
                teachyTVRegularOut={parseInt(teachyTVRegularOut, 10) ?? 0}
            />
        </Box>
    );
}
