cmake_minimum_required(VERSION 3.10)

project(pre-processor)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/bin")

add_executable(db src/main.c src/sqlite3.c)
set_property(TARGET db PROPERTY C_STANDARD 99)
if(UNIX)
    target_link_libraries(db m dl pthread)
endif()
