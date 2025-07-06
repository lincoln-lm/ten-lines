import { useEffect, useState } from "react";
import React from "react";
import type { StaticTemplateDisplayInfo } from "../tenLines/generated";
import fetchTenLines from "../tenLines";
import { MenuItem, TextField } from "@mui/material";
import { getNameEn } from "../tenLines/resources";

function StaticEncounterSelector({
    staticCategory,
    staticPokemon,
    onChange,
}: {
    staticCategory: number;
    staticPokemon: number;
    onChange: (staticCategory: number, staticPokemon: number) => void;
}) {
    const [staticTemplates, setStaticTemplates] = useState<
        StaticTemplateDisplayInfo[]
    >([]);

    useEffect(() => {
        const fetchStaticTemplates = async () => {
            const tenLines = await fetchTenLines();
            const staticTemplates = await tenLines.get_static_template_info(
                staticCategory
            );
            setStaticTemplates(staticTemplates);
            onChange(
                staticCategory,
                staticTemplates.length > 0 ? staticTemplates[0].index : 0
            );
        };
        fetchStaticTemplates();
    }, [staticCategory]);

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
                    onChange(staticCategory, parseInt(event.target.value));
                }}
                value={staticPokemon}
                select
                fullWidth
            >
                {staticTemplates.map((template) => (
                    <MenuItem key={template.index} value={template.index}>
                        {getNameEn(template.species, template.form)}
                    </MenuItem>
                ))}
            </TextField>
        </React.Fragment>
    );
}

export default StaticEncounterSelector;
