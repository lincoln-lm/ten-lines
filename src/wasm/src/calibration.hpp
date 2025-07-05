#pragma once
#include <Core/Parents/States/State.hpp>

class CalibrationState : public GeneratorState
{
public:
    CalibrationState(u16 initial_seed, u16 seed_frame, const GeneratorState &state) : GeneratorState(state), initialSeed(initial_seed), seedFrame(seed_frame) {}
    CalibrationState() : GeneratorState(0, 0, {0, 0, 0, 0, 0, 0}, 0, 0, 0, 0, 0, nullptr) {};
    template <typename T>
    void dummySetter(T argument) { (void)argument; }
    u16 initialSeed;
    u16 seedFrame;
};