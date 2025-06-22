#include <iostream>
#include <random>
#include <emscripten/bind.h>

int testFunction()
{
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<int> dis(0, 100);
    return dis(gen);
}

EMSCRIPTEN_BINDINGS(my_module)
{
    emscripten::function("testFunction", &testFunction);
}