#include <string>
#include <vector>
#include <array>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <Core/Gen3/Generators/StaticGenerator3.hpp>
#include <Core/Gen3/Generators/WildGenerator3.hpp>
#include <Core/Gen3/Generators/GameCubeGenerator.hpp>
#include <Core/Gen3/Encounters3.hpp>
#include <Core/Gen3/EncounterArea3.hpp>
#include <Core/Gen3/StaticTemplate3.hpp>
#include <Core/Gen3/Profile3.hpp>
#include <Core/Enum/Method.hpp>
#include <Core/Enum/Game.hpp>
#include <Core/Enum/Shiny.hpp>
#include <Core/Enum/Lead.hpp>
#include <Core/Parents/Filters/StateFilter.hpp>
#include <Core/Util/IVChecker.hpp>
#include "initial_seed.hpp"
#include "calibration.hpp"
#include "searcher.hpp"

void check_seeds_static(emscripten::val seeds, emscripten::val advance_range, u16 trainer_id, u16 secret_id, int category, int template_index, u32 method, u8 shininess, int nature, emscripten::val iv_ranges, emscripten::val result_callback, emscripten::val searching_callback)
{
    u32 initial_advances = advance_range[0].as<u32>();
    u32 max_advances = advance_range[1].as<u32>() - initial_advances;

    std::array<bool, 25> natures = {true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true};
    if (nature != -1)
    {
        for (int i = 0; i < 25; i++)
        {
            natures[i] = false;
        }
        natures[nature] = true;
    }

    std::array<u8, 6> min_ivs = {iv_ranges[0][0].as<u8>(), iv_ranges[1][0].as<u8>(), iv_ranges[2][0].as<u8>(), iv_ranges[3][0].as<u8>(), iv_ranges[4][0].as<u8>(), iv_ranges[5][0].as<u8>()};
    std::array<u8, 6> max_ivs = {iv_ranges[0][1].as<u8>(), iv_ranges[1][1].as<u8>(), iv_ranges[2][1].as<u8>(), iv_ranges[3][1].as<u8>(), iv_ranges[4][1].as<u8>(), iv_ranges[5][1].as<u8>()};
    std::array<bool, 16> powers = {true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true};

    Profile3 profile("", Game::FireRed, trainer_id, secret_id, false);
    StateFilter filter(255, 255, shininess, 0, 255, 0, 255, false, min_ivs, max_ivs, natures, powers);

    searching_callback(true);
    // blisy's e-reader events
    if (category == 8)
    {
        const StaticTemplate3 *tmplate = &blisy_e_reader_templates[template_index];
        for (int i = 0; i < seeds["length"].as<int>(); i++)
        {
            FRLGContiguousSeedEntry entry = seeds[i].as<FRLGContiguousSeedEntry>();
            u16 seed = entry.initialSeed;
            u16 frame = entry.seedFrame;
            PokeRNG rng(seed, initial_advances);
            auto results = emscripten::val::array();
            for (u32 cnt = 0; cnt <= max_advances; cnt++, rng.next())
            {
                GameCubeGenerator generator(0, 0, 0, tmplate->getSpecie() == 385 ? Method::Channel : Method(method), false, profile, filter);
                auto generator_results = generator.generate(rng.getSeed(), tmplate);
                for (auto &generator_result : generator_results)
                {
                    results.call<void>("push", emscripten::val(CalibrationState(seed, frame, generator_result)));
                }
            }
            result_callback(results);
        }
        searching_callback(false);
        return;
    }

    const StaticTemplate3 tmplate = *Encounters3::getStaticEncounter(category, template_index);

    for (int i = 0; i < seeds["length"].as<int>(); i++)
    {
        FRLGContiguousSeedEntry entry = seeds[i].as<FRLGContiguousSeedEntry>();
        u16 seed = entry.initialSeed;
        u16 frame = entry.seedFrame;
        StaticGenerator3 generator(
            initial_advances, max_advances, 0, Method(method), tmplate, profile, filter);
        auto generator_results = generator.generate(seed);
        auto results = emscripten::val::array();
        for (auto &generator_result : generator_results)
        {
            results.call<void>("push", emscripten::val(CalibrationState(seed, frame, generator_result)));
        }
        result_callback(results);
    }
    searching_callback(false);
}

void check_seeds_wild(emscripten::val seeds, emscripten::val advance_range, u16 trainer_id, u16 secret_id, u32 _game, u8 encounter_category, u16 location, int pokemon, u32 _method, u8 _lead, u8 shininess, int nature, emscripten::val iv_ranges, emscripten::val result_callback, emscripten::val searching_callback)
{

    u32 initial_advances = advance_range[0].as<u32>();
    u32 max_advances = advance_range[1].as<u32>() - initial_advances;

    Game game = Game(_game);
    Method method = Method(_method - 4);
    Lead lead = game == Game::Emerald ? Lead(_lead) : Lead::None;

    EncounterSettings3 settings;
    auto encounter_areas = Encounters3::getEncounters(Encounter(encounter_category), settings, game);
    auto area = encounter_areas[location];

    std::array<bool, 25> natures = {true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true};
    if (nature != -1)
    {
        for (int i = 0; i < 25; i++)
        {
            natures[i] = false;
        }
        natures[nature] = true;
    }

    std::array<bool, 12> slots = {true, true, true, true, true, true, true, true, true, true, true, true};
    if (pokemon != -1)
    {
        u16 species = pokemon & 0x7ff;
        u8 form = pokemon >> 11;
        for (int i = 0; i < 12; i++)
        {
            auto slot = area.getPokemon(i);
            slots[i] = slot.getSpecie() == species && slot.getForm() == form;
        }
    }

    std::array<u8, 6> min_ivs = {iv_ranges[0][0].as<u8>(), iv_ranges[1][0].as<u8>(), iv_ranges[2][0].as<u8>(), iv_ranges[3][0].as<u8>(), iv_ranges[4][0].as<u8>(), iv_ranges[5][0].as<u8>()};
    std::array<u8, 6> max_ivs = {iv_ranges[0][1].as<u8>(), iv_ranges[1][1].as<u8>(), iv_ranges[2][1].as<u8>(), iv_ranges[3][1].as<u8>(), iv_ranges[4][1].as<u8>(), iv_ranges[5][1].as<u8>()};
    std::array<bool, 16> powers = {true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true};

    Profile3 profile("", game, trainer_id, secret_id, false);
    WildStateFilter filter(255, 255, shininess, 0, 255, 0, 255, false, min_ivs, max_ivs, natures, powers, slots);

    searching_callback(true);

    for (int i = 0; i < seeds["length"].as<int>(); i++)
    {
        FRLGContiguousSeedEntry entry = seeds[i].as<FRLGContiguousSeedEntry>();
        u16 seed = entry.initialSeed;
        u16 frame = entry.seedFrame;
        WildGenerator3 generator(initial_advances, max_advances, 0, method, lead, false, area, profile, filter);
        auto generator_results = generator.generate(seed);
        auto results = emscripten::val::array();
        for (auto &generator_result : generator_results)
        {
            results.call<void>("push", emscripten::val(CalibrationWildState(seed, frame, generator_result)));
        }
        result_callback(results);
    }
    searching_callback(false);
}

struct StaticTemplateDisplayInfo
{
    int index;
    u16 species;
    u8 form;
    u32 version;
    u8 shiny;
};

emscripten::val get_static_template_info(int category)
{
    emscripten::val array = emscripten::val::array();
    // blisy's e-reader events
    if (category == 8)
    {
        for (size_t i = 0; i < blisy_e_reader_templates.size(); i++)
        {
            auto tmplate = blisy_e_reader_templates[i];
            array.call<void>("push", emscripten::val(StaticTemplateDisplayInfo{static_cast<int>(i), tmplate.getSpecie(), tmplate.getForm(), static_cast<u32>(tmplate.getVersion()), static_cast<u8>(tmplate.getShiny())}));
        }
        return array;
    }

    int size;
    const StaticTemplate3 *templates = Encounters3::getStaticEncounters(category, &size);

    for (int i = 0; i < size; i++)
    {
        array.call<void>("push", emscripten::val(StaticTemplateDisplayInfo{i, templates[i].getSpecie(), templates[i].getForm(), static_cast<u32>(templates[i].getVersion()), static_cast<u8>(templates[i].getShiny())}));
    }
    return array;
}

struct IVRange
{
    u8 min;
    u8 max;
};

std::array<IVRange, 6> calc_ivs(emscripten::val stats, std::array<u8, 6> baseStats, u8 nature)
{
    std::vector<u8> levels;
    std::vector<std::array<u16, 6>> parsed_stats;

    for (int i = 0; i < stats["length"].as<int>(); i++)
    {
        emscripten::val entry = stats[i];
        levels.push_back(entry[0].as<u8>());
        parsed_stats.push_back(std::array<u16, 6>{entry[1].as<u16>(), entry[2].as<u16>(), entry[3].as<u16>(), entry[4].as<u16>(), entry[5].as<u16>(), entry[6].as<u16>()});
    }

    std::array<std::vector<u8>, 6> all_possible_ivs = IVChecker::calculateIVRange(baseStats, parsed_stats, levels, nature, 255, 255);

    std::array<IVRange, 6> ranges;
    for (int i = 0; i < 6; i++)
    {
        std::vector<u8> *possible_ivs = &all_possible_ivs[i];
        auto min_element = std::min_element(possible_ivs->begin(), possible_ivs->end());
        auto max_element = std::max_element(possible_ivs->begin(), possible_ivs->end());
        if (min_element == possible_ivs->end() || max_element == possible_ivs->end())
        {
            ranges[i] = IVRange{32, 0};
        }
        else
        {
            ranges[i] = IVRange{*min_element, *max_element};
        }
    }
    return ranges;
}

std::array<IVRange, 6> calc_ivs_static(int category, int template_index, emscripten::val stats, u8 nature)
{
    const StaticTemplate3 *tmplate = Encounters3::getStaticEncounter(category, template_index);
    const PersonalInfo *info = tmplate->getInfo();
    const std::array<u8, 6> baseStats = info->getStats();
    return calc_ivs(stats, baseStats, nature);
}

std::array<IVRange, 6> calc_ivs_generic(u16 species, u8 form, emscripten::val stats, u8 nature)
{
    const PersonalInfo *info = PersonalLoader::getPersonal(Game::Gen3, species, form);
    const std::array<u8, 6> baseStats = info->getStats();
    return calc_ivs(stats, baseStats, nature);
}

emscripten::val get_wild_locations(u32 game, u8 encounter_category)
{
    EncounterSettings3 settings;
    auto encounter_areas = Encounters3::getEncounters(Encounter(encounter_category), settings, Game(game));
    std::vector<u16> locs;
    std::transform(encounter_areas.begin(), encounter_areas.end(), std::back_inserter(locs),
                   [](const EncounterArea3 &area)
                   { return area.getLocation(); });
    return emscripten::val::array(locs);
}

emscripten::val get_area_species(u32 game, u8 encounter_category, u16 location)
{
    EncounterSettings3 settings;
    auto encounter_areas = Encounters3::getEncounters(Encounter(encounter_category), settings, Game(game));
    EncounterArea3 area = encounter_areas[location];
    return emscripten::val::array(area.getUniqueSpecies());
}

EMSCRIPTEN_BINDINGS(calibration)
{
    emscripten::function("check_seeds_static", &check_seeds_static);
    emscripten::function("check_seeds_wild", &check_seeds_wild);
    emscripten::function("get_static_template_info", &get_static_template_info);
    emscripten::function("calc_ivs_static", &calc_ivs_static);
    emscripten::function("calc_ivs_generic", &calc_ivs_generic);
    emscripten::function("get_wild_locations", &get_wild_locations);
    emscripten::function("get_area_species", &get_area_species);

    emscripten::value_array<std::array<u8, 6>>("std_array_u8_6")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>())
        .element(emscripten::index<2>())
        .element(emscripten::index<3>())
        .element(emscripten::index<4>())
        .element(emscripten::index<5>());

    emscripten::value_object<CalibrationState>("CalibrationState")
        .field("initialSeed", &CalibrationState::initialSeed)
        .field("seedFrame", &CalibrationState::seedFrame)
        .field("advances", &CalibrationState::getAdvances, &CalibrationState::dummySetter<u32>)
        .field("pid", &CalibrationState::getPID, &CalibrationState::dummySetter<u32>)
        .field("nature", &CalibrationState::getNature, &CalibrationState::dummySetter<u8>)
        .field("ability", &CalibrationState::getAbility, &CalibrationState::dummySetter<u8>)
        .field("abilityIndex", &CalibrationState::getAbilityIndex, &CalibrationState::dummySetter<u16>)
        .field("gender", &CalibrationState::getGender, &CalibrationState::dummySetter<u8>)
        .field("ivs", &CalibrationState::getIVs, &CalibrationState::dummySetter<std::array<u8, 6>>)
        .field("shiny", &CalibrationState::getShiny, &CalibrationState::dummySetter<u8>);

    emscripten::value_object<CalibrationWildState>("CalibrationWildState")
        .field("initialSeed", &CalibrationWildState::initialSeed)
        .field("seedFrame", &CalibrationWildState::seedFrame)
        .field("advances", &CalibrationWildState::getAdvances, &CalibrationWildState::dummySetter<u32>)
        .field("pid", &CalibrationWildState::getPID, &CalibrationWildState::dummySetter<u32>)
        .field("nature", &CalibrationWildState::getNature, &CalibrationWildState::dummySetter<u8>)
        .field("ability", &CalibrationWildState::getAbility, &CalibrationWildState::dummySetter<u8>)
        .field("abilityIndex", &CalibrationWildState::getAbilityIndex, &CalibrationWildState::dummySetter<u16>)
        .field("gender", &CalibrationWildState::getGender, &CalibrationWildState::dummySetter<u8>)
        .field("ivs", &CalibrationWildState::getIVs, &CalibrationWildState::dummySetter<std::array<u8, 6>>)
        .field("shiny", &CalibrationWildState::getShiny, &CalibrationWildState::dummySetter<u8>)
        .field("encounterSlot", &CalibrationWildState::getEncounterSlot, &CalibrationWildState::dummySetter<u8>)
        .field("species", &CalibrationWildState::getSpecie, &CalibrationWildState::dummySetter<u16>)
        .field("form", &CalibrationWildState::getForm, &CalibrationWildState::dummySetter<u8>)
        .field("level", &CalibrationWildState::getLevel, &CalibrationWildState::dummySetter<u8>);

    emscripten::value_object<StaticTemplateDisplayInfo>("StaticTemplateDisplayInfo")
        .field("index", &StaticTemplateDisplayInfo::index)
        .field("species", &StaticTemplateDisplayInfo::species)
        .field("form", &StaticTemplateDisplayInfo::form)
        .field("version", &StaticTemplateDisplayInfo::version)
        .field("shiny", &StaticTemplateDisplayInfo::shiny);

    emscripten::value_object<IVRange>("IVRange")
        .field("min", &IVRange::min)
        .field("max", &IVRange::max);

    emscripten::value_array<std::array<IVRange, 6>>("std_array_IVRange_6")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>())
        .element(emscripten::index<2>())
        .element(emscripten::index<3>())
        .element(emscripten::index<4>())
        .element(emscripten::index<5>());
}