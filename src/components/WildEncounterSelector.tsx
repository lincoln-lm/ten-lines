import { useEffect, useState } from "react";
import React from "react";
import fetchTenLines, { Game } from "../tenLines";
import { Autocomplete, MenuItem, TextField } from "@mui/material";
import { getLocationEn, getNameEn } from "../tenLines/resources";

function WildEncounterSelector({
    wildCategory,
    wildLocation,
    wildPokemon,
    onChange,
    game = Game.Gen3,
}: {
    wildCategory: number;
    wildLocation: number;
    wildPokemon: number;
    onChange: (
        wildCategory: number,
        wildLocation: number,
        wildPokemon: number
    ) => void;
    game?: number;
}) {
    const [wildLocations, setWildLocations] = useState<number[]>([]);
    const [areaSpecies, setAreaSpecies] = useState<number[]>([]);

    useEffect(() => {
        const fetchWildLocations = async () => {
            const tenLines = await fetchTenLines();
            const wildLocations = await tenLines.get_wild_locations(
                game,
                wildCategory
            );
            setWildLocations(wildLocations);
            onChange(
                wildCategory,
                wildLocations.length > 0 ? wildLocations[0] : 0,
                wildPokemon
            );
        };
        fetchWildLocations();
    }, [game, wildCategory]);

    useEffect(() => {
        const fetchAreaSpecies = async () => {
            const tenLines = await fetchTenLines();
            const areaSpecies = await tenLines.get_area_species(
                game,
                wildCategory,
                wildLocation
            );
            setAreaSpecies(areaSpecies);
            onChange(
                wildCategory,
                wildLocation,
                areaSpecies.length > 0 ? areaSpecies[0] : 0
            );
        };
        fetchAreaSpecies();
    }, [game, wildCategory, wildLocation]);

    return (
        <React.Fragment>
            <TextField
                label="Category"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    onChange(
                        parseInt(event.target.value),
                        wildLocation,
                        wildPokemon
                    );
                }}
                value={wildCategory}
                select
                fullWidth
            >
                <MenuItem value="0">Grass</MenuItem>
                <MenuItem value="3">Rock Smash</MenuItem>
                <MenuItem value="4">Surfing</MenuItem>
                <MenuItem value="6">Old Rod</MenuItem>
                <MenuItem value="7">Good Rod</MenuItem>
                <MenuItem value="8">Super Rod</MenuItem>
            </TextField>
            <Autocomplete
                options={wildLocations.map((_, index) => index)}
                onChange={(_event, newValue) => {
                    onChange(wildCategory, newValue, wildPokemon);
                }}
                getOptionLabel={(option) =>
                    getLocationEn(game, wildLocations[option])
                }
                renderInput={(params) => (
                    <TextField {...params} label="Location" margin="normal" />
                )}
                value={wildLocation}
                disablePortal
                disableClearable
                selectOnFocus
                fullWidth
            />
            <TextField
                label="Pokemon"
                margin="normal"
                style={{ textAlign: "left" }}
                onChange={(event) => {
                    onChange(
                        wildCategory,
                        wildLocation,
                        parseInt(event.target.value)
                    );
                }}
                value={wildPokemon}
                select
                fullWidth
            >
                {areaSpecies.map((speciesForm) => (
                    <MenuItem key={speciesForm} value={speciesForm}>
                        {getNameEn(speciesForm & 0x7ff, speciesForm >> 11)}
                    </MenuItem>
                ))}
            </TextField>
        </React.Fragment>
    );
}

export default WildEncounterSelector;
