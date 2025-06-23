"""Build file to generate ten lines precalc data"""

from datetime import datetime, timedelta

# import csv
# import json
# import gzip
# import requests
import numpy as np
import sys
import os

BASE_SEED = 0

# FR_ENG_SHEET = "https://docs.google.com/spreadsheets/d/1Mf3F4kTvNEYyDGWKVmMSiar3Fwh1PLzWVXUvGx9YxfA/gviz/tq?tqx=out:csv&sheet=Fire%20Red%20Raw%20Seed%20Data"
# LG_ENG_SHEET = "https://docs.google.com/spreadsheets/d/12TUcXGbLY_bBDfVsgWZKvqrX13U6XAATQZrYnzBKP6Y/gviz/tq?tqx=out:csv&sheet=Leaf%20Green%20Seeds"

# FR_JPN_1_0_SHEET = "https://docs.google.com/spreadsheets/d/1xSYuAuGSZQ4JbgQN262cfo80_A2CYko74bYGzl5ABTA/gviz/tq?tqx=out:csv&sheet=JPN%20Fire%20Red%201.0%20Seeds"
# FR_JPN_1_1_SHEET = "https://docs.google.com/spreadsheets/d/1aQeWaZSi1ycSytrNEOwxJNoEg-K4eItYagU_dh9VIeU/gviz/tq?tqx=out:csv&sheet=JPN%20Fire%20Red%201.0%20Seeds"

# LG_JPN_SHEET = "https://docs.google.com/spreadsheets/d/1LSRVD0_zK6vyd6ettUDfaCFJbm00g451d8s96dqAbA4/gviz/tq?tqx=out:csv&sheet=JPN%20Leaf%20Green%20Seeds"

# EU_OFFSETS = {
#     "lr": {"startup_select": -9, "none": -8},
#     "la": {"startup_select": 8, "none": -1},
#     "help": {"startup_select": 7, "none": 0},
# }

# ENG_OFFSETS = {
#     "la": {
#         "startup_select": -1,
#         "startup_a": -8,
#         "blackout_r": -23,
#         "blackout_a": -31,
#         "blackout_l": 2,
#         "blackout_al": -33,
#         "none": 0,
#     },
#     "help": {
#         "startup_select": 7,
#         "startup_a": 3,
#         "blackout_r": -23,
#         "blackout_a": -23,
#         "none": 0,
#     },
#     "lr": {
#         "startup_select": -1,
#         "startup_a": -18,
#         "blackout_r": -23,
#         "blackout_a": -39,
#         "none": 0,
#     },
# }

# FR_JPN_1_0_OFFSETS = {
#     "la": {
#         "startup_select": -1,
#         "startup_a": 1,
#         "blackout_r": -10,
#         "blackout_a": -18,
#         "blackout_l": -3,
#         "none": 0,
#     },
#     "help": {
#         "startup_select": 7,
#         "startup_a": 3,
#         "blackout_r": -27,
#         "blackout_a": -24,
#         "none": 0,
#     },
#     "lr": {
#         "startup_select": 0,
#         "startup_a": -18,
#         "blackout_r": -23,
#         "blackout_a": -40,
#         "none": 0,
#     },
# }

# FR_JPN_1_1_OFFSETS = {
#     "la": {
#         "startup_select": 10,
#         "startup_a": -9,
#         "blackout_r": -23,
#         "blackout_a": -31,
#         "blackout_l": 6,
#         "none": 0,
#     },
#     "help": {
#         "startup_select": -7,
#         "startup_a": -19,
#         "blackout_r": -21,
#         "blackout_a": -29,
#         "none": 0,
#     },
#     "lr": {
#         "startup_select": -7,
#         "startup_a": -4,
#         "blackout_r": -29,
#         "blackout_a": -38,
#         "none": 0,
#     },
# }

# LG_JPN_OFFSETS = {
#     "la": {
#         "startup_select": -1,
#         "startup_a": -9,
#         "blackout_r": -22,
#         "blackout_a": -40,
#         "blackout_l": -7,
#         "none": 0,
#     },
#     "help": {
#         "startup_select": -1,
#         "startup_a": -18,
#         "blackout_r": -23,
#         "blackout_a": -31,
#         "none": 0,
#     },
#     "lr": {
#         "startup_select": -1,
#         "startup_a": -23,
#         "blackout_r": -23,
#         "blackout_a": -39,
#         "none": 0,
#     },
# }


# def pull_frlg_seeds():
#     """Pull FRLG seed from spreadsheet"""
#     time_stamp = datetime.now()
#     frlg_seeds = {
#         "time_stamp": str(time_stamp),
#     } | {
#         game: {
#             sound: {
#                 l: {
#                     button: {
#                         held: {}
#                         for held in (
#                             ("none", "startup_select")
#                             if game in ("fr_eu", "lg_eu")
#                             else (
#                                 (
#                                     "none",
#                                     "startup_select",
#                                     "startup_a",
#                                     "blackout_r",
#                                     "blackout_a",
#                                 )
#                                 + (
#                                     ("blackout_l",)
#                                     + (("blackout_al",) if game in ("fr", "lg") else ())
#                                     if l == "la"
#                                     else ()
#                                 )
#                             )
#                         )
#                     }
#                     for button in ("a", "start") + (("l",) if l == "la" else ())
#                 }
#                 for l in ("la", "help", "lr")
#             }
#             for sound in ("stereo", "mono")
#         }
#         for game in ("fr", "fr_eu", "fr_jpn_1_0", "fr_jpn_1_1", "lg", "lg_eu", "lg_jpn")
#     }

#     sheet_txt = requests.get(
#         FR_ENG_SHEET,
#         timeout=15,
#     ).text
#     sheet_csv = csv.reader(sheet_txt.split("\n"))
#     for i, row in enumerate(sheet_csv):
#         if i == 0:
#             continue
#         if row[0]:
#             program_frame_str = row[0]
#             program_frame = int(program_frame_str)
#             frame = program_frame / 2 - 15

#             def add_seed(col, sound, l, button):
#                 seed_str = row[col]
#                 if seed_str and seed_str != "-":
#                     seed = int(seed_str, 16)
#                     if seed < 0x10000:
#                         eng_fr = frlg_seeds["fr"][sound][l][button]
#                         for held in eng_fr.keys():
#                             offset_seed = (seed + ENG_OFFSETS[l][held]) & 0xFFFF
#                             if offset_seed not in eng_fr[held]:
#                                 eng_fr[held][offset_seed] = frame
#                         eu_fr = frlg_seeds["fr_eu"][sound][l][button]
#                         for held in eu_fr.keys():
#                             offset_seed = (seed + EU_OFFSETS[l][held]) & 0xFFFF
#                             if offset_seed not in eu_fr[held]:
#                                 eu_fr[held][offset_seed] = frame


#             add_seed(3, "stereo", "la", "a")
#             add_seed(7, "stereo", "help", "a")
#             add_seed(11, "stereo", "lr", "a")
#             add_seed(15, "mono", "la", "a")
#             add_seed(19, "mono", "help", "a")
#             add_seed(23, "mono", "lr", "a")
#             add_seed(27, "mono", "lr", "start")
#             add_seed(31, "mono", "la", "start")
#             add_seed(35, "mono", "help", "start")
#             add_seed(39, "stereo", "help", "start")
#             add_seed(43, "stereo", "lr", "start")
#             add_seed(47, "stereo", "la", "start")
#             add_seed(51, "stereo", "la", "l")
#             add_seed(55, "mono", "la", "l")

#     sheet_txt = requests.get(
#         LG_ENG_SHEET,
#         timeout=15,
#     ).text
#     sheet_csv = csv.reader(sheet_txt.split("\n"))
#     for i, row in enumerate(sheet_csv):
#         if i < 3:
#             continue
#         if row[0]:
#             frame = int(row[0]) + 4062 / 2

#             def add_seed(col, sound, l, button):
#                 seed_str = row[col]
#                 if seed_str:
#                     seed = int(seed_str, 16)
#                     eng_lg = frlg_seeds["lg"][sound][l][button]
#                     for held in eng_lg.keys():
#                         offset_seed = (seed + ENG_OFFSETS[l][held]) & 0xFFFF
#                         if offset_seed not in eng_lg[held]:
#                                eng_lg[held][offset_seed] = frame
#                     eu_lg = frlg_seeds["lg_eu"][sound][l][button]
#                     for held in eu_lg.keys():
#                         offset_seed = (seed + EU_OFFSETS[l][held]) & 0xFFFF
#                         if offset_seed not in eu_lg[held]:
#                                 eu_lg[held][offset_seed] = frame

#             add_seed(3, "mono", "lr", "a")
#             add_seed(4, "mono", "la", "a")
#             add_seed(5, "mono", "help", "a")
#             add_seed(6, "stereo", "lr", "a")
#             add_seed(7, "stereo", "la", "a")
#             add_seed(8, "stereo", "help", "a")
#             add_seed(9, "mono", "lr", "start")
#             add_seed(10, "mono", "la", "start")
#             add_seed(11, "mono", "help", "start")
#             add_seed(12, "stereo", "lr", "start")
#             add_seed(13, "stereo", "la", "start")
#             add_seed(14, "stereo", "help", "start")
#             add_seed(15, "mono", "la", "l")
#             add_seed(16, "stereo", "la", "l")

#     sheet_txt = requests.get(
#         FR_JPN_1_0_SHEET,
#         timeout=15,
#     ).text
#     sheet_csv = csv.reader(sheet_txt.split("\n"))
#     for i, row in enumerate(sheet_csv):
#         if i < 3:
#             continue
#         if row[0]:
#             frame = int(row[0]) - 45

#             def add_seed(col, sound, l, button):
#                 if row[col]:
#                     seed = int(row[col], 16)
#                     jpn_fr_1_0 = frlg_seeds["fr_jpn_1_0"][sound][l][button]
#                     for held in jpn_fr_1_0.keys():
#                         offset_seed = (seed + FR_JPN_1_0_OFFSETS[l][held]) & 0xFFFF
#                         if offset_seed not in jpn_fr_1_0[held]:
#                             jpn_fr_1_0[held][offset_seed] = frame

#             add_seed(1, "mono", "lr", "a")
#             add_seed(2, "mono", "la", "a")
#             add_seed(3, "mono", "help", "a")
#             add_seed(4, "stereo", "lr", "a")
#             add_seed(5, "stereo", "la", "a")
#             add_seed(6, "stereo", "help", "a")

#     sheet_txt = requests.get(
#         FR_JPN_1_1_SHEET,
#         timeout=15,
#     ).text
#     sheet_csv = csv.reader(sheet_txt.split("\n"))
#     for i, row in enumerate(sheet_csv):
#         if i < 3:
#             continue
#         if row[0]:
#             frame = int(row[0]) - 45

#             def add_seed(col, sound, l, button):
#                 if row[col]:
#                     seed = int(row[col], 16)
#                     jpn_fr_1_1 = frlg_seeds["fr_jpn_1_1"][sound][l][button]
#                     for held in jpn_fr_1_1.keys():
#                         offset_seed = (seed + FR_JPN_1_1_OFFSETS[l][held]) & 0xFFFF
#                         if offset_seed not in jpn_fr_1_1[held]:
#                             jpn_fr_1_1[held][offset_seed] = frame

#             add_seed(1, "mono", "lr", "a")
#             add_seed(2, "mono", "la", "a")
#             add_seed(3, "mono", "help", "a")
#             add_seed(4, "stereo", "lr", "a")
#             add_seed(5, "stereo", "la", "a")
#             add_seed(6, "stereo", "help", "a")

#     sheet_txt = requests.get(
#         LG_JPN_SHEET,
#         timeout=15,
#     ).text
#     sheet_csv = csv.reader(sheet_txt.split("\n"))
#     for i, row in enumerate(sheet_csv):
#         if i < 3:
#             continue
#         if row[0]:
#             frame = int(row[0]) - 41

#             def add_seed(col, sound, l, button):
#                 if row[col]:
#                     seed = int(row[col], 16)
#                     jpn_lg = frlg_seeds["lg_jpn"][sound][l][button]
#                     for held in jpn_lg.keys():
#                         offset_seed = (seed + LG_JPN_OFFSETS[l][held]) & 0xFFFF
#                         if offset_seed not in jpn_lg[held]:
#                             jpn_lg[held][offset_seed] = frame

#             add_seed(1, "mono", "lr", "a")
#             add_seed(2, "mono", "la", "a")
#             add_seed(3, "mono", "help", "a")
#             add_seed(4, "stereo", "lr", "a")
#             add_seed(5, "stereo", "la", "a")
#             add_seed(6, "stereo", "help", "a")

#     for game, data in frlg_seeds.items():
#         if game == "time_stamp":
#             continue
#         for _sound, data in data.items():
#             for _l, data in data.items():
#                 for _button, data in data.items():
#                     for held in data.keys():
#                         data[held] = {
#                             seed: (frame, i)
#                             for i, (seed, frame) in enumerate(
#                                 sorted(data[held].items(), key=lambda x: x[1])
#                             )
#                         }

#     with gzip.open(
#         "./js_finder/js_finder/resources/generated/frlg_seeds.json.gz",
#         "wt+",
#         encoding="utf-8",
#     ) as f:
#         json.dump(frlg_seeds, f)


# mults/adds for jumping 2^i LCRNG advances
JUMP_DATA = (
    # (mult, add)
    (0x41C64E6D, 0x6073),
    (0xC2A29A69, 0xE97E7B6A),
    (0xEE067F11, 0x31B0DDE4),
    (0xCFDDDF21, 0x67DBB608),
    (0x5F748241, 0xCBA72510),
    (0x8B2E1481, 0x1D29AE20),
    (0x76006901, 0xBA84EC40),
    (0x1711D201, 0x79F01880),
    (0xBE67A401, 0x8793100),
    (0xDDDF4801, 0x6B566200),
    (0x3FFE9001, 0x803CC400),
    (0x90FD2001, 0xA6B98800),
    (0x65FA4001, 0xE6731000),
    (0xDBF48001, 0x30E62000),
    (0xF7E90001, 0xF1CC4000),
    (0xEFD20001, 0x23988000),
    (0xDFA40001, 0x47310000),
    (0xBF480001, 0x8E620000),
    (0x7E900001, 0x1CC40000),
    (0xFD200001, 0x39880000),
    (0xFA400001, 0x73100000),
    (0xF4800001, 0xE6200000),
    (0xE9000001, 0xCC400000),
    (0xD2000001, 0x98800000),
    (0xA4000001, 0x31000000),
    (0x48000001, 0x62000000),
    (0x90000001, 0xC4000000),
    (0x20000001, 0x88000000),
    (0x40000001, 0x10000000),
    (0x80000001, 0x20000000),
    (0x1, 0x40000000),
    (0x1, 0x80000000),
)


def distance(state0: int, state1: int) -> int:
    """Efficiently compute the distance from LCRNG state0 -> state1"""
    mask = 1
    dist = 0

    for mult, add in JUMP_DATA:
        if state0 == state1:
            break

        if (state0 ^ state1) & mask:
            state0 = (state0 * mult + add) & 0xFFFFFFFF
            dist += mask

        mask <<= 1

    return dist


# def build_rtc_seeds():
#     """Build RTC seeds"""
#     rtc_seeds = {}
#     epoch = datetime(year=2000, month=1, day=1)
#     date_time = epoch
#     while date_time.year < 2001:
#         date_time += timedelta(minutes=1)
#         days = (date_time - epoch).days + 1
#         v = (
#             1440 * days
#             + 960 * (date_time.hour // 10)
#             + 60 * (date_time.hour % 10)
#             + 16 * (date_time.minute // 10)
#             + (date_time.minute % 10)
#         )
#         seed = (v >> 16) ^ (v & 0xFFFF)
#         rtc_seeds.setdefault(seed, int((date_time - epoch).total_seconds()))

#     rtc_data = np.empty((len(rtc_seeds), 3), np.uint32)
#     for i, (seed, seconds) in enumerate(rtc_seeds.items()):
#         # for every initial seed, compute the distance from initial seed -> base seed + the "frames" of rtc required to hit it
#         dist = distance(seed, BASE_SEED)
#         seed_time = seconds * 60
#         rtc_data[i] = (dist + seed_time) & 0xFFFFFFFF, seed_time, seed
#     # sort by "total time"
#     rtc_data = rtc_data[rtc_data[:, 0].argsort()]

#     np.save("./js_finder/js_finder/resources/generated/rtc_data.npy", rtc_data)


def build_ten_lines_precalc():
    """Build ten lines precalc"""
    data = np.empty((0x10000, 2), np.uint32)
    for seed in range(0x10000):
        # for every initial seed, compute the distance from initial seed -> base seed
        data[seed] = distance(seed, BASE_SEED), seed
    # sort by distance
    data = data[data[:, 0].argsort()]
    os.makedirs(sys.argv[1] + "/src/generated/", exist_ok=True)
    with open(
        sys.argv[1] + "/src/generated/ten_lines_precalc.h", "w+", encoding="utf-8"
    ) as f:
        f.write("// This file is auto-generated by generate_ten_lines_precalc.py\n")
        f.write("#pragma once\n\n")
        f.write("#include <Core/Global.hpp>\n\n")
        f.write(
            "static const std::array<std::tuple<u32, u16>, 0x10000> sorted_initial_seeds = {\n"
        )
        for seed, (dist, seed_value) in enumerate(data):
            f.write(f"    std::make_tuple({dist}, {seed_value}),\n")
        f.write("};\n")


if __name__ == "__main__":
    # pull_frlg_seeds()
    build_ten_lines_precalc()
    # build_rtc_seeds()
