#pragma once

#include <cstddef>
#include <cstdio>
#include <string>

#ifdef _WIN32
extern "C" int __stdcall SetConsoleOutputCP(unsigned int wCodePageID);
#endif

std::string ReadFile(const char *filename, size_t *len); // len is optional
void PrintJsonString(FILE *out, const char *str);
double GetTime();
