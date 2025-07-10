#pragma once
#include <Core/Parents/States/State.hpp>
#include <Core/Parents/States/WildState.hpp>

class CalibrationState : public GeneratorState
{
public:
    CalibrationState(u16 initial_seed, u16 seed_frame, u32 ttv_advances, const GeneratorState &state) : GeneratorState(state), initialSeed(initial_seed), seedFrame(seed_frame), ttvAdvances(ttv_advances) {}
    CalibrationState() : GeneratorState(0, 0, {0, 0, 0, 0, 0, 0}, 0, 0, 0, 0, 0, nullptr) {};
    template <typename T>
    void dummySetter(T argument) { (void)argument; }
    void setAdvances(u32 advances) { this->advances = advances; }
    u16 initialSeed;
    u16 seedFrame;
    u32 ttvAdvances;
};

class CalibrationWildState : public WildGeneratorState
{
public:
    CalibrationWildState(u16 initial_seed, u16 seed_frame, u32 ttv_advances, const WildGeneratorState &state) : WildGeneratorState(state), initialSeed(initial_seed), seedFrame(seed_frame), ttvAdvances(ttv_advances) {}
    CalibrationWildState() : WildGeneratorState(0, 0, {0, 0, 0, 0, 0, 0}, 0, 0, 0, 0, 0, 0, 0, 0, 0, nullptr) {};
    template <typename T>
    void dummySetter(T argument) { (void)argument; }
    void setAdvances(u32 advances) { this->advances = advances; }
    u16 initialSeed;
    u16 seedFrame;
    u32 ttvAdvances;
};