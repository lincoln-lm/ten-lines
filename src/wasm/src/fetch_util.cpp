#include <vector>
#include <algorithm>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <Core/Global.hpp>
#include <Core/Gen3/Encounters3.hpp>
#include <Core/Gen3/EncounterArea3.hpp>
#include "util.hpp"
#include "blisy_events.hpp"

emscripten::typed_array<u16> get_wild_locations(u32 game, u8 encounter_category)
{
    EncounterSettings3 settings;
    std::vector<EncounterArea3> encounter_areas = Encounters3::getEncounters(Encounter(encounter_category), settings, Game(game));
    std::vector<u16> locs;
    std::transform(encounter_areas.begin(), encounter_areas.end(), std::back_inserter(locs),
                   [](const EncounterArea3 &area)
                   { return area.getLocation(); });
    return locs;
}

emscripten::typed_array<u16> get_area_species(u32 game, u8 encounter_category, u16 location)
{
    EncounterSettings3 settings;
    auto encounter_areas = Encounters3::getEncounters(Encounter(encounter_category), settings, Game(game));
    EncounterArea3 area = encounter_areas[location];
    return area.getUniqueSpecies();
}

emscripten::typed_array<EnumeratedStaticTemplate3> get_static_template_info(int category)
{
    if (category == BlisyEvents::CATEGORY)
    {
        return BlisyEvents::get_template_info();
    }

    int size;
    const StaticTemplate3 *templates = Encounters3::getStaticEncounters(category, &size);
    emscripten::typed_array<EnumeratedStaticTemplate3> array;

    for (int i = 0; i < size; i++)
    {
        array.push_back(EnumeratedStaticTemplate3(i, templates[i]));
    }
    return array;
}

EMSCRIPTEN_BINDINGS(fetch_util)
{
    emscripten::smart_function("get_wild_locations", &get_wild_locations);
    emscripten::smart_function("get_area_species", &get_area_species);
    emscripten::smart_function("get_static_template_info", &get_static_template_info);
}