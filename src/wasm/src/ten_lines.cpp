#include <iostream>
#include <random>
#include <vector>
#include <emscripten/bind.h>
#include <emscripten.h>
#include "types.h"

void ten_lines(u32 target_seed, u32 result_count, emscripten::val callback)
{
    u32 advances = 0;
    for (u32 i = 0; i < result_count; i++)
    {
        while (target_seed >> 16)
        {
            target_seed = target_seed * 0xEEB9EB65 + 0xA3561A1;
            advances++;
        }
        callback(emscripten::val::array(std::vector<u32>{target_seed, advances}));
        target_seed = target_seed * 0xEEB9EB65 + 0xA3561A1;
        advances++;
    }
}

EMSCRIPTEN_BINDINGS(ten_lines)
{
    emscripten::function("ten_lines", &ten_lines);
}