#include "initial_seed.hpp"
#include "generated/ten_lines_precalc.hpp"
#include "util.hpp"
#include <Core/RNG/LCRNG.hpp>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <string>
#include <vector>

u32 find_closest_initial_seed_index(u32 target_seed)
{
    u32 distance_from_base = PokeRNG::distance(0, target_seed);
    u32 target = 0xFFFFFFFF - distance_from_base;
    u32 left = 0;
    u32 right = sorted_initial_seeds.size() - 1;
    while (left < right) {
        u32 middle = (left + right) / 2;
        if (std::get<0>(sorted_initial_seeds[middle]) <= target) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }
    if (std::get<0>(sorted_initial_seeds[left]) > target) {
        return left;
    }
    return 0;
}

void painting_seeds(
    u32 target_seed,
    u16 result_count,
    u32 offset,
    emscripten::callback<void(emscripten::typed_array<InitialSeedResult>)> results_callback)
{
    target_seed = PokeRNG(target_seed, -offset).getSeed();
    emscripten::typed_array<InitialSeedResult> results;
    u32 distance_from_base = PokeRNG::distance(0, target_seed);
    u32 result_index = find_closest_initial_seed_index(target_seed);
    for (u32 i = 0; i < result_count; i++) {
        auto [offset_advances, seed] = sorted_initial_seeds[(result_index + i) % sorted_initial_seeds.size()];
        results.push_back(InitialSeedResult {
            .advances = offset_advances + distance_from_base,
            .seedFrame = seed,
            .key = "",
            .initialSeed = seed,
        });
    }
    results_callback(results);
}

void frlg_seeds(
    u32 target_seed,
    u16 result_count,
    u32 offset,
    std::string game_version,
    u32 ttv_frames_out,
    emscripten::val seed_data,
    emscripten::callback<void(emscripten::typed_array<InitialSeedResult>)> results_callback)
{
    target_seed = PokeRNG(target_seed, -offset).getSeed();
    emscripten::typed_array<InitialSeedResult> results;

    std::vector<u8> seed_data_vector = emscripten::convertJSArrayToNumberVector<u8>(seed_data);
    FRLGSeedDataStore seed_store(seed_data_vector);
    auto frlg_seed_map = seed_store.seed_map;
    auto held_button_offsets = HELD_BUTTON_OFFSETS.at(game_version);

    u32 distance_from_base = PokeRNG::distance(0, target_seed);
    u32 result_index = find_closest_initial_seed_index(target_seed);
    for (u32 i = 0, valid_results = 0; valid_results < result_count; i++) {
        auto [offset_advances, seed] = sorted_initial_seeds[(result_index + i) % sorted_initial_seeds.size()];
        u32 advances = offset_advances + distance_from_base;
        // if the advances required to reach this seed are less than the required frames in the overworld
        // then the target is unreachable
        if (advances < ttv_frames_out) {
            continue;
        }
        for (auto& held_button_offset : held_button_offsets) {
            u16 unoffset_seed = seed - held_button_offset.offset;
            auto it = frlg_seed_map.find(unoffset_seed);
            // no known way to achieve this seed in frlg
            if (it == frlg_seed_map.end()) {
                continue;
            }
            for (auto& entry : it->second) {
                // the offset needed to achieve this seed only happens with a different button mode
                if (entry.button_mode != held_button_offset.button_mode) {
                    continue;
                }
                valid_results++;
                u16 frame = entry.seedFrame;
                const char* key = entry.key;
                results.push_back(InitialSeedResult {
                    .advances = advances,
                    .seedFrame = frame,
                    .key = std::string(key) + "_" + held_button_offset.held_button,
                    .initialSeed = seed,
                });
                if (valid_results >= result_count) {
                    break;
                }
            }
            if (valid_results >= result_count) {
                break;
            }
        }
    }
    results_callback(results);
}

emscripten::typed_array<FRLGContiguousSeedEntry> get_contiguous_seed_list(
    emscripten::val seed_data,
    std::string setting_key,
    std::string game_version,
    std::string held_button)
{
    std::vector<u8> seed_data_vector = emscripten::convertJSArrayToNumberVector<u8>(seed_data);
    FRLGSeedDataStore seed_data_store(seed_data_vector);
    std::vector<FRLGSeedEntry>& contiguous_seeds = seed_data_store.contiguous_seeds.at(setting_key);
    const auto& offsets = HELD_BUTTON_OFFSETS.at(game_version);
    auto held_button_offset = std::find_if(offsets.begin(), offsets.end(), [&](const HeldButtonOffset& held_button_offset) { return held_button_offset.held_button == held_button; });
    emscripten::typed_array<FRLGContiguousSeedEntry> entries;
    if (held_button_offset == offsets.end()) {
        return entries;
    }
    for (auto& seed : contiguous_seeds) {
        entries.push_back(FRLGContiguousSeedEntry {
            .seedFrame = seed.seedFrame,
            .initialSeed = static_cast<u16>(seed.initialSeed + held_button_offset->offset),
        });
    }
    return entries;
}
EMSCRIPTEN_BINDINGS(initial_seed)
{
    emscripten::smart_function("ten_lines_painting", &painting_seeds);
    emscripten::smart_function("ten_lines_frlg", &frlg_seeds);
    emscripten::smart_function("get_contiguous_seed_list", &get_contiguous_seed_list);

    emscripten::value_object<FRLGContiguousSeedEntry>("FRLGContiguousSeedEntry")
        .field("seedFrame", &FRLGContiguousSeedEntry::seedFrame)
        .field("initialSeed", &FRLGContiguousSeedEntry::initialSeed);

    emscripten::value_object<InitialSeedResult>("InitialSeedResult")
        .field("advances", &InitialSeedResult::advances)
        .field("seedFrame", &InitialSeedResult::seedFrame)
        .field("settings", &InitialSeedResult::key)
        .field("initialSeed", &InitialSeedResult::initialSeed);
}