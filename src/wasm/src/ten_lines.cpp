#include <iostream>
#include <algorithm>
#include <vector>
#include <string>
#include <emscripten/bind.h>
#include <emscripten.h>
#include <Core/RNG/LCRNG.hpp>
#include <Core/Gen3/Generators/StaticGenerator3.hpp>
#include <Core/Gen3/StaticTemplate3.hpp>
#include <Core/Gen3/Profile3.hpp>
#include <Core/Gen3/Profile3.hpp>
#include <Core/Enum/Method.hpp>
#include <Core/Enum/Game.hpp>
#include <Core/Enum/Shiny.hpp>
#include <Core/Parents/Filters/StateFilter.hpp>
#include <Core/Parents/States/State.hpp>
#include <Core/Global.hpp>
#include "generated/ten_lines_precalc.hpp"

u32 find_ten_lines_pointer(u32 target_seed)
{
    u32 distance_from_base = PokeRNG::distance(0, target_seed);
    u32 target = 0xFFFFFFFF - distance_from_base;
    u32 left = 0;
    u32 right = sorted_initial_seeds.size() - 1;
    while (left < right)
    {
        u32 middle = (left + right) / 2;
        if (std::get<0>(sorted_initial_seeds[middle]) <= target)
        {
            left = middle + 1;
        }
        else
        {
            right = middle;
        }
    }
    if (std::get<0>(sorted_initial_seeds[left]) > target)
    {
        return left;
    }
    return 0;
}

void ten_lines_painting(u32 target_seed, u16 result_count, emscripten::val callback)
{
    u32 distance_from_base = PokeRNG::distance(0, target_seed);
    u32 result_index = find_ten_lines_pointer(target_seed);
    auto results = emscripten::val::array();
    for (u32 i = 0; i < result_count; i++)
    {
        auto [advance, seed] = sorted_initial_seeds[(result_index + i) % sorted_initial_seeds.size()];
        results.call<void>("push", emscripten::val::array(std::vector<u32>{advance + distance_from_base, seed}));
    }
    callback(results);
}

struct FRLGSeedEntry
{
    const char *key;
    const char button_mode;
    u32 frame;
    u16 seed;
};

struct FRLGSeedDataStore
{
    std::map<u16, std::vector<FRLGSeedEntry>> seed_map;
    std::map<std::string, std::vector<FRLGSeedEntry>> contiguous_seeds;
};

FRLGSeedDataStore
parse_seed_data(const std::vector<u8> &seed_data_vector)
{
    FRLGSeedDataStore resultant_store;
    u32 ptr = 0;
    while (ptr < seed_data_vector.size())
    {
        const char *key = reinterpret_cast<const char *>(&seed_data_vector[ptr]);
        ptr += strlen(key) + 1;
        u16 starting_frame = *reinterpret_cast<const u16 *>(&seed_data_vector[ptr]);
        ptr += sizeof(u16);
        u8 frame_size = seed_data_vector[ptr];
        ptr += sizeof(u8);
        u32 entries_count = *reinterpret_cast<const u32 *>(&seed_data_vector[ptr]);
        ptr += sizeof(u32);
        std::vector<FRLGSeedEntry> contiguous_entries;
        for (u32 i = 0; i < entries_count; i++)
        {
            u16 seed = *reinterpret_cast<const u16 *>(&seed_data_vector[ptr]);
            ptr += sizeof(u16);
            u8 is_invalid = seed_data_vector[ptr];
            ptr += sizeof(u8);
            if (is_invalid)
            {
                continue;
            }
            // seeds appearing consecutively can reasonably be condensed into their first entry
            if (!contiguous_entries.empty() && contiguous_entries.back().seed == seed)
            {
                continue;
            }
            const char button_mode = *(strchr(key, '_') + 1);
            FRLGSeedEntry entry{key, button_mode, starting_frame + i / frame_size, seed};
            contiguous_entries.emplace_back(entry);
            auto it = resultant_store.seed_map.find(seed);
            if (it == resultant_store.seed_map.end())
            {
                resultant_store.seed_map.emplace(seed, std::vector<FRLGSeedEntry>{entry});
            }
            else
            {
                it->second.emplace_back(entry);
            }
        }
        resultant_store.contiguous_seeds.emplace(std::string(key), contiguous_entries);
    }
    return resultant_store;
}

struct HeldButtonOffset
{
    char button_mode;
    std::string held_button;
    s16 offset;
};

static const std::map<std::string, std::vector<HeldButtonOffset>> HELD_BUTTON_OFFSETS = {
    {"fr",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", -8},
         {'a', "blackout_r", -23},
         {'a', "blackout_a", -31},
         {'a', "blackout_l", 2},
         {'a', "blackout_al", -33},
         {'a', "none", 0},

         {'h', "startup_select", 7},
         {'h', "startup_a", 3},
         {'h', "blackout_r", -23},
         {'h', "blackout_a", -23},
         {'h', "none", 0},

         {'r', "startup_select", -1},
         {'r', "startup_a", -18},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -39},
         {'r', "none", 0},
     }},

    {"lg",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", -8},
         {'a', "blackout_r", -23},
         {'a', "blackout_a", -31},
         {'a', "blackout_l", 2},
         {'a', "blackout_al", -33},
         {'a', "none", 0},

         {'h', "startup_select", 7},
         {'h', "startup_a", 3},
         {'h', "blackout_r", -23},
         {'h', "blackout_a", -23},
         {'h', "none", 0},

         {'r', "startup_select", -1},
         {'r', "startup_a", -18},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -39},
         {'r', "none", 0},
     }},

    {"fr_eu",
     {
         {'a', "startup_select", 8},
         {'a', "none", -1},

         {'h', "startup_select", 7},
         {'h', "none", 0},

         {'r', "startup_select", -9},
         {'r', "none", -8},
     }},

    {"lg_eu",
     {
         {'a', "startup_select", 8},
         {'a', "none", -1},

         {'h', "startup_select", 7},
         {'h', "none", 0},

         {'r', "startup_select", -9},
         {'r', "none", -8},
     }},

    {"fr_jpn_1_0",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", 1},
         {'a', "blackout_r", -10},
         {'a', "blackout_a", -18},
         {'a', "blackout_l", -3},
         {'a', "none", 0},

         {'h', "startup_select", 7},
         {'h', "startup_a", 3},
         {'h', "blackout_r", -27},
         {'h', "blackout_a", -24},
         {'h', "none", 0},

         {'r', "startup_select", 0},
         {'r', "startup_a", -18},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -40},
         {'r', "none", 0},
     }},

    {"fr_jpn_1_1",
     {
         {'a', "startup_select", 10},
         {'a', "startup_a", -9},
         {'a', "blackout_r", -23},
         {'a', "blackout_a", -31},
         {'a', "blackout_l", -6},
         {'a', "none", 0},

         {'h', "startup_select", -7},
         {'h', "startup_a", -19},
         {'h', "blackout_r", -21},
         {'h', "blackout_a", -29},
         {'h', "none", 0},

         {'r', "startup_select", -7},
         {'r', "startup_a", -4},
         {'r', "blackout_r", -29},
         {'r', "blackout_a", -38},
         {'r', "none", 0},
     }},

    {"lg_jpn",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", -9},
         {'a', "blackout_r", -22},
         {'a', "blackout_a", -40},
         {'a', "blackout_l", -7},
         {'a', "none", 0},

         {'h', "startup_select", -1},
         {'h', "startup_a", -18},
         {'h', "blackout_r", -23},
         {'h', "blackout_a", -31},
         {'h', "none", 0},

         {'r', "startup_select", -1},
         {'r', "startup_a", -23},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -39},
         {'r', "none", 0},
     }},

    {"fr_mgba",
     {
         {'a', "none", 0},

         {'h', "none", 0},

         {'r', "none", 0},
     }},

    {"lg_mgba",
     {
         {'a', "none", 0},

         {'h', "none", 0},

         {'r', "none", 0},
     }},
};

void ten_lines_frlg(u32 target_seed, u16 result_count, std::string game_version, emscripten::val seed_data, emscripten::val callback)
{
    std::vector<u8> seed_data_vector = emscripten::convertJSArrayToNumberVector<u8>(seed_data);
    auto frlg_seed_map = parse_seed_data(seed_data_vector).seed_map;
    auto held_button_offsets = HELD_BUTTON_OFFSETS.at(game_version);

    u32 distance_from_base = PokeRNG::distance(0, target_seed);
    u32 result_index = find_ten_lines_pointer(target_seed);
    auto results = emscripten::val::array();
    for (u32 i = 0, valid_results = 0; valid_results < result_count; i++)
    {
        auto [advance, seed] = sorted_initial_seeds[(result_index + i) % sorted_initial_seeds.size()];
        for (auto &held_button_offset : held_button_offsets)
        {
            u16 unoffset_seed = seed - held_button_offset.offset;
            auto it = frlg_seed_map.find(unoffset_seed);
            // no known way to achieve this seed in frlg
            if (it == frlg_seed_map.end())
            {
                continue;
            }
            for (auto &entry : it->second)
            {
                // the offset needed to achieve this seed only happens with a different button mode
                if (entry.button_mode != held_button_offset.button_mode)
                {
                    continue;
                }
                valid_results++;
                u16 frame = entry.frame;
                const char *key = entry.key;
                auto result = emscripten::val::array(std::vector<u32>{advance + distance_from_base, seed, frame});
                result.call<void>("push", std::string(key) + "_" + held_button_offset.held_button);
                results.call<void>("push", result);
                if (valid_results >= result_count)
                {
                    break;
                }
            }
            if (valid_results >= result_count)
            {
                break;
            }
        }
    }
    callback(results);
}

emscripten::val get_contiguous_seed_list(emscripten::val seed_data, std::string setting_key, std::string game_version, std::string held_button)
{
    std::vector<u8> seed_data_vector = emscripten::convertJSArrayToNumberVector<u8>(seed_data);
    auto seed_data_store = parse_seed_data(seed_data_vector);
    std::vector<FRLGSeedEntry> &contiguous_seeds = seed_data_store.contiguous_seeds.at(setting_key);
    const auto &offsets = HELD_BUTTON_OFFSETS.at(game_version);
    auto held_button_offset = std::find_if(offsets.begin(), offsets.end(), [&](const HeldButtonOffset &held_button_offset)
                                           { return held_button_offset.held_button == held_button; });
    emscripten::val entries = emscripten::val::array();
    if (held_button_offset == offsets.end())
    {
        return entries;
    }
    for (auto &seed : contiguous_seeds)
    {
        auto entry = emscripten::val::object();
        entry.set("seed", seed.seed);
        entry.set("frame", seed.frame);
        entries.call<void>("push", entry);
    }
    return entries;
}

struct StaticResult
{
    u32 advance;
    u16 seed;
    u16 frame;
    u32 pid;
    u8 nature;
    u8 ability;
    std::array<u8, 6> ivs;
};

void check_seeds(emscripten::val seeds, emscripten::val advance_range, int nature, emscripten::val iv_ranges, emscripten::val result_callback, emscripten::val searching_callback)
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

    StaticTemplate3 tmplate(Game::FireRed, 1, 0, Shiny::Random, 1, false);
    Profile3 profile("", Game::FireRed, 0, 0, false);
    StateFilter filter(255, 255, 255, false, min_ivs, max_ivs, natures, powers);

    searching_callback(true);

    for (int i = 0; i < seeds["length"].as<int>(); i++)
    {
        u16 seed = seeds[i]["seed"].as<u16>();
        u16 frame = seeds[i]["frame"].as<u16>();
        StaticGenerator3 generator(
            initial_advances, max_advances, 0, Method::Method1, tmplate, profile, filter);
        auto generator_results = generator.generate(seed);
        auto results = emscripten::val::array();
        for (auto &generator_result : generator_results)
        {
            StaticResult result = {
                .advance = generator_result.getAdvances(),
                .seed = seed,
                .frame = frame,
                .pid = generator_result.getPID(),
                .nature = generator_result.getNature(),
                .ability = generator_result.getAbility(),
                .ivs = generator_result.getIVs(),
            };
            results.call<void>("push", emscripten::val(result));
        }
        result_callback(results);
    }
    searching_callback(false);
}

EMSCRIPTEN_BINDINGS(ten_lines)
{
    emscripten::function("ten_lines_painting", &ten_lines_painting);
    emscripten::function("ten_lines_frlg", &ten_lines_frlg);
    emscripten::function("get_contiguous_seed_list", &get_contiguous_seed_list);
    emscripten::function("check_seeds", &check_seeds);

    emscripten::value_object<StaticResult>("StaticResult")
        .field("advance", &StaticResult::advance)
        .field("seed", &StaticResult::seed)
        .field("frame", &StaticResult::frame)
        .field("pid", &StaticResult::pid)
        .field("nature", &StaticResult::nature)
        .field("ability", &StaticResult::ability)
        .field("ivs", &StaticResult::ivs);

    emscripten::value_array<std::array<u8, 6>>("std_array_u8_6")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>())
        .element(emscripten::index<2>())
        .element(emscripten::index<3>())
        .element(emscripten::index<4>())
        .element(emscripten::index<5>());
}