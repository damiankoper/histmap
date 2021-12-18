#pragma once

#include <stddef.h>
#include <stdio.h>

#ifdef _WIN32
int __stdcall SetConsoleOutputCP(unsigned int wCodePageID);
#endif

char *ReadFileAlloc(const char *filename, size_t *len); // len is optional
void PrintJsonString(FILE *out, const char *str);
double GetTime();
