import { wrap, type Remote } from "comlink";
import type { MainModule } from "./generated";
import Worker from "./worker?worker";

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

export function hexSeed(seed: number, bits: number) {
    return seed
        .toString(16)
        .toUpperCase()
        .padStart(Math.ceil(bits) / 4, "0");
}

export default fetchTenLines;
