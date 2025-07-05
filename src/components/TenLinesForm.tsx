import { proxy } from "comlink";
import { useState } from "react";

import { Box, Button, MenuItem, TextField } from "@mui/material";

import fetchTenLines, { fetchSeedData, hexSeed } from "../tenLines";
import NumericalInput from "./NumericalInput";
import TenLinesTable, { type TenLinesDatum } from "./TenLinesTable";

export default function TenLinesForm({ sx }: { sx?: any }) {
    const [data, setData] = useState<TenLinesDatum[]>([]);
    const [formData, setFormData] = useState<{
        targetSeed: string;
        targetSeedIsValid: boolean;
        count: string;
        countIsValid: boolean;
        game: string;
        gameConsole: string;
    }>({
        targetSeed: "DEADBEEF",
        targetSeedIsValid: true,
        count: "10",
        countIsValid: true,
        game: "painting",
        gameConsole: "GBA",
    });
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.targetSeedIsValid || !formData.countIsValid) return;
        fetchTenLines().then((lib) => {
            setData([]);
            if (formData.game === "painting") {
                lib.ten_lines_painting(
                    parseInt(formData.targetSeed, 16),
                    parseInt(formData.count, 10),
                    proxy((result: []) => {
                        setData(
                            result.map((item) => ({
                                advances: item[0],
                                seed: item[1],
                                seedFrames: item[1],
                            }))
                        );
                    })
                );
            } else {
                fetchSeedData(formData.game).then((data) => {
                    lib.ten_lines_frlg(
                        parseInt(formData.targetSeed, 16),
                        parseInt(formData.count, 10),
                        formData.game,
                        data,
                        proxy((result: []) => {
                            setData(
                                result.map((item) => ({
                                    advances: item[0],
                                    seed: item[1],
                                    seedFrames: item[2],
                                    settings: item[3],
                                }))
                            );
                        })
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
                    setFormData((data) => ({
                        ...data,
                        targetSeed: value.isValid
                            ? hexSeed(parseInt(value.value, 16), 32)
                            : value.value,
                        targetSeedIsValid: value.isValid,
                    }))
                }
                value={formData.targetSeed}
            ></NumericalInput>
            <NumericalInput
                label="Result Count"
                name="resultCount"
                minimumValue={0}
                maximumValue={5000}
                onChange={(_, value) =>
                    setFormData((data) => ({
                        ...data,
                        count: value.value,
                        countIsValid: value.isValid,
                    }))
                }
                value={formData.count}
            ></NumericalInput>
            <TextField
                label="Game"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setFormData((data) => ({
                        ...data,
                        game: event.target.value,
                    }));
                    setData([]);
                }}
                value={formData.game}
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
                    setFormData((data) => ({
                        ...data,
                        gameConsole: event.target.value,
                    }));
                }}
                value={formData.gameConsole}
                select
                fullWidth
                sx={formData.game === "painting" ? { display: "none" } : {}}
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
                isFRLG={formData.game !== "painting"}
                gameConsole={formData.gameConsole}
            />
        </Box>
    );
}
