"""Build file to generate ten lines precalc data"""

from datetime import datetime

import glob
import shutil
import sys
import os
import csv
import requests
import numpy as np

BASE_SEED = 0

FR_ENG_SHEET = "https://docs.google.com/spreadsheets/d/1Mf3F4kTvNEYyDGWKVmMSiar3Fwh1PLzWVXUvGx9YxfA/gviz/tq?tqx=out:csv&sheet=Fire%20Red%20Raw%20Seed%20Data"
LG_ENG_SHEET = "https://docs.google.com/spreadsheets/d/12TUcXGbLY_bBDfVsgWZKvqrX13U6XAATQZrYnzBKP6Y/gviz/tq?tqx=out:csv&sheet=Leaf%20Green%20Seeds"

FR_JPN_1_0_SHEET = "https://docs.google.com/spreadsheets/d/1xSYuAuGSZQ4JbgQN262cfo80_A2CYko74bYGzl5ABTA/gviz/tq?tqx=out:csv&sheet=JPN%20Fire%20Red%201.0%20Seeds"
FR_JPN_1_1_SHEET = "https://docs.google.com/spreadsheets/d/1aQeWaZSi1ycSytrNEOwxJNoEg-K4eItYagU_dh9VIeU/gviz/tq?tqx=out:csv&sheet=JPN%20Fire%20Red%201.0%20Seeds"

LG_JPN_SHEET = "https://docs.google.com/spreadsheets/d/1LSRVD0_zK6vyd6ettUDfaCFJbm00g451d8s96dqAbA4/gviz/tq?tqx=out:csv&sheet=JPN%20Leaf%20Green%20Seeds"


class SeedDataStore:
    """Binary format for list of seeds for a particular game"""

    def __init__(self, starting_frame: int, frame_size: int):
        self.data = {}
        self.starting_frame = starting_frame
        self.frame_size = frame_size

    def add_seed(self, sound, l, button, seed):
        """Add a seed to the store"""
        key = f"{sound}_{l}_{button}"
        if key not in self.data:
            self.data[key] = []
        self.data[key].append(seed)

    def serialize(self):
        """Serialize the store to bytes"""
        data = bytes()
        for key, seeds in self.data.items():
            data += key.encode("utf-8") + b"\0"
            data += self.starting_frame.to_bytes(2, "little")
            data += self.frame_size.to_bytes(1, "little")
            data += len(seeds).to_bytes(4, "little")
            for seed in seeds:
                data += seed.to_bytes(3, "little")
        return data


def pull_frlg_seeds():
    """Pull FRLG seeds from spreadsheet"""
    time_stamp = datetime.now()
    with open(
        sys.argv[1] + "/src/generated/frlg_seeds_timestamp.txt", "w+", encoding="utf-8"
    ) as f:
        f.write(str(time_stamp))
    sheet_txt = requests.get(
        FR_ENG_SHEET,
        timeout=15,
    ).text
    sheet_csv = csv.reader(sheet_txt.split("\n"))
    fr_eng_seeds = SeedDataStore(starting_frame=4100 // 2 - 15, frame_size=2)
    for i, row in enumerate(sheet_csv):
        if i == 0:
            continue
        if row[0]:

            def add_seed(col, sound, l, button):
                seed_str = row[col]
                if seed_str in ("", "-", "0"):
                    seed_str = "10000"
                seed = int(seed_str, 16)
                if seed > 0xFFFF:
                    seed = 0x10000
                fr_eng_seeds.add_seed(sound, l, button, seed)

            add_seed(3, "stereo", "a", "a")
            add_seed(7, "stereo", "h", "a")
            add_seed(11, "stereo", "r", "a")
            add_seed(15, "mono", "a", "a")
            add_seed(19, "mono", "h", "a")
            add_seed(23, "mono", "r", "a")
            add_seed(27, "mono", "r", "start")
            add_seed(31, "mono", "a", "start")
            add_seed(35, "mono", "h", "start")
            add_seed(39, "stereo", "h", "start")
            add_seed(43, "stereo", "r", "start")
            add_seed(47, "stereo", "a", "start")
            add_seed(51, "stereo", "a", "l")
            add_seed(55, "mono", "a", "l")

    sheet_txt = requests.get(
        LG_ENG_SHEET,
        timeout=15,
    ).text
    sheet_csv = csv.reader(sheet_txt.split("\n"))
    lg_eng_seeds = SeedDataStore(starting_frame=4062 // 2 - 45, frame_size=1)
    for i, row in enumerate(sheet_csv):
        if i < 3:
            continue
        if row[0]:

            def add_seed(col, sound, l, button):
                seed_str = row[col]
                if seed_str in ("", "-", "0"):
                    seed_str = "10000"
                seed = int(seed_str, 16)
                if seed > 0xFFFF:
                    seed = 0x10000
                seed = int(seed_str, 16)
                lg_eng_seeds.add_seed(sound, l, button, seed)

            add_seed(3, "mono", "r", "a")
            add_seed(4, "mono", "a", "a")
            add_seed(5, "mono", "h", "a")
            add_seed(6, "stereo", "r", "a")
            add_seed(7, "stereo", "a", "a")
            add_seed(8, "stereo", "h", "a")
            add_seed(9, "mono", "r", "start")
            add_seed(10, "mono", "a", "start")
            add_seed(11, "mono", "h", "start")
            add_seed(12, "stereo", "r", "start")
            add_seed(13, "stereo", "a", "start")
            add_seed(14, "stereo", "h", "start")
            add_seed(15, "mono", "a", "l")
            add_seed(16, "stereo", "a", "l")

    sheet_txt = requests.get(
        FR_JPN_1_0_SHEET,
        timeout=15,
    ).text
    sheet_csv = csv.reader(sheet_txt.split("\n"))
    fr_jpn_1_0_seeds = SeedDataStore(starting_frame=2090 - 45, frame_size=1)
    for i, row in enumerate(sheet_csv):
        if i < 3:
            continue
        if row[0]:

            def add_seed(col, sound, l, button):
                seed_str = row[col]
                if seed_str in ("", "-", "0"):
                    seed_str = "10000"
                seed = int(seed_str, 16)
                if seed > 0xFFFF:
                    seed = 0x10000
                seed = int(seed_str, 16)
                fr_jpn_1_0_seeds.add_seed(sound, l, button, seed)

            add_seed(1, "mono", "r", "a")
            add_seed(2, "mono", "a", "a")
            add_seed(3, "mono", "h", "a")
            add_seed(4, "stereo", "r", "a")
            add_seed(5, "stereo", "a", "a")
            add_seed(6, "stereo", "h", "a")

    sheet_txt = requests.get(
        FR_JPN_1_1_SHEET,
        timeout=15,
    ).text
    sheet_csv = csv.reader(sheet_txt.split("\n"))
    fr_jpn_1_1_seeds = SeedDataStore(starting_frame=2090 - 45, frame_size=1)
    for i, row in enumerate(sheet_csv):
        if i < 3:
            continue
        if row[0]:

            def add_seed(col, sound, l, button):
                seed_str = row[col]
                if seed_str in ("", "-", "0"):
                    seed_str = "10000"
                seed = int(seed_str, 16)
                if seed > 0xFFFF:
                    seed = 0x10000
                seed = int(seed_str, 16)
                fr_jpn_1_1_seeds.add_seed(sound, l, button, seed)

            add_seed(1, "mono", "r", "a")
            add_seed(2, "mono", "a", "a")
            add_seed(3, "mono", "h", "a")
            add_seed(4, "stereo", "r", "a")
            add_seed(5, "stereo", "a", "a")
            add_seed(6, "stereo", "h", "a")

    sheet_txt = requests.get(
        LG_JPN_SHEET,
        timeout=15,
    ).text
    sheet_csv = csv.reader(sheet_txt.split("\n"))
    lg_jpn_seeds = SeedDataStore(starting_frame=2090 - 41, frame_size=1)
    for i, row in enumerate(sheet_csv):
        if i < 3:
            continue
        if row[0]:

            def add_seed(col, sound, l, button):
                seed_str = row[col]
                if seed_str in ("", "-", "0"):
                    seed_str = "10000"
                seed = int(seed_str, 16)
                if seed > 0xFFFF:
                    seed = 0x10000
                seed = int(seed_str, 16)
                lg_jpn_seeds.add_seed(sound, l, button, seed)

            add_seed(1, "mono", "r", "a")
            add_seed(2, "mono", "a", "a")
            add_seed(3, "mono", "h", "a")
            add_seed(4, "stereo", "r", "a")
            add_seed(5, "stereo", "a", "a")
            add_seed(6, "stereo", "h", "a")

    with open(sys.argv[1] + "/src/generated/fr_eng.bin", "wb") as f:
        f.write(fr_eng_seeds.serialize())
    with open(sys.argv[1] + "/src/generated/lg_eng.bin", "wb") as f:
        f.write(lg_eng_seeds.serialize())
    with open(sys.argv[1] + "/src/generated/fr_jpn_1_0.bin", "wb") as f:
        f.write(fr_jpn_1_0_seeds.serialize())
    with open(sys.argv[1] + "/src/generated/fr_jpn_1_1.bin", "wb") as f:
        f.write(fr_jpn_1_1_seeds.serialize())
    with open(sys.argv[1] + "/src/generated/lg_jpn.bin", "wb") as f:
        f.write(lg_jpn_seeds.serialize())
    if os.path.exists(sys.argv[1] + "../../../public/"):
        os.makedirs(sys.argv[1] + "../../../public/generated", exist_ok=True)
        for file in glob.glob(sys.argv[1] + "/src/generated/*.bin"):
            shutil.copy(file, sys.argv[1] + "../../../public/generated")
    else:
        print("Can't find public dir, assuming building standalone")


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
    # the standard precalc shouldn't really actually change
    if not os.path.exists(sys.argv[1] + "/src/generated/ten_lines_precalc.cpp"):
        with open(
            sys.argv[1] + "/src/generated/ten_lines_precalc.cpp", "w+", encoding="utf-8"
        ) as f:
            f.write("// This file is auto-generated by generate_ten_lines_precalc.py\n")
            f.write("#include <array>\n")
            f.write("#include <Core/Global.hpp>\n\n")
            f.write(
                "std::array<std::tuple<u32, u16>, 0x10000> sorted_initial_seeds = {\n"
            )
            for seed, (dist, seed_value) in enumerate(data):
                f.write(f"    std::make_tuple({dist}, {seed_value}),\n")
            f.write("};\n")
    if not os.path.exists(sys.argv[1] + "/src/generated/ten_lines_precalc.hpp"):
        with open(
            sys.argv[1] + "/src/generated/ten_lines_precalc.hpp", "w+", encoding="utf-8"
        ) as f:
            f.write("// This file is auto-generated by generate_ten_lines_precalc.py\n")
            f.write("#pragma once\n\n")
            f.write("#include <array>\n")
            f.write("#include <Core/Global.hpp>\n\n")
            f.write(
                "extern std::array<std::tuple<u32, u16>, 0x10000> sorted_initial_seeds;"
            )


if __name__ == "__main__":
    os.makedirs(sys.argv[1] + "/src/generated/", exist_ok=True)
    pull_frlg_seeds()
    build_ten_lines_precalc()
    # build_rtc_seeds()
