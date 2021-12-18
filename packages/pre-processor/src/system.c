#include "system.h"

#include <stdint.h>
#include <stdlib.h>
#include <time.h>

char *ReadFileAlloc(const char *filename, size_t *len)
{
	FILE *file = fopen(filename, "rb");
	if (!file) return NULL;

	fseek(file, 0L, SEEK_END);
	size_t length = (size_t)ftell(file);
	rewind(file);

	char *buf = malloc(length + 1);
	size_t read = fread(buf, 1, length, file);
	buf[length] = '\0';

	fclose(file);

	if (read != length) return NULL;

	if (len) *len = length;
	return buf;
}

void PrintJsonString(FILE *out, const char *str)
{
	fputc('"', out);
	while (*str)
	{
		char c = *str;

		if (c == '\\' || c == '"' || (c >= 0x00 && c <= 0x1F))
		{
			fprintf(out, "\\u%04X", c);
		}
		else
		{
			fputc(c, out);
		}

		str += 1;
	}
	fputc('"', out);
}

#ifdef _WIN32
int QueryPerformanceFrequency(int64_t *lpFrequency);
int QueryPerformanceCounter(int64_t *lpPerformanceCount);

static int64_t counter_freq;

double GetTime()
{
	if (counter_freq == 0)
	{
		QueryPerformanceFrequency(&counter_freq);
	}

	int64_t counter;
	QueryPerformanceCounter(&counter);
	return (double)counter / counter_freq;
}
#else
double GetTime()
{
	struct timespec counter;
	clock_gettime(CLOCK_MONOTONIC_RAW, &counter);
	return counter.tv_sec + 0.000000001 * counter.tv_nsec;
}
#endif
