#include <array>
#include <vector>
#include <algorithm>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <Core/Global.hpp>
#include <Core/Util/IVChecker.hpp>
#include <Core/Gen3/StaticTemplate3.hpp>
#include <Core/Gen3/Encounters3.hpp>
#include <Core/Parents/PersonalInfo.hpp>
#include "util.hpp"

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

emscripten::typed_array<IVRange> calc_ivs_static(int category, int template_index, emscripten::val stats, u8 nature)
{
    const StaticTemplate3 *tmplate = Encounters3::getStaticEncounter(category, template_index);
    const PersonalInfo *info = tmplate->getInfo();
    const std::array<u8, 6> baseStats = info->getStats();
    return calc_ivs(stats, baseStats, nature);
}

emscripten::typed_array<IVRange> calc_ivs_generic(u16 species, u8 form, emscripten::val stats, u8 nature)
{
    const PersonalInfo *info = PersonalLoader::getPersonal(Game::Gen3, species, form);
    const std::array<u8, 6> baseStats = info->getStats();
    return calc_ivs(stats, baseStats, nature);
}

EMSCRIPTEN_BINDINGS(iv_calc)
{
    emscripten::smart_function("calc_ivs_static", &calc_ivs_static);
    emscripten::smart_function("calc_ivs_generic", &calc_ivs_generic);
    emscripten::value_object<IVRange>("IVRange")
        .field("min", &IVRange::min)
        .field("max", &IVRange::max);
}
