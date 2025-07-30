#pragma once
#include "pokefinder_glue.hpp"
#include "util.hpp"
#include <Core/Enum/Game.hpp>
#include <Core/Enum/Shiny.hpp>
#include <Core/Gen3/StaticTemplate3.hpp>
#include <array>

class BlisyEvents {
public:
    static constexpr int CATEGORY = 8;

    static const emscripten::typed_array<EnumeratedStaticTemplate3> get_template_info()
    {
        return BLISY_E_READER_TEMPLATES;
    }

    static const EnumeratedStaticTemplate3* get_template(int index)
    {
        return &BLISY_E_READER_TEMPLATES[index];
    }

protected:
    static inline std::array<EnumeratedStaticTemplate3, 6>
        BLISY_E_READER_TEMPLATES = {
            EnumeratedStaticTemplate3(0, { Game::RSE, 243, 0, Shiny::Random, 0, false }),
            EnumeratedStaticTemplate3(1, { Game::RSE, 244, 0, Shiny::Random, 0, false }),
            EnumeratedStaticTemplate3(2, { Game::RSE, 245, 0, Shiny::Random, 0, false }),
            EnumeratedStaticTemplate3(3, { Game::RSE, 251, 0, Shiny::Never, 0, false }),
            EnumeratedStaticTemplate3(4, { Game::RSE, 251, 0, Shiny::Random, 0, false }),
            EnumeratedStaticTemplate3(5, { Game::RSE, 385, 0, Shiny::Random, 0, false }),
        };
};
