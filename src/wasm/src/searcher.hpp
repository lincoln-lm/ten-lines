#pragma once
#include <Core/Parents/States/State.hpp>
#include <Core/Parents/States/WildState.hpp>

class G3SearcherState : public SearcherState
{
public:
    G3SearcherState(const SearcherState &state) : SearcherState(state) {}
    G3SearcherState() : SearcherState(0, 0, {0, 0, 0, 0, 0, 0}, 0, 0, 0, 0, 0, nullptr) {};
    template <typename T>
    void dummySetter(T argument) { (void)argument; }
};

class G3WildSearcherState : public WildSearcherState
{
public:
    G3WildSearcherState(const WildSearcherState &state) : WildSearcherState(state) {}
    G3WildSearcherState() : WildSearcherState(0, 0, {0, 0, 0, 0, 0, 0}, 0, 0, 0, 0, 0, 0, 0, 0, 0, nullptr) {};
    template <typename T>
    void dummySetter(T argument) { (void)argument; }
};