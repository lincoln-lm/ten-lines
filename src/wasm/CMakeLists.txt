cmake_minimum_required(VERSION 3.10)

project(wasm_library)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_LIST_DIR}/lib/PokeFinder/CMake")
add_subdirectory(lib/PokeFinder/Source/Core)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_VERBOSE_MAKEFILE on)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_FLAGS "-Wall -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

add_executable(ten_lines src/ten_lines.cpp)

set(WASM_LIB_DIR
    ${CMAKE_CURRENT_SOURCE_DIR}/../$<TARGET_PROPERTY:LIBRARY_NAME>/generated
)
set(WASM_FLAGS
    -sNO_EXIT_RUNTIME=1
    -sALLOW_MEMORY_GROWTH=1
    -sMODULARIZE
    -sSINGLE_FILE=1
    -sNO_DISABLE_EXCEPTION_CATCHING
    -sEXPORT_ES6=1
    -sENVIRONMENT=worker
    --emit-tsd ${WASM_LIB_DIR}/index.d.ts
)

set_target_properties(ten_lines PROPERTIES
    LIBRARY_NAME "tenLines"
    OUTPUT_NAME "index"
    EXECUTABLE_OUTPUT_PATH ${WASM_LIB_DIR}
    RUNTIME_OUTPUT_DIRECTORY ${WASM_LIB_DIR}
)

target_link_libraries(ten_lines PRIVATE embind)
target_link_libraries(ten_lines PRIVATE PokeFinderCore)

target_link_options(ten_lines PRIVATE ${WASM_FLAGS})
