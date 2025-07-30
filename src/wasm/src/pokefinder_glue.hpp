#pragma once
#include <emscripten.h>
#include <emscripten/bind.h>
#include <Core/Gen3/EncounterArea3.hpp>
#include <Core/Gen3/Encounters3.hpp>
#include <Core/Gen3/StaticTemplate3.hpp>
#include <Core/Gen3/Profile3.hpp>
#include <Core/Parents/Filters/StateFilter.hpp>
#include <Core/Parents/States/State.hpp>
#include <Core/Parents/States/WildState.hpp>
#include <Core/Enum/Method.hpp>
#include "util.hpp"

inline EncounterArea3 get_encounter_area(
    Encounter encounter_category,
    u16 location,
    Game game)
{
    EncounterSettings3 settings;
    auto encounter_areas = Encounters3::getEncounters(encounter_category, settings, game);
    return encounter_areas[location];
}

inline StateFilter build_static_filter(
    u8 shininess,
    int nature,
    u8 gender,
    int hidden_power,
    emscripten::typed_array<emscripten::typed_range<u8>> iv_ranges)
{

    std::array<bool, 25> natures;
    natures.fill(true);
    if (nature != -1)
    {
        natures.fill(false);
        natures[nature] = true;
    }

    std::array<u8, 6> min_ivs = {iv_ranges[0].min(), iv_ranges[1].min(), iv_ranges[2].min(), iv_ranges[3].min(), iv_ranges[4].min(), iv_ranges[5].min()};
    std::array<u8, 6> max_ivs = {iv_ranges[0].max(), iv_ranges[1].max(), iv_ranges[2].max(), iv_ranges[3].max(), iv_ranges[4].max(), iv_ranges[5].max()};

    std::array<bool, 16> powers;
    powers.fill(true);
    if (hidden_power != -1)
    {
        powers.fill(false);
        powers[hidden_power] = true;
    }

    return StateFilter(gender, 255, shininess, 0, 255, 0, 255, false, min_ivs, max_ivs, natures, powers);
}

inline WildStateFilter build_wild_filter(
    EncounterArea3 encounter_area,
    int pokemon,
    u8 shininess,
    int nature,
    u8 gender,
    int hidden_power,
    emscripten::typed_array<emscripten::typed_range<u8>> iv_ranges)
{
    std::array<u8, 6> min_ivs = {iv_ranges[0].min(), iv_ranges[1].min(), iv_ranges[2].min(), iv_ranges[3].min(), iv_ranges[4].min(), iv_ranges[5].min()};
    std::array<u8, 6> max_ivs = {iv_ranges[0].max(), iv_ranges[1].max(), iv_ranges[2].max(), iv_ranges[3].max(), iv_ranges[4].max(), iv_ranges[5].max()};

    std::array<bool, 25> natures;
    natures.fill(true);
    if (nature != -1)
    {
        natures.fill(false);
        natures[nature] = true;
    }

    std::array<bool, 16> powers;
    powers.fill(true);
    if (hidden_power != -1)
    {
        powers.fill(false);
        powers[hidden_power] = true;
    }

    std::array<bool, 12> slots;
    slots.fill(true);
    if (pokemon != -1)
    {
        u16 species = pokemon & 0x7ff;
        u8 form = pokemon >> 11;
        for (int i = 0; i < 12; i++)
        {
            auto slot = encounter_area.getPokemon(i);
            slots[i] = slot.getSpecie() == species && slot.getForm() == form;
        }
    }

    return WildStateFilter(gender, 255, shininess, 0, 255, 0, 255, false, min_ivs, max_ivs, natures, powers, slots);
}

inline Profile3 build_profile(Game game, u16 trainer_id, u16 secret_id)
{
    return Profile3("", game, trainer_id, secret_id, false);
}

class ExtendedGeneratorState : public GeneratorState
{
public:
    ExtendedGeneratorState(u16 initial_seed, u16 seed_frame, u32 ttv_advances, u16 species, u8 form, const GeneratorState &state) : GeneratorState(state), species(species), form(form), initialSeed(initial_seed), seedFrame(seed_frame), ttvAdvances(ttv_advances) {}

    using GeneratorState::ability;
    using GeneratorState::abilityIndex;
    using GeneratorState::advances;
    using GeneratorState::gender;
    using GeneratorState::hiddenPower;
    using GeneratorState::hiddenPowerStrength;
    using GeneratorState::ivs;
    using GeneratorState::nature;
    using GeneratorState::pid;
    using GeneratorState::shiny;
    using GeneratorState::stats;

    u16 species;
    u8 form;
    u16 initialSeed;
    u16 seedFrame;
    u32 ttvAdvances;
};

class ExtendedWildGeneratorState : public WildGeneratorState
{
public:
    ExtendedWildGeneratorState(u16 initial_seed, u16 seed_frame, u32 ttv_advances, Method method, const WildGeneratorState &state) : WildGeneratorState(state), initialSeed(initial_seed), seedFrame(seed_frame), ttvAdvances(ttv_advances)
    {
        this->method = static_cast<std::underlying_type_t<Method>>(method) + 4;
    }

    using WildGeneratorState::ability;
    using WildGeneratorState::abilityIndex;
    using WildGeneratorState::advances;
    using WildGeneratorState::encounterSlot;
    using WildGeneratorState::form;
    using WildGeneratorState::gender;
    using WildGeneratorState::hiddenPower;
    using WildGeneratorState::hiddenPowerStrength;
    using WildGeneratorState::ivs;
    using WildGeneratorState::level;
    using WildGeneratorState::nature;
    using WildGeneratorState::pid;
    using WildGeneratorState::shiny;
    using WildGeneratorState::specie;
    using WildGeneratorState::stats;

    u16 initialSeed;
    u16 seedFrame;
    u32 ttvAdvances;
    int method;
};

class EnumeratedStaticTemplate3 : public StaticTemplate3
{
public:
    EnumeratedStaticTemplate3(int index, StaticTemplate3 template3) : StaticTemplate3(template3), index(index) {}

    int index;

    using StaticTemplate3::form;
    using StaticTemplate3::level;
    using StaticTemplate3::shiny;
    using StaticTemplate3::specie;
    using StaticTemplate3::version;
};

class ExtendedSearcherState : public SearcherState
{
public:
    ExtendedSearcherState(const SearcherState &state) : SearcherState(state) {}

    using SearcherState::ability;
    using SearcherState::abilityIndex;
    using SearcherState::gender;
    using SearcherState::hiddenPower;
    using SearcherState::hiddenPowerStrength;
    using SearcherState::ivs;
    using SearcherState::nature;
    using SearcherState::pid;
    using SearcherState::seed;
    using SearcherState::shiny;
};

class ExtendedWildSearcherState : public WildSearcherState
{
public:
    ExtendedWildSearcherState(Method method, const WildSearcherState &state) : WildSearcherState(state)
    {
        this->method = static_cast<std::underlying_type_t<Method>>(method) + 4;
    }

    using WildSearcherState::ability;
    using WildSearcherState::abilityIndex;
    using WildSearcherState::encounterSlot;
    using WildSearcherState::form;
    using WildSearcherState::gender;
    using WildSearcherState::hiddenPower;
    using WildSearcherState::hiddenPowerStrength;
    using WildSearcherState::ivs;
    using WildSearcherState::level;
    using WildSearcherState::nature;
    using WildSearcherState::pid;
    using WildSearcherState::seed;
    using WildSearcherState::shiny;
    using WildSearcherState::specie;

    int method;
};