#include <iostream>
#include <random>
#include <vector>
#include <emscripten/bind.h>
#include <emscripten.h>
#include "types.h"
#include <Core/RNG/LCRNG.hpp>

void ten_lines(u32 target_seed, u32 result_count, emscripten::val callback)
{
    u32 advances = -1;
    PokeRNGR rng(target_seed, -1);
    for (u32 i = 0; i < result_count; i++)
    {
        while (rng.nextUShort(&advances) != 0)
        {
        };
        callback(emscripten::val::array(std::vector<u32>{rng.getSeed(), advances}));
    }
}

EMSCRIPTEN_BINDINGS(ten_lines)
{
    emscripten::function("ten_lines", &ten_lines);
}