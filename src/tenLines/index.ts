import { wrap, type Remote } from "comlink";
import type { MainModule } from "./generated";
import Worker from "./worker?worker";

export const Game = {
    None: 0,
    Ruby: 1 << 0,
    Sapphire: 1 << 1,
    RS: (1 << 0) | (1 << 1),
    Emerald: 1 << 2,
    RSE: (1 << 0) | (1 << 1) | (1 << 2),
    FireRed: 1 << 3,
    LeafGreen: 1 << 4,
    FRLG: (1 << 3) | (1 << 4),
    Gen3: (1 << 0) | (1 << 1) | (1 << 2) | ((1 << 3) | (1 << 4)),
} as const;

export const STATIC_1 = 1;
export const STATIC_2 = 3;
export const STATIC_4 = 4;
export const WILD_1 = STATIC_1 + 4;
export const WILD_2 = STATIC_2 + 4;
export const WILD_4 = STATIC_4 + 4;
export const COMBINED_WILD_METHOD = (1 | 2 | 4) + 4;

let TenLines: Remote<MainModule> | null = null;

const fetchTenLines: () => Promise<Remote<MainModule>> = async () => {
    return await new Promise((resolve) => {
        if (TenLines) {
            resolve(TenLines);
            return;
        }
        const worker = new Worker();
        worker.addEventListener("message", (message) => {
            if (message?.data?.ready == true) {
                TenLines = wrap(worker);
                resolve(TenLines);
            }
        });
    });
};

export const SEED_IDENTIFIER_TO_GAME: Record<string, number> = {
    r_painting: Game.Ruby,
    s_painting: Game.Sapphire,
    e_painting: Game.Emerald,
    fr: Game.FireRed,
    fr_eu: Game.FireRed,
    lg: Game.LeafGreen,
    lg_eu: Game.LeafGreen,
    fr_jpn_1_0: Game.FireRed,
    fr_jpn_1_1: Game.FireRed,
    lg_jpn: Game.LeafGreen,
    fr_mgba: Game.FireRed,
    lg_mgba: Game.LeafGreen,
};

const SEED_URLS: Record<string, string> = {
    fr: "generated/fr_eng.bin",
    fr_eu: "generated/fr_eng.bin",
    lg: "generated/lg_eng.bin",
    lg_eu: "generated/lg_eng.bin",
    fr_jpn_1_0: "generated/fr_jpn_1_0.bin",
    fr_jpn_1_1: "generated/fr_jpn_1_1.bin",
    lg_jpn: "generated/lg_jpn.bin",
    fr_mgba: "generated/fr_eng_mgba.bin",
    lg_mgba: "generated/lg_eng_mgba.bin",
};

export async function fetchSeedData(game: string): Promise<Uint8Array> {
    const response = await fetch(SEED_URLS[game]);
    if (!response.ok) {
        throw new Error("Failed to fetch seeds file");
    }
    return new Uint8Array(await response.arrayBuffer());
}

const SYSTEM_TIMING_DATA: Record<
    string,
    { frame_rate: number; offset_ms: number }
> = {
    Generic: { frame_rate: 16777216 / 280896, offset_ms: 0 },
    GBA: { frame_rate: 16777216 / 280896, offset_ms: -260 },
    GBP: { frame_rate: 16777216 / 280896, offset_ms: 200 },
    NDS: { frame_rate: 16756991 / 280896, offset_ms: 788 },
    "3DS": { frame_rate: 16756991 / 280896, offset_ms: 1558 },
};

export function frameToMS(frame: number, system: string) {
    return (
        Math.floor((frame / SYSTEM_TIMING_DATA[system].frame_rate) * 1000) +
        SYSTEM_TIMING_DATA[system].offset_ms
    );
}

export function teachyTVConversion(
    advances: number,
    minimum_advances_out: number
) {
    const target_advances_via_ttv = advances - minimum_advances_out;
    const ttv_advances = Math.floor(target_advances_via_ttv / 313);
    const actual_advances_via_ttv = ttv_advances * 313;
    const regular_advances = advances - actual_advances_via_ttv;

    return {
        ttv_advances,
        regular_advances,
    };
}

export function hexSeed(seed: number, bits: number) {
    return seed
        .toString(16)
        .toUpperCase()
        .padStart(Math.ceil(bits) / 4, "0");
}

export default fetchTenLines;
