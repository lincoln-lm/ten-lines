import { proxy } from "comlink";
import { useState } from "react";

import { Box, Button, MenuItem, TextField } from "@mui/material";

import fetchTenLines, { fetchSeedData, hexSeed } from "../tenLines";
import NumericalInput from "./NumericalInput";
import InitialSeedTable from "./InitialSeedTable";
import type { InitialSeedResult } from "../tenLines/generated";
import { useSearchParams } from "react-router-dom";

export interface InitialSeedFormState {
    targetSeedIsValid: boolean;
    countIsValid: boolean;
}

export interface InitialSeedURLState {
    targetSeed: string;
    count: string;
    game: string;
    gameConsole: string;
}

function useInitialSeedURLState() {
    const [searchParams, setSearchParams] = useSearchParams();
    const targetSeed = searchParams.get("targetSeed") || "DEADBEEF";
    const count = searchParams.get("count") || "10";
    const game = searchParams.get("game") || "r_painting";
    const gameConsole = searchParams.get("gameConsole") || "GBA";
    const setInitialSeedURLState = (state: Partial<InitialSeedURLState>) => {
        setSearchParams((prev) => {
            for (const [key, value] of Object.entries(state)) {
                prev.set(key, value);
            }
            return prev;
        });
    };
    return { targetSeed, count, game, gameConsole, setInitialSeedURLState };
}

export default function TenLinesForm({ sx }: { sx?: any }) {
    const [initialSeedFormState, setInitialSeedFormState] =
        useState<InitialSeedFormState>({
            targetSeedIsValid: true,
            countIsValid: true,
        });
    const { targetSeed, count, game, gameConsole, setInitialSeedURLState } =
        useInitialSeedURLState();
    const [data, setData] = useState<InitialSeedResult[]>([]);
    const isNotSubmittable =
        !initialSeedFormState.targetSeedIsValid ||
        !initialSeedFormState.countIsValid;
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isNotSubmittable) return;
        fetchTenLines().then((lib) => {
            setData([]);
            if (game.endsWith("painting")) {
                lib.ten_lines_painting(
                    parseInt(targetSeed, 16),
                    parseInt(count, 10),
                    proxy(setData)
                );
            } else {
                fetchSeedData(game).then((data) => {
                    lib.ten_lines_frlg(
                        parseInt(targetSeed, 16),
                        parseInt(count, 10),
                        game,
                        data,
                        proxy(setData)
                    );
                });
            }
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={sx}>
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
                isFRLG={!game.endsWith("painting")}
                gameConsole={gameConsole}
            />
        </Box>
    );
}
