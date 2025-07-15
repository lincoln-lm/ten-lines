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
#include "blisy_events.hpp"

emscripten::typed_array<ExtendedSearcherState> search_blisy_events(
    u32 template_index,
    Profile3 profile,
    StateFilter filter,
    std::array<u8, 6> min_ivs,
    std::array<u8, 6> max_ivs)
{
    emscripten::typed_array<ExtendedSearcherState> results;
    const StaticTemplate3 *static_template = BlisyEvents::get_template(template_index);

    GameCubeSearcher searcher(static_template->getSpecie() == 385 ? Method::Channel : Method::XDColo, false, profile, filter);
    searcher.startSearch(min_ivs, max_ivs, static_template);
    auto search_results = searcher.getResults();
    for (auto &result : search_results)
    {
        results.push_back(result);
    }
    return results;
}

void search_seeds_static(
    u16 trainer_id,
    u16 secret_id,
    int category,
    int template_index,
    Method method,
    u8 shininess,
    int nature,
    emscripten::typed_array<emscripten::typed_range<u8>> iv_ranges,
    emscripten::callback<void(emscripten::typed_array<ExtendedSearcherState>)> result_callback,
    emscripten::callback<void(bool)> searching_callback)
{
    std::array<u8, 6> min_ivs = {iv_ranges[0].min(), iv_ranges[1].min(), iv_ranges[2].min(), iv_ranges[3].min(), iv_ranges[4].min(), iv_ranges[5].min()};
    std::array<u8, 6> max_ivs = {iv_ranges[0].max(), iv_ranges[1].max(), iv_ranges[2].max(), iv_ranges[3].max(), iv_ranges[4].max(), iv_ranges[5].max()};

    StateFilter filter = build_static_filter(shininess, nature, iv_ranges);
    Profile3 profile = build_profile(trainer_id, secret_id);

    searching_callback(true);
    if (category == BlisyEvents::CATEGORY)
    {
        result_callback(search_blisy_events(template_index, profile, filter, min_ivs, max_ivs));
        searching_callback(false);
        return;
    }

    const StaticTemplate3 static_template = *Encounters3::getStaticEncounter(category, template_index);

    StaticSearcher3 searcher(method, profile, filter);
    searcher.startSearch(min_ivs, max_ivs, &static_template);

    emscripten::typed_array<ExtendedSearcherState> results;
    auto search_results = searcher.getResults();

    for (auto &result : search_results)
    {
        results.push_back(result);
    }
    result_callback(results);

    searching_callback(false);
}

void search_seeds_wild(
    u16 trainer_id,
    u16 secret_id,
    Game game,
    Encounter encounter_category,
    u16 location,
    int pokemon,
    Method method,
    Lead lead,
    u8 shininess,
    int nature,
    emscripten::typed_array<emscripten::typed_range<u8>> iv_ranges,
    emscripten::callback<void(emscripten::typed_array<ExtendedWildSearcherState>)> result_callback,
    emscripten::callback<void(bool)> searching_callback)
{
    // wild methods are +4 from static methods
    method = Method(static_cast<std::underlying_type_t<Method>>(method) - 4);

    // leads are only available in Emerald
    if (game != Game::Emerald)
    {
        lead = Lead::None;
    }

    std::array<u8, 6> min_ivs = {iv_ranges[0].min(), iv_ranges[1].min(), iv_ranges[2].min(), iv_ranges[3].min(), iv_ranges[4].min(), iv_ranges[5].min()};
    std::array<u8, 6> max_ivs = {iv_ranges[0].max(), iv_ranges[1].max(), iv_ranges[2].max(), iv_ranges[3].max(), iv_ranges[4].max(), iv_ranges[5].max()};

    EncounterArea3 encounter_area = get_encounter_area(encounter_category, location, game);
    WildStateFilter filter = build_wild_filter(encounter_area, pokemon, shininess, nature, iv_ranges);
    Profile3 profile = build_profile(trainer_id, secret_id);

    searching_callback(true);

    WildSearcher3 searcher(method, lead, false, encounter_area, profile, filter);
    searcher.startSearch(min_ivs, max_ivs);

    emscripten::typed_array<ExtendedWildSearcherState> results;
    auto search_results = searcher.getResults();

    for (auto &result : search_results)
    {
        results.push_back(result);
    }
    result_callback(results);

    searching_callback(false);
}

EMSCRIPTEN_BINDINGS(searcher)
{
    emscripten::smart_function("search_seeds_static", &search_seeds_static);
    emscripten::smart_function("search_seeds_wild", &search_seeds_wild);
}