import natures_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/natures_en.txt?raw";
import abilities_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/abilities_en.txt?raw";
import species_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/species_en.txt?raw";
import forms_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/forms_en.txt?raw";
import frlg_en_txt from "../wasm/lib/PokeFinder/Source/Core/Resources/i18n/en/frlg_en.txt?raw";

const parseMap = (text: string) => {
    return Object.fromEntries(parseList(text).map((line) => line.split(",")));
};

const parseList = (text: string) => {
    return text.split("\n").map((line) => line.trim());
};

export const GENDERS_EN = ["♂", "♀", "-"];
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

export const getNameEn = (species: number | string, form: number | string) => {
    const speciesName =
        SPECIES_EN[typeof species === "number" ? species : parseInt(species)];
    const formName = FORMS_EN[`${species}-${form}`];

    return `${speciesName}${formName ? ` (${formName})` : ""}`;
};
