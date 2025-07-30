#include <vector>
#include <algorithm>
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
#include "initial_seed.hpp"
#include "pokefinder_glue.hpp"
#include "util.hpp"
#include "blisy_events.hpp"

// these events are only accessible in RSE so they are always calculated without ttv
emscripten::typed_array<ExtendedGeneratorState> generate_blisy_events(
    emscripten::typed_array<FRLGContiguousSeedEntry> seeds,
    emscripten::typed_range<u32> advances_range,
    u32 offset,
    u32 template_index,
    Profile3 profile,
    StateFilter filter)
{
    emscripten::typed_array<ExtendedGeneratorState> results;
    u32 initial_advances = advances_range.min();
    u32 max_advances = advances_range.max() - advances_range.min();
    const StaticTemplate3 *static_template = BlisyEvents::get_template(template_index);
    for (int i = 0; i < seeds.size(); i++)
    {
        FRLGContiguousSeedEntry entry = seeds[i];
        u16 seed = entry.initialSeed;
        u16 seed_frame = entry.seedFrame;
        // these events pull the current rng state and use it to immediately generate the pokemon following the GC method
        PokeRNG rng(seed, initial_advances + offset);
        for (u32 cnt = 0; cnt <= max_advances; cnt++, rng.next())
        {
            GameCubeGenerator generator(0, 0, 0, static_template->getSpecie() == 385 ? Method::Channel : Method::XDColo, false, profile, filter);
            auto generator_results = generator.generate(rng.getSeed(), static_template);
            for (auto &generator_result : generator_results)
            {
                ExtendedGeneratorState current_result(seed, seed_frame, 0, static_template->getSpecie(), static_template->getForm(), generator_result);
                current_result.advances = cnt + initial_advances;
                results.push_back(current_result);
            }
        }
    }
    return results;
}

void check_seeds_static(
    emscripten::typed_array<FRLGContiguousSeedEntry> seeds,
    emscripten::typed_range<u32> advances_range,
    emscripten::typed_range<u32> ttv_advances_range,
    u32 offset,
    Game game,
    u16 trainer_id,
    u16 secret_id,
    int category,
    int template_index,
    Method method,
    u8 shininess,
    int nature,
    u8 gender,
    emscripten::typed_array<emscripten::typed_range<u8>> iv_ranges,
    emscripten::callback<void(emscripten::typed_array<ExtendedGeneratorState>)> result_callback,
    emscripten::callback<void(bool)> searching_callback)
{
    // in TTV mode this refers to the visual frame you trigger the encounter on
    // in normal mode this refers to the rng advance you trigger the encounter on
    // for the sake of timing, this is also treated as the final frame
    u32 starting_final_frame = advances_range.min();
    u32 ending_final_frame = advances_range.max();
    u32 initial_ttv_advances = ttv_advances_range.min();
    u32 ending_ttv_advances = std::min(ttv_advances_range.max(), ending_final_frame);

    StateFilter filter = build_static_filter(shininess, nature, gender, -1, iv_ranges);
    Profile3 profile = build_profile(game, trainer_id, secret_id);

    searching_callback(true);
    if (category == BlisyEvents::CATEGORY)
    {
        result_callback(generate_blisy_events(seeds, advances_range, offset, template_index, profile, filter));
        searching_callback(false);
        return;
    }

    const StaticTemplate3 static_template = *Encounters3::getStaticEncounter(category, template_index);
    u16 species = static_template.getSpecie();
    u8 form = static_template.getForm();

    for (int i = 0; i < seeds.size(); i++)
    {
        emscripten::typed_array<ExtendedGeneratorState> results;
        FRLGContiguousSeedEntry entry = seeds[i];

        u16 seed = entry.initialSeed;
        u16 seed_frame = entry.seedFrame;
        for (u32 ttv_advances = initial_ttv_advances; ttv_advances <= ending_ttv_advances; ttv_advances++)
        {
            // final frame = frames spent in ttv + frames spent outside of ttv
            // for the sake of timing, = ttv advances + regular advances
            // (if ttv mode is off, ttv advances are always 0 and regular advances = final frame)

            // subtract ttv advances from final frame to determine regular advance range
            u32 starting_advances = starting_final_frame > ttv_advances ? starting_final_frame - ttv_advances : 0;
            u32 ending_advances = ending_final_frame > ttv_advances ? ending_final_frame - ttv_advances : 0;
            u32 max_advances = ending_advances - starting_advances;

            // ttv advances cause 313 regular advances
            StaticGenerator3 generator(
                starting_advances + ttv_advances * 313,
                max_advances,
                offset,
                method,
                static_template,
                profile,
                filter);
            auto generator_results = generator.generate(seed);
            for (auto &generator_result : generator_results)
            {
                results.push_back(ExtendedGeneratorState(seed, seed_frame, ttv_advances, species, form, generator_result));
            }
        }
        result_callback(results);
    }
    searching_callback(false);
}

void check_seeds_wild(
    emscripten::typed_array<FRLGContiguousSeedEntry> seeds,
    emscripten::typed_range<u32> advances_range,
    emscripten::typed_range<u32> ttv_advances_range,
    u32 offset,
    Game game,
    u16 trainer_id,
    u16 secret_id,
    Encounter encounter_category,
    u16 location,
    int pokemon,
    Method method,
    Lead lead,
    u8 shininess,
    int nature,
    u8 gender,
    emscripten::typed_array<emscripten::typed_range<u8>> iv_ranges,
    emscripten::callback<void(emscripten::typed_array<ExtendedWildGeneratorState>)> result_callback,
    emscripten::callback<void(bool)> searching_callback)
{
    u32 starting_final_frame = advances_range.min();
    u32 ending_final_frame = advances_range.max();
    u32 initial_ttv_advances = ttv_advances_range.min();
    u32 ending_ttv_advances = std::min(ttv_advances_range.max(), ending_final_frame);

    // wild methods are +4 from static methods
    method = Method(static_cast<std::underlying_type_t<Method>>(method) - 4);
    auto methods = method == Method(1 | 2 | 4) ? std::vector<Method>{Method::Method1, Method::Method2, Method::Method4} : std::vector<Method>{method};

    // leads are only available in Emerald
    if (game != Game::Emerald)
    {
        lead = Lead::None;
    }

    EncounterArea3 encounter_area = get_encounter_area(encounter_category, location, game);
    WildStateFilter filter = build_wild_filter(encounter_area, pokemon, shininess, nature, gender, -1, iv_ranges);
    Profile3 profile = build_profile(game, trainer_id, secret_id);

    searching_callback(true);

    for (int i = 0; i < seeds.size(); i++)
    {
        emscripten::typed_array<ExtendedWildGeneratorState> results;
        FRLGContiguousSeedEntry entry = seeds[i];

        u16 seed = entry.initialSeed;
        u16 seed_frame = entry.seedFrame;
        for (u32 ttv_advances = initial_ttv_advances; ttv_advances <= ending_ttv_advances; ttv_advances++)
        {
            u32 starting_advances = starting_final_frame > ttv_advances ? starting_final_frame - ttv_advances : 0;
            u32 ending_advances = ending_final_frame > ttv_advances ? ending_final_frame - ttv_advances : 0;
            u32 max_advances = ending_advances - starting_advances;

            for (Method m : methods)
            {
                WildGenerator3 generator(
                    starting_advances + ttv_advances * 313,
                    max_advances,
                    offset,
                    m,
                    lead,
                    false,
                    encounter_area,
                    profile,
                    filter);
                auto generator_results = generator.generate(seed);
                for (auto &generator_result : generator_results)
                {
                    results.push_back(ExtendedWildGeneratorState(seed, seed_frame, ttv_advances, m, generator_result));
                }
            }
            result_callback(results);
        }
    }
    searching_callback(false);
}

EMSCRIPTEN_BINDINGS(calibration)
{
    emscripten::smart_function("check_seeds_static", &check_seeds_static);
    emscripten::smart_function("check_seeds_wild", &check_seeds_wild);
}