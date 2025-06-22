cmake_minimum_required(VERSION 3.10)

project(wasm_library)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_VERBOSE_MAKEFILE on)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_FLAGS "-Wall -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

add_executable(test_library src/test_library.cpp)

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

set_target_properties(test_library PROPERTIES
    LIBRARY_NAME "testLibrary"
    OUTPUT_NAME "index"
    EXECUTABLE_OUTPUT_PATH ${WASM_LIB_DIR}
    RUNTIME_OUTPUT_DIRECTORY ${WASM_LIB_DIR}
)

target_link_libraries(test_library PRIVATE embind)

target_link_options(test_library PRIVATE ${WASM_FLAGS})
