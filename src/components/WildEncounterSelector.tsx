import { useEffect, useState } from "react";
import React from "react";
import fetchTenLines, { Game } from "../tenLines";
import {
    Autocomplete,
    Box,
    Checkbox,
    FormControlLabel,
    MenuItem,
    TextField,
} from "@mui/material";
import { getLocationEn, getNameEn, NATURES_EN } from "../tenLines/resources";

function WildEncounterSelector({
    wildCategory,
    wildLocation,
    wildPokemon,
    wildLead,
    shouldFilterPokemon,
    onChange,
    game = Game.Gen3,
    allowAnyPokemon = false,
    isSearcher = false,
}: {
    wildCategory: number;
    wildLocation: number;
    wildPokemon: number;
    wildLead: number;
    shouldFilterPokemon: boolean;
    onChange: (
        wildCategory: number,
        wildLocation: number,
        wildPokemon: number,
        wildLead: number,
        shouldFilterPokemon: boolean
    ) => void;
    game?: number;
    allowAnyPokemon?: boolean;
    isSearcher?: boolean;
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
                wildPokemon,
                wildLead,
                shouldFilterPokemon
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
                allowAnyPokemon
                    ? -1
                    : areaSpecies.length > 0
                    ? areaSpecies[0]
                    : 0,
                wildLead,
                shouldFilterPokemon
            );
        };
        fetchAreaSpecies();
    }, [game, wildCategory, wildLocation]);

    const isEmerald = (game & Game.Emerald) == Game.Emerald;

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
                        wildPokemon,
                        wildLead,
                        shouldFilterPokemon
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
                    onChange(
                        wildCategory,
                        newValue,
                        wildPokemon,
                        wildLead,
                        shouldFilterPokemon
                    );
                }}
                getOptionLabel={(option) =>
                    getLocationEn(game, wildLocations[option]) || ""
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                    label="Pokemon"
                    margin="normal"
                    style={{ textAlign: "left" }}
                    onChange={(event) => {
                        onChange(
                            wildCategory,
                            wildLocation,
                            parseInt(event.target.value),
                            wildLead,
                            shouldFilterPokemon
                        );
                    }}
                    value={wildPokemon}
                    select
                    fullWidth
                >
                    {allowAnyPokemon && <MenuItem value="-1">Any</MenuItem>}
                    {areaSpecies.map((speciesForm) => (
                        <MenuItem key={speciesForm} value={speciesForm}>
                            {getNameEn(speciesForm & 0x7ff, speciesForm >> 11)}
                        </MenuItem>
                    ))}
                </TextField>
                {!allowAnyPokemon && (
                    <FormControlLabel
                        style={{ marginLeft: 8 }}
                        control={
                            <Checkbox
                                checked={shouldFilterPokemon}
                                onChange={(event) => {
                                    onChange(
                                        wildCategory,
                                        wildLocation,
                                        wildPokemon,
                                        wildLead,
                                        event.target.checked
                                    );
                                }}
                            />
                        }
                        label="Filter"
                        sx={{
                            whiteSpace: "nowrap",
                        }}
                    />
                )}
            </Box>
            {isEmerald && (
                <TextField
                    label="Lead"
                    margin="normal"
                    style={{ textAlign: "left" }}
                    onChange={(event) => {
                        onChange(
                            wildCategory,
                            wildLocation,
                            wildPokemon,
                            parseInt(event.target.value),
                            shouldFilterPokemon
                        );
                    }}
                    value={wildLead}
                    select
                    fullWidth
                >
                    <MenuItem value="255">None</MenuItem>
                    <MenuItem value="25">Female Cute Charm</MenuItem>
                    <MenuItem value="26">Male Cute Charm</MenuItem>
                    <MenuItem value="27">Magnet Pull</MenuItem>
                    <MenuItem value="28">Static</MenuItem>
                    <MenuItem value="32">Hustle/Pressure/Vital Spirit</MenuItem>
                    {isSearcher ? (
                        <MenuItem value="0">Matching Synchronize</MenuItem>
                    ) : (
                        NATURES_EN.map((nature, index) => (
                            <MenuItem key={index} value={index}>
                                {nature} Synchronize
                            </MenuItem>
                        ))
                    )}
                </TextField>
            )}
        </React.Fragment>
    );
}

export default WildEncounterSelector;
