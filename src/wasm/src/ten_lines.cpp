#include <iostream>
#include <algorithm>
#include <vector>
#include <emscripten/bind.h>
#include <emscripten.h>
#include <Core/RNG/LCRNG.hpp>
#include <Core/Global.hpp>
#include "generated/ten_lines_precalc.h"

void ten_lines(u32 target_seed, u16 result_count, emscripten::val callback)
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
    u16 result_index = 0;
    if (std::get<0>(sorted_initial_seeds[left]) > target)
    {
        result_index = left;
    }
    auto results = emscripten::val::array();
    for (u32 i = 0; i < result_count; i++)
    {
        auto result = sorted_initial_seeds[(result_index + i) % sorted_initial_seeds.size()];
        results.call<void>("push", emscripten::val::array(std::vector<u32>{std::get<0>(result) + distance_from_base, std::get<1>(result)}));
    }
    callback(results);
}

EMSCRIPTEN_BINDINGS(ten_lines)
{
    emscripten::function("ten_lines", &ten_lines);
}