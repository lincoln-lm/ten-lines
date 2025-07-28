import natures_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/natures_en.txt?raw";
import abilities_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/abilities_en.txt?raw";
import species_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/species_en.txt?raw";
import forms_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/forms_en.txt?raw";
import frlg_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/frlg_en.txt?raw";
import rs_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/rs_en.txt?raw";
import e_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/e_en.txt?raw";
import {
    COMBINED_WILD_METHOD,
    Game,
    STATIC_1,
    STATIC_2,
    STATIC_4,
    WILD_1,
    WILD_2,
    WILD_4,
} from ".";

const parseMap = (text: string) => {
    return Object.fromEntries(parseList(text).map((line) => line.split(",")));
};

const parseList = (text: string) => {
    return text.split("\n").map((line) => line.trim());
};

export const METHODS_EN: Record<number, string> = {
    [STATIC_1]: "Static 1",
    [STATIC_2]: "Static 2",
    [STATIC_4]: "Static 4",
    [WILD_1]: "Wild 1",
    [WILD_2]: "Wild 2",
    [WILD_4]: "Wild 4",
    [COMBINED_WILD_METHOD]: "All Wild Methods",
};
export const GENDERS_EN = ["♂", "♀", "-"];
export const SHININESS_EN = ["No", "Star", "Square"];
export const NATURES_EN = parseList(natures_en_txt);
export const ABILITIES_EN = parseList(abilities_en_txt);
export const SPECIES_EN = ["Egg", ...parseList(species_en_txt)];
export const FORMS_EN = Object.fromEntries(
    parseList(forms_en_txt).map((line) => {
        const [species, form, name] = line.split(",");
        return [`${species}-${form}`, name];
    })
);
export const FRLG_LOCATIONS_EN = parseMap(frlg_en_txt);
export const RS_LOCATIONS_EN = parseMap(rs_en_txt);
export const E_LOCATIONS_EN = parseMap(e_en_txt);

export const getLocationEn = (game: number, location: number) => {
    if (game & Game.RS) return RS_LOCATIONS_EN[location];
    if (game & Game.Emerald) return E_LOCATIONS_EN[location];
    return FRLG_LOCATIONS_EN[location];
};

export const GAMES_EN: Record<number, string> = {
    [Game.None]: "None",
    [Game.Ruby]: "Ruby",
    [Game.Sapphire]: "Sapphire",
    [Game.RS]: "Ruby & Sapphire",
    [Game.Emerald]: "Emerald",
    [Game.Ruby | Game.Emerald]: "Ruby & Emerald",
    [Game.Sapphire | Game.Emerald]: "Sapphire & Emerald",
    [Game.RSE]: "Ruby, Sapphire & Emerald",
    [Game.FireRed]: "FireRed",
    [Game.LeafGreen]: "LeafGreen",
    [Game.FRLG]: "FireRed & LeafGreen",
    [Game.FRLG | Game.Emerald]: "FireRed, LeafGreen & Emerald",
    [Game.Gen3]: "Generation 3",
};

export const getNameEn = (
    species: number | string,
    form: number | string = 0
) => {
    const speciesName =
        SPECIES_EN[typeof species === "number" ? species : parseInt(species)];
    const formName = FORMS_EN[`${species}-${form}`];

    return `${speciesName}${formName ? ` (${formName})` : ""}`;
};
