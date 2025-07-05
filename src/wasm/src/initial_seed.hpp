#pragma once
#include <vector>
#include <map>
#include <string>
#include <Core/Global.hpp>

struct InitialSeedResult
{
    u32 advance;
    u32 seedFrame;
    std::string key;
    u16 initialSeed;
};

struct FRLGContiguousSeedEntry
{
    u32 seedFrame;
    u16 initialSeed;
};

struct FRLGSeedEntry
{
    const char *key;
    const char button_mode;
    u32 seedFrame;
    u16 initialSeed;
};

struct FRLGSeedDataStore
{
    std::map<u16, std::vector<FRLGSeedEntry>> seed_map;
    std::map<std::string, std::vector<FRLGSeedEntry>> contiguous_seeds;

    FRLGSeedDataStore(const std::vector<u8> &seed_data_vector)
    {
        u32 ptr = 0;
        while (ptr < seed_data_vector.size())
        {
            const char *key = reinterpret_cast<const char *>(&seed_data_vector[ptr]);
            ptr += strlen(key) + 1;
            u16 starting_frame = *reinterpret_cast<const u16 *>(&seed_data_vector[ptr]);
            ptr += sizeof(u16);
            u8 frame_size = seed_data_vector[ptr];
            ptr += sizeof(u8);
            u32 entries_count = *reinterpret_cast<const u32 *>(&seed_data_vector[ptr]);
            ptr += sizeof(u32);
            std::vector<FRLGSeedEntry> contiguous_entries;
            for (u32 i = 0; i < entries_count; i++)
            {
                u16 seed = *reinterpret_cast<const u16 *>(&seed_data_vector[ptr]);
                ptr += sizeof(u16);
                u8 is_invalid = seed_data_vector[ptr];
                ptr += sizeof(u8);
                if (is_invalid)
                {
                    continue;
                }
                // seeds appearing consecutively can reasonably be condensed into their first entry
                if (!contiguous_entries.empty() && contiguous_entries.back().initialSeed == seed)
                {
                    continue;
                }
                const char button_mode = *(strchr(key, '_') + 1);
                FRLGSeedEntry entry{key, button_mode, starting_frame + i / frame_size, seed};
                contiguous_entries.emplace_back(entry);
                auto it = seed_map.find(seed);
                if (it == seed_map.end())
                {
                    seed_map.emplace(seed, std::vector<FRLGSeedEntry>{entry});
                }
                else
                {
                    it->second.emplace_back(entry);
                }
            }
            contiguous_seeds.emplace(std::string(key), contiguous_entries);
        }
    }
};

struct HeldButtonOffset
{
    char button_mode;
    std::string held_button;
    s16 offset;
};

static const std::map<std::string, std::vector<HeldButtonOffset>> HELD_BUTTON_OFFSETS = {
    {"fr",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", -8},
         {'a', "blackout_r", -23},
         {'a', "blackout_a", -31},
         {'a', "blackout_l", 2},
         {'a', "blackout_al", -33},
         {'a', "none", 0},

         {'h', "startup_select", 7},
         {'h', "startup_a", 3},
         {'h', "blackout_r", -23},
         {'h', "blackout_a", -23},
         {'h', "none", 0},

         {'r', "startup_select", -1},
         {'r', "startup_a", -18},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -39},
         {'r', "none", 0},
     }},

    {"lg",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", -8},
         {'a', "blackout_r", -23},
         {'a', "blackout_a", -31},
         {'a', "blackout_l", 2},
         {'a', "blackout_al", -33},
         {'a', "none", 0},

         {'h', "startup_select", 7},
         {'h', "startup_a", 3},
         {'h', "blackout_r", -23},
         {'h', "blackout_a", -23},
         {'h', "none", 0},

         {'r', "startup_select", -1},
         {'r', "startup_a", -18},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -39},
         {'r', "none", 0},
     }},

    {"fr_eu",
     {
         {'a', "startup_select", 8},
         {'a', "none", -1},

         {'h', "startup_select", 7},
         {'h', "none", 0},

         {'r', "startup_select", -9},
         {'r', "none", -8},
     }},

    {"lg_eu",
     {
         {'a', "startup_select", 8},
         {'a', "none", -1},

         {'h', "startup_select", 7},
         {'h', "none", 0},

         {'r', "startup_select", -9},
         {'r', "none", -8},
     }},

    {"fr_jpn_1_0",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", 1},
         {'a', "blackout_r", -10},
         {'a', "blackout_a", -18},
         {'a', "blackout_l", -3},
         {'a', "none", 0},

         {'h', "startup_select", 7},
         {'h', "startup_a", 3},
         {'h', "blackout_r", -27},
         {'h', "blackout_a", -24},
         {'h', "none", 0},

         {'r', "startup_select", 0},
         {'r', "startup_a", -18},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -40},
         {'r', "none", 0},
     }},

    {"fr_jpn_1_1",
     {
         {'a', "startup_select", 10},
         {'a', "startup_a", -9},
         {'a', "blackout_r", -23},
         {'a', "blackout_a", -31},
         {'a', "blackout_l", -6},
         {'a', "none", 0},

         {'h', "startup_select", -7},
         {'h', "startup_a", -19},
         {'h', "blackout_r", -21},
         {'h', "blackout_a", -29},
         {'h', "none", 0},

         {'r', "startup_select", -7},
         {'r', "startup_a", -4},
         {'r', "blackout_r", -29},
         {'r', "blackout_a", -38},
         {'r', "none", 0},
     }},

    {"lg_jpn",
     {
         {'a', "startup_select", -1},
         {'a', "startup_a", -9},
         {'a', "blackout_r", -22},
         {'a', "blackout_a", -40},
         {'a', "blackout_l", -7},
         {'a', "none", 0},

         {'h', "startup_select", -1},
         {'h', "startup_a", -18},
         {'h', "blackout_r", -23},
         {'h', "blackout_a", -31},
         {'h', "none", 0},

         {'r', "startup_select", -1},
         {'r', "startup_a", -23},
         {'r', "blackout_r", -23},
         {'r', "blackout_a", -39},
         {'r', "none", 0},
     }},

    {"fr_mgba",
     {
         {'a', "none", 0},

         {'h', "none", 0},

         {'r', "none", 0},
     }},

    {"lg_mgba",
     {
         {'a', "none", 0},

         {'h', "none", 0},

         {'r', "none", 0},
     }},
};
