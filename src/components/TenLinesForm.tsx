import { proxy } from "comlink";
import { useState } from "react";

import { Box, Button, MenuItem, TextField } from "@mui/material";

import fetchTenLines, { fetchSeedData, hexSeed } from "../tenLines";
import NumericalInput from "./NumericalInput";
import TenLinesTable from "./TenLinesTable";
import type { InitialSeedResult } from "../tenLines/generated";

export interface TenLinesFormState {
    targetSeed: string;
    targetSeedIsValid: boolean;
    count: string;
    countIsValid: boolean;
    game: string;
    gameConsole: string;
}

export default function TenLinesForm({
    tenLinesFormState,
    setTenLinesFormState,
    sx,
}: {
    tenLinesFormState: TenLinesFormState;
    setTenLinesFormState: (
        state:
            | TenLinesFormState
            | ((state: TenLinesFormState) => TenLinesFormState)
    ) => void;
    sx?: any;
}) {
    const [data, setData] = useState<InitialSeedResult[]>([]);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (
            !tenLinesFormState.targetSeedIsValid ||
            !tenLinesFormState.countIsValid
        )
            return;
        fetchTenLines().then((lib) => {
            setData([]);
            if (tenLinesFormState.game === "painting") {
                lib.ten_lines_painting(
                    parseInt(tenLinesFormState.targetSeed, 16),
                    parseInt(tenLinesFormState.count, 10),
                    proxy(setData)
                );
            } else {
                fetchSeedData(tenLinesFormState.game).then((data) => {
                    lib.ten_lines_frlg(
                        parseInt(tenLinesFormState.targetSeed, 16),
                        parseInt(tenLinesFormState.count, 10),
                        tenLinesFormState.game,
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
                onChange={(_, value) =>
                    setTenLinesFormState((data) => ({
                        ...data,
                        targetSeed: value.isValid
                            ? hexSeed(parseInt(value.value, 16), 32)
                            : value.value,
                        targetSeedIsValid: value.isValid,
                    }))
                }
                value={tenLinesFormState.targetSeed}
            ></NumericalInput>
            <NumericalInput
                label="Result Count"
                name="resultCount"
                minimumValue={0}
                maximumValue={5000}
                onChange={(_, value) =>
                    setTenLinesFormState((data) => ({
                        ...data,
                        count: value.value,
                        countIsValid: value.isValid,
                    }))
                }
                value={tenLinesFormState.count}
            ></NumericalInput>
            <TextField
                label="Game"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setTenLinesFormState((data) => ({
                        ...data,
                        game: event.target.value,
                    }));
                    setData([]);
                }}
                value={tenLinesFormState.game}
                select
                fullWidth
            >
                <MenuItem value="painting">Painting Seed</MenuItem>
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
                    setTenLinesFormState((data) => ({
                        ...data,
                        gameConsole: event.target.value,
                    }));
                }}
                value={tenLinesFormState.gameConsole}
                select
                fullWidth
                sx={
                    tenLinesFormState.game === "painting"
                        ? { display: "none" }
                        : {}
                }
            >
                <MenuItem value="GBA">Game Boy Advance</MenuItem>
                <MenuItem value="GBP">Game Boy Player</MenuItem>
                <MenuItem value="NDS">Nintendo DS</MenuItem>
                <MenuItem value="3DS">Nintendo 3DS (open_agb_firm)</MenuItem>
            </TextField>
            <Button variant="contained" color="primary" type="submit" fullWidth>
                Submit
            </Button>
            <TenLinesTable
                rows={data}
                isFRLG={tenLinesFormState.game !== "painting"}
                gameConsole={tenLinesFormState.gameConsole}
            />
        </Box>
    );
}
