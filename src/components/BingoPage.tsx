import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type {
    ExtendedGeneratorState,
    ExtendedWildGeneratorState,
    FRLGContiguousSeedEntry,
} from "../tenLines/generated";
import fetchTenLines, { hexSeed, SEED_IDENTIFIER_TO_GAME } from "../tenLines";
import { GENDERS_EN, NATURES_EN } from "../tenLines/resources";
import type { CalibrationFormState } from "./CalibrationForm";
import { proxy } from "comlink";
import useLocalStorage from "../hooks/useLocalStorage";

export function useBingoBoard() {
    const [bingoBoard, setBingoBoard] = useLocalStorage("bingo-board", []);
    const [counters, setCounters] = useLocalStorage("bingo-counters", []);
    return [bingoBoard, setBingoBoard, counters, setCounters] as const;
}

export function getBingoActive() {
    const [searchParams] = useSearchParams();
    return searchParams.get("bingo") === "true";
}

export async function fetchBingo(
    searchSeeds: FRLGContiguousSeedEntry[],
    advancesRange: number[],
    offset: number,
    isStatic: boolean,
    trainerID: string,
    secretID: string,
    game: string,
    calibrationFormState: CalibrationFormState,
    setBingoBoard: React.Dispatch<
        React.SetStateAction<
            | ExtendedGeneratorState[][]
            | ExtendedWildGeneratorState[][]
            | undefined
        >
    >,
    setBingoCounters: React.Dispatch<
        React.SetStateAction<number[][] | undefined>
    >
) {
    const tenLines = await fetchTenLines();
    const bingo_board: ExtendedGeneratorState[][] = [];
    const bingo_counters: number[][] = [];
    setBingoBoard(bingo_board);
    setBingoCounters(bingo_counters);
    const doneCallback = () => {};
    const resultCallback = (results: ExtendedGeneratorState[]) => {
        setBingoBoard((last_bingo_board) => {
            const new_bingo_board = [...(last_bingo_board ?? [])];
            new_bingo_board.push(results);
            return new_bingo_board;
        });
        setBingoCounters((last_bingo_counters) => {
            const new_bingo_counters = [...(last_bingo_counters ?? [])];
            new_bingo_counters.push(results.map(() => 0));
            return new_bingo_counters;
        });
    };
    if (isStatic) {
        await tenLines.check_seeds_static(
            searchSeeds,
            advancesRange,
            [0, 0],
            offset,
            parseInt(trainerID),
            parseInt(secretID),
            calibrationFormState.staticCategory,
            calibrationFormState.staticPokemon,
            calibrationFormState.method,
            255,
            -1,
            [
                [0, 31],
                [0, 31],
                [0, 31],
                [0, 31],
                [0, 31],
                [0, 31],
            ],
            proxy(resultCallback),
            proxy(doneCallback)
        );
    } else {
        await tenLines.check_seeds_wild(
            searchSeeds,
            advancesRange,
            [0, 0],
            offset,
            parseInt(trainerID),
            parseInt(secretID),
            SEED_IDENTIFIER_TO_GAME[game],
            calibrationFormState.wildCategory,
            calibrationFormState.wildLocation,
            -1,
            calibrationFormState.method,
            calibrationFormState.wildLead,
            255,
            -1,
            [
                [0, 31],
                [0, 31],
                [0, 31],
                [0, 31],
                [0, 31],
                [0, 31],
            ],
            proxy(resultCallback),
            proxy(doneCallback)
        );
    }
}

function SpriteImage({
    species,
    form = 0,
    gender = 0,
    shiny = false,
}: {
    species: number;
    form?: number;
    gender?: number;
    shiny?: boolean;
}) {
    const [url, setUrl] = useState(
        `https://github.com/lincoln-lm/g5-sprites/blob/master/sprites/${
            shiny ? "s" : ""
        }${gender == 1 ? "f" : ""}${species.toString().padStart(3, "0")}${
            form ? "-" + form : ""
        }.gif?raw=true`
    );
    return (
        <Box
            component="img"
            src={url}
            sx={{
                imageRendering: "pixelated",
            }}
            onError={() =>
                setUrl(
                    `https://github.com/lincoln-lm/g5-sprites/blob/master/sprites/${
                        shiny ? "s" : ""
                    }${species.toString().padStart(3, "0")}${
                        form ? "-" + form : ""
                    }.gif?raw=true`
                )
            }
        />
    );
}

export default function BingoPage({
    sx,
    hidden,
}: {
    sx?: any;
    hidden?: boolean;
}) {
    const [bingoBoard, _setBingoBoard, counters, setCounters] = useBingoBoard();

    const width = bingoBoard[0]?.length ?? 0;
    const height = bingoBoard.length;

    if (hidden) return null;
    return (
        <Box
            display="grid"
            gridTemplateColumns={`repeat(${width + 1}, 1fr)`}
            gap={2}
            my={2}
            sx={sx}
        >
            {Array.from({ length: (width + 1) * (height + 1) }, (_, i) => {
                const [x, y] = [i % (width + 1), Math.floor(i / (width + 1))];
                if (y == 0 && x == 0) return <Box key={i}></Box>;
                if (y == 0)
                    return (
                        <Box
                            key={i}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {bingoBoard?.[0]?.[x - 1]?.advances}
                        </Box>
                    );
                if (x == 0)
                    return (
                        <Box
                            key={i}
                            sx={{
                                display: "flex",
                                justifyContent: "right",
                                alignItems: "center",
                            }}
                        >
                            {hexSeed(
                                bingoBoard?.[y - 1]?.[0]?.initialSeed ?? 0,
                                16
                            )}
                        </Box>
                    );
                const entry = bingoBoard?.[y - 1]?.[x - 1];
                const counter = counters?.[y - 1]?.[x - 1];
                if (!entry) return null;
                if (counter === undefined) return null;
                return (
                    <Box
                        key={i}
                        sx={{
                            aspectRatio: "1 / 1",
                            width: "100%",
                        }}
                    >
                        <Button
                            variant="contained"
                            color={counter > 0 ? "success" : "secondary"}
                            fullWidth
                            sx={{ height: "100%" }}
                            style={{ display: "block", lineHeight: 1 }}
                            onClick={() => {
                                const newCounters = [...(counters ?? [])];
                                newCounters[y - 1][x - 1] = counter + 1;
                                setCounters(newCounters);
                            }}
                            onMouseDown={(e) => {
                                if (e.button === 1) {
                                    e.preventDefault();
                                    const newCounters = [...(counters ?? [])];
                                    newCounters[y - 1][x - 1] = counter - 1;
                                    if (newCounters[y - 1][x - 1] < 0)
                                        newCounters[y - 1][x - 1] = 0;
                                    setCounters(newCounters);
                                }
                            }}
                        >
                            <SpriteImage
                                species={entry.species}
                                form={entry.form}
                                gender={entry.gender}
                                shiny={entry.shiny !== 0}
                            />
                            <br />
                            <span>
                                {GENDERS_EN[entry.gender]}{" "}
                                {NATURES_EN[entry.nature]}
                            </span>
                            <br />
                            <span>{entry.stats.join("/")}</span>
                        </Button>
                        <span>{counters[y - 1][x - 1]}</span>
                    </Box>
                );
            })}
        </Box>
    );
}
