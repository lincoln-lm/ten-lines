#include <emscripten.h>
#include <emscripten/bind.h>
#include "util.hpp"
#include "pokefinder_glue.hpp"

EMSCRIPTEN_BINDINGS(pokefinder_glue)
{
    emscripten::value_immutable_unconstructable<EnumeratedStaticTemplate3>("EnumeratedStaticTemplate3")
        .field("index", &EnumeratedStaticTemplate3::index)
        .field("version", emscripten::cast_member<u8>(&EnumeratedStaticTemplate3::version))
        .field("species", &EnumeratedStaticTemplate3::specie)
        .field("form", &EnumeratedStaticTemplate3::form)
        .field("shiny", emscripten::cast_member<u8>(&EnumeratedStaticTemplate3::shiny))
        .field("level", &EnumeratedStaticTemplate3::level);

    emscripten::value_array<std::array<u8, 6>>("std_array_u8_6")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>())
        .element(emscripten::index<2>())
        .element(emscripten::index<3>())
        .element(emscripten::index<4>())
        .element(emscripten::index<5>());

    emscripten::value_array<std::array<u16, 6>>("std_array_u16_6")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>())
        .element(emscripten::index<2>())
        .element(emscripten::index<3>())
        .element(emscripten::index<4>())
        .element(emscripten::index<5>());

    emscripten::value_immutable_unconstructable<ExtendedGeneratorState>("ExtendedGeneratorState")
        .field("initialSeed", &ExtendedGeneratorState::initialSeed)
        .field("seedFrame", &ExtendedGeneratorState::seedFrame)
        .field("ttvAdvances", &ExtendedGeneratorState::ttvAdvances)
        .field("advances", &ExtendedGeneratorState::advances)
        .field("pid", &ExtendedGeneratorState::pid)
        .field("nature", &ExtendedGeneratorState::nature)
        .field("ability", &ExtendedGeneratorState::ability)
        .field("abilityIndex", &ExtendedGeneratorState::abilityIndex)
        .field("gender", &ExtendedGeneratorState::gender)
        .field("ivs", &ExtendedGeneratorState::ivs)
        .field("stats", &ExtendedGeneratorState::stats)
        .field("shiny", &ExtendedGeneratorState::shiny)
        .field("species", &ExtendedGeneratorState::species)
        .field("form", &ExtendedGeneratorState::form);

    emscripten::value_immutable_unconstructable<ExtendedWildGeneratorState>("ExtendedWildGeneratorState")
        .field("initialSeed", &ExtendedWildGeneratorState::initialSeed)
        .field("seedFrame", &ExtendedWildGeneratorState::seedFrame)
        .field("ttvAdvances", &ExtendedWildGeneratorState::ttvAdvances)
        .field("advances", &ExtendedWildGeneratorState::advances)
        .field("pid", &ExtendedWildGeneratorState::pid)
        .field("nature", &ExtendedWildGeneratorState::nature)
        .field("ability", &ExtendedWildGeneratorState::ability)
        .field("abilityIndex", &ExtendedWildGeneratorState::abilityIndex)
        .field("gender", &ExtendedWildGeneratorState::gender)
        .field("ivs", &ExtendedWildGeneratorState::ivs)
        .field("stats", &ExtendedWildGeneratorState::stats)
        .field("shiny", &ExtendedWildGeneratorState::shiny)
        .field("encounterSlot", &ExtendedWildGeneratorState::encounterSlot)
        .field("species", &ExtendedWildGeneratorState::specie)
        .field("form", &ExtendedWildGeneratorState::form)
        .field("level", &ExtendedWildGeneratorState::level)
        .field("method", &ExtendedWildGeneratorState::method);

    emscripten::value_immutable_unconstructable<ExtendedSearcherState>("ExtendedSearcherState")
        .field("seed", &ExtendedSearcherState::seed)
        .field("pid", &ExtendedSearcherState::pid)
        .field("nature", &ExtendedSearcherState::nature)
        .field("ability", &ExtendedSearcherState::ability)
        .field("abilityIndex", &ExtendedSearcherState::abilityIndex)
        .field("gender", &ExtendedSearcherState::gender)
        .field("ivs", &ExtendedSearcherState::ivs)
        .field("shiny", &ExtendedSearcherState::shiny);

    emscripten::value_immutable_unconstructable<ExtendedWildSearcherState>("ExtendedWildSearcherState")
        .field("seed", &ExtendedWildSearcherState::seed)
        .field("pid", &ExtendedWildSearcherState::pid)
        .field("nature", &ExtendedWildSearcherState::nature)
        .field("ability", &ExtendedWildSearcherState::ability)
        .field("abilityIndex", &ExtendedWildSearcherState::abilityIndex)
        .field("gender", &ExtendedWildSearcherState::gender)
        .field("ivs", &ExtendedWildSearcherState::ivs)
        .field("shiny", &ExtendedWildSearcherState::shiny)
        .field("encounterSlot", &ExtendedWildSearcherState::encounterSlot)
        .field("species", &ExtendedWildSearcherState::specie)
        .field("form", &ExtendedWildSearcherState::form)
        .field("level", &ExtendedWildSearcherState::level)
        .field("method", &ExtendedWildSearcherState::method);
}