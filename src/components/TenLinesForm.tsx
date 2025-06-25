import { proxy } from "comlink";
import { useState } from "react";

import { Box, Button, MenuItem, TextField } from "@mui/material";

import fetchTenLines from "../tenLines";
import FrLgSeedsTimestamp from "../wasm/src/generated/frlg_seeds_timestamp.txt?raw";
import FrEngSeedsUrl from "../wasm/src/generated/fr_eng.bin?url";
import LgEngSeedsUrl from "../wasm/src/generated/lg_eng.bin?url";
import FrJpn10SeedsUrl from "../wasm/src/generated/fr_jpn_1_0.bin?url";
import FrJpn11SeedsUrl from "../wasm/src/generated/fr_jpn_1_1.bin?url";
import LgJpnSeedsUrl from "../wasm/src/generated/lg_jpn.bin?url";
import NumericalInput from "./NumericalInput";
import TenLinesTable, { type TenLinesDatum } from "./TenLinesTable";

const SEED_URLS: Record<string, string> = {
    fr: FrEngSeedsUrl,
    fr_eu: FrEngSeedsUrl,
    lg: LgEngSeedsUrl,
    lg_eu: LgEngSeedsUrl,
    fr_jpn_1_0: FrJpn10SeedsUrl,
    fr_jpn_1_1: FrJpn11SeedsUrl,
    lg_jpn: LgJpnSeedsUrl,
};

export default function TenLinesForm() {
    const [data, setData] = useState<TenLinesDatum[]>([]);
    const [formData, setFormData] = useState<{
        targetSeed: number | null;
        count: number | null;
        game: string;
        gameConsole: string;
    }>({
        targetSeed: 0xdeadbeef,
        count: 10,
        game: "painting",
        gameConsole: "GBA",
    });
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formData.targetSeed == null || formData.count == null) return;
        fetchTenLines().then((lib) => {
            setData([]);
            if (formData.game === "painting") {
                lib.ten_lines_painting(
                    formData.targetSeed as number,
                    formData.count as number,
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
                fetch(SEED_URLS[formData.game])
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Failed to fetch seeds file");
                        }
                        return response.arrayBuffer();
                    })
                    .then((buffer) => {
                        lib.ten_lines_frlg(
                            formData.targetSeed as number,
                            formData.count as number,
                            formData.game,
                            new Uint8Array(buffer),
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
        <Box component="form" onSubmit={handleSubmit} p={2}>
            <NumericalInput
                label="Target Seed"
                name="targetSeed"
                minimumValue={0}
                maximumValue={0xffffffff}
                isHex={true}
                startingValue={formData.targetSeed?.toString(16)}
                changeSignal={(_, value) =>
                    setFormData((data) => ({ ...data, targetSeed: value }))
                }
            ></NumericalInput>
            <NumericalInput
                label="Result Count"
                name="resultCount"
                minimumValue={0}
                maximumValue={5000}
                startingValue={formData.count?.toString()}
                changeSignal={(_, value) =>
                    setFormData((data) => ({ ...data, count: value }))
                }
            ></NumericalInput>
            <TextField
                label="Game"
                margin="normal"
                defaultValue="painting"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setFormData((data) => ({
                        ...data,
                        game: event.target.value,
                    }));
                    setData([]);
                }}
                select
                fullWidth
            >
                <MenuItem value="painting">Painting Seed</MenuItem>
                <MenuItem value="fr">FireRed (ENG)</MenuItem>
                <MenuItem value="fr_eu">FireRed (SPA/FRE/ITA/GER)</MenuItem>
                <MenuItem value="fr_jpn_1_0">FireRed (JPN) (1.0)</MenuItem>
                <MenuItem value="fr_jpn_1_1">FireRed (JPN) (1.1)</MenuItem>
                <MenuItem value="lg">LeafGreen (ENG)</MenuItem>
                <MenuItem value="lg_eu">LeafGreen (SPA/FRE/ITA/GER)</MenuItem>
                <MenuItem value="lg_jpn">LeafGreen (JPN)</MenuItem>
            </TextField>
            <TextField
                label="Console"
                margin="normal"
                defaultValue="GBA"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    setFormData((data) => ({
                        ...data,
                        gameConsole: event.target.value,
                    }));
                }}
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
            <footer>
                Original "10 lines" was created by Shao, FRLG seeds farmed by
                blisy, po, and トノ
                <br />
                Powered by{" "}
                <a href="https://github.com/Admiral-Fish/PokeFinder">
                    PokeFinderCore
                </a>
                <br />
                FRLG seed data as of {FrLgSeedsTimestamp}
            </footer>
        </Box>
    );
}
