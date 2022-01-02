#include "system.h"

#include <cstdint>
#include <cstdlib>
#include <ctime>

static char *arena_base;
static size_t arena_len;
static size_t arena_cap;

std::string ReadFile(const char *filename, size_t *len)
{
	FILE *file = fopen(filename, "rb");
	if (!file) abort();

	fseek(file, 0L, SEEK_END);
	size_t length = (size_t)ftell(file);
	rewind(file);

	std::string buf(length, '\0');
	size_t read = fread((void*)buf.data(), 1, length, file);

	fclose(file);

	if (read != length) abort();

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
extern "C" int QueryPerformanceFrequency(int64_t *lpFrequency);
extern "C" int QueryPerformanceCounter(int64_t *lpPerformanceCount);

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
