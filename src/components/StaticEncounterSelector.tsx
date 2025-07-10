import { useEffect, useState } from "react";
import React from "react";
import type { StaticTemplateDisplayInfo } from "../tenLines/generated";
import fetchTenLines, { Game } from "../tenLines";
import { MenuItem, TextField } from "@mui/material";
import { GAMES_EN, getNameEn } from "../tenLines/resources";

function StaticEncounterSelector({
    staticCategory,
    staticPokemon,
    onChange,
    game = Game.Gen3,
}: {
    staticCategory: number;
    staticPokemon: number;
    onChange: (staticCategory: number, staticPokemon: number) => void;
    game?: number;
}) {
    const [staticTemplates, setStaticTemplates] = useState<
        StaticTemplateDisplayInfo[]
    >([]);

    useEffect(() => {
        const fetchStaticTemplates = async () => {
            const tenLines = await fetchTenLines();
            const staticTemplates = (
                await tenLines.get_static_template_info(staticCategory)
            ).filter(
                (template: StaticTemplateDisplayInfo) => template.version & game
            );
            setStaticTemplates(staticTemplates);
            onChange(
                staticCategory,
                staticTemplates.length > 0 ? staticTemplates[0].index : 0
            );
        };
        fetchStaticTemplates();
    }, [staticCategory, game]);

    const isFRLG = game & Game.FRLG;
    const isFRLGE = game & (Game.FRLG | Game.Emerald);

    return (
        <React.Fragment>
            <TextField
                label="Category"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    onChange(parseInt(event.target.value), staticPokemon);
                }}
                value={staticCategory}
                select
                fullWidth
            >
                <MenuItem value="0">Starters</MenuItem>
                <MenuItem value="1">Fossils</MenuItem>
                <MenuItem value="2">Gifts</MenuItem>
                {isFRLG && <MenuItem value="3">Game Corner</MenuItem>}
                <MenuItem value="4">Stationary</MenuItem>
                <MenuItem value="5">Legends</MenuItem>
                {isFRLGE && <MenuItem value="6">Events</MenuItem>}
                <MenuItem value="7">Roamers</MenuItem>
                {!isFRLG && (
                    <MenuItem value="8">Blisy's E-Reader Events</MenuItem>
                )}
            </TextField>
            <TextField
                label="Pokemon"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    onChange(staticCategory, parseInt(event.target.value));
                }}
                value={staticPokemon}
                select
                fullWidth
            >
                {staticTemplates.map((template) => (
                    <MenuItem key={template.index} value={template.index}>
                        {`${getNameEn(template.species, template.form)}${
                            template.shiny == 1 ? " (Shiny Locked)" : ""
                        } - ${GAMES_EN[template.version]}`}
                    </MenuItem>
                ))}
            </TextField>
        </React.Fragment>
    );
}

export default StaticEncounterSelector;
