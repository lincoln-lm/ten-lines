#include <string>
#include <vector>
#include <array>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <Core/Gen3/Searchers/GameCubeSearcher.hpp>
#include <Core/Gen3/Searchers/StaticSearcher3.hpp>
#include <Core/Gen3/Searchers/WildSearcher3.hpp>
#include <Core/Gen3/Encounters3.hpp>
#include <Core/Gen3/EncounterArea3.hpp>
#include <Core/Gen3/StaticTemplate3.hpp>
#include <Core/Gen3/Profile3.hpp>
#include <Core/Enum/Method.hpp>
#include <Core/Enum/Game.hpp>
#include <Core/Enum/Shiny.hpp>
#include <Core/Enum/Lead.hpp>
#include <Core/Parents/Filters/StateFilter.hpp>
#include "initial_seed.hpp"
#include "searcher.hpp"

void search_seeds_static(u16 trainer_id, u16 secret_id, int category, int template_index, u32 method, u8 shininess, int nature, emscripten::val iv_ranges, emscripten::val result_callback, emscripten::val searching_callback)
{
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

        GameCubeSearcher searcher(tmplate->getSpecie() == 385 ? Method::Channel : Method(method), false, profile, filter);
        searcher.startSearch(min_ivs, max_ivs, tmplate);
        auto searcherResults = searcher.getResults();

        auto results = emscripten::val::array();
        for (auto &searcher_result : searcherResults)
        {
            results.call<void>("push", emscripten::val(G3SearcherState(searcher_result)));
        }
        result_callback(results);
        searching_callback(false);
        return;
    }

    const StaticTemplate3 tmplate = *Encounters3::getStaticEncounter(category, template_index);

    StaticSearcher3 searcher(Method(method), profile, filter);
    searcher.startSearch(min_ivs, max_ivs, &tmplate);
    auto searcherResults = searcher.getResults();
    auto results = emscripten::val::array();
    for (auto &searcher_result : searcherResults)
    {
        results.call<void>("push", emscripten::val(G3SearcherState(searcher_result)));
    }
    result_callback(results);

    searching_callback(false);
}

void search_seeds_wild(u16 trainer_id, u16 secret_id, u32 _game, u8 encounter_category, u16 location, int pokemon, u32 _method, u8 _lead, u8 shininess, int nature, emscripten::val iv_ranges, emscripten::val result_callback, emscripten::val searching_callback)
{
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

    Profile3 profile("", Game::FireRed, trainer_id, secret_id, false);
    WildStateFilter filter(255, 255, shininess, 0, 255, 0, 255, false, min_ivs, max_ivs, natures, powers, slots);

    searching_callback(true);

    WildSearcher3 searcher(method, lead, false, area, profile, filter);
    searcher.startSearch(min_ivs, max_ivs);
    auto searcherResults = searcher.getResults();
    auto results = emscripten::val::array();
    for (auto &searcher_result : searcherResults)
    {
        results.call<void>("push", emscripten::val(G3WildSearcherState(searcher_result)));
    }
    result_callback(results);

    searching_callback(false);
}

EMSCRIPTEN_BINDINGS(searcher)
{
    emscripten::function("search_seeds_static", &search_seeds_static);
    emscripten::function("search_seeds_wild", &search_seeds_wild);

    emscripten::value_object<G3SearcherState>("G3SearcherState")
        .field("seed", &G3SearcherState::getSeed, &G3SearcherState::dummySetter<u32>)
        .field("pid", &G3SearcherState::getPID, &G3SearcherState::dummySetter<u32>)
        .field("nature", &G3SearcherState::getNature, &G3SearcherState::dummySetter<u8>)
        .field("ability", &G3SearcherState::getAbility, &G3SearcherState::dummySetter<u8>)
        .field("abilityIndex", &G3SearcherState::getAbilityIndex, &G3SearcherState::dummySetter<u16>)
        .field("gender", &G3SearcherState::getGender, &G3SearcherState::dummySetter<u8>)
        .field("ivs", &G3SearcherState::getIVs, &G3SearcherState::dummySetter<std::array<u8, 6>>)
        .field("shiny", &G3SearcherState::getShiny, &G3SearcherState::dummySetter<u8>);

    emscripten::value_object<G3WildSearcherState>("G3WildSearcherState")
        .field("seed", &G3WildSearcherState::getSeed, &G3WildSearcherState::dummySetter<u32>)
        .field("pid", &G3WildSearcherState::getPID, &G3WildSearcherState::dummySetter<u32>)
        .field("nature", &G3WildSearcherState::getNature, &G3WildSearcherState::dummySetter<u8>)
        .field("ability", &G3WildSearcherState::getAbility, &G3WildSearcherState::dummySetter<u8>)
        .field("abilityIndex", &G3WildSearcherState::getAbilityIndex, &G3WildSearcherState::dummySetter<u16>)
        .field("gender", &G3WildSearcherState::getGender, &G3WildSearcherState::dummySetter<u8>)
        .field("ivs", &G3WildSearcherState::getIVs, &G3WildSearcherState::dummySetter<std::array<u8, 6>>)
        .field("shiny", &G3WildSearcherState::getShiny, &G3WildSearcherState::dummySetter<u8>)
        .field("encounterSlot", &G3WildSearcherState::getEncounterSlot, &G3WildSearcherState::dummySetter<u8>)
        .field("species", &G3WildSearcherState::getSpecie, &G3WildSearcherState::dummySetter<u16>)
        .field("form", &G3WildSearcherState::getForm, &G3WildSearcherState::dummySetter<u8>)
        .field("level", &G3WildSearcherState::getLevel, &G3WildSearcherState::dummySetter<u8>);
}