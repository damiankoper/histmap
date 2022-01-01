cmake_minimum_required(VERSION 3.10)

project(pre-processor)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/bin")

if(MSVC)
    add_compile_options(/W4 /WX /D_CRT_SECURE_NO_WARNINGS /wd4701 /wd4200)
else()
    add_compile_options(-Wall -Wextra -Wpedantic -Werror -Wno-maybe-uninitialized -Wno-stringop-overflow)
endif()

add_executable(pre-processor src/main.cpp src/sqlite3.c src/data.cpp src/system.cpp)
set_property(TARGET pre-processor PROPERTY C_STANDARD 99)
set_property(TARGET pre-processor PROPERTY CXX_STANDARD 17)
if(UNIX)
    target_link_libraries(pre-processor m dl pthread)
endif()
