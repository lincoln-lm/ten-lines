import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { memo } from "react";

dayjs.extend(duration);

interface TenLinesDatum {
    seed: number;
    advances: number;
    seedFrames: number;
    settings?: string;
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

function frameToMS(frame: number, system: string) {
    return (
        Math.floor((frame / SYSTEM_TIMING_DATA[system].frame_rate) * 1000) +
        SYSTEM_TIMING_DATA[system].offset_ms
    );
}

const TenLinesTable = memo(function TenLinesTable({
    rows,
    isFRLG,
    gameConsole,
}: {
    rows: TenLinesDatum[];
    isFRLG: boolean;
    gameConsole: string;
}) {
    if (!isFRLG) gameConsole = "Generic";
    function humanizeSettings(settings: string | undefined) {
        if (!settings) return "";
        const [sound, l, active_button, held_button_modifier, held_button] =
            settings.split("_");
        const humanizedTerms: Record<string, string> = {
            stereo: "Stereo",
            mono: "Mono",
            start: "Start",
            select: "Select",
            a: "A",
            l: "L",
            r: "R",
            startup: "Startup",
            blackout: "Blackout",
            al: "L+A",
            none: "None",
            undefined: "",
        };
        const humanizedLSettings: Record<string, string> = {
            a: "L=A",
            h: "Help",
            r: "LR",
        };
        return `${humanizedTerms[sound]} | ${humanizedLSettings[l]} Button: ${humanizedTerms[active_button]} |  Held: ${humanizedTerms[held_button_modifier]} ${humanizedTerms[held_button]}`;
    }
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {!isFRLG && <TableCell>Seed (dec)</TableCell>}
                        <TableCell>Seed (hex)</TableCell>
                        <TableCell>Advances</TableCell>
                        <TableCell>Estimated Total Frames</TableCell>
                        <TableCell>Estimated Total Time</TableCell>
                        <TableCell>Seed Time</TableCell>
                        {isFRLG && <TableCell>Settings</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => {
                        return (
                            <TableRow key={index}>
                                {!isFRLG && <TableCell>{row.seed}</TableCell>}
                                <TableCell>
                                    {row.seed
                                        .toString(16)
                                        .padStart(4, "0")
                                        .toUpperCase()}
                                </TableCell>
                                <TableCell>{row.advances}</TableCell>
                                <TableCell>
                                    {row.seedFrames + row.advances}
                                </TableCell>
                                <TableCell>
                                    {dayjs
                                        .duration(
                                            frameToMS(
                                                row.seedFrames + row.advances,
                                                gameConsole
                                            )
                                        )
                                        .format("HH:mm:ss.SSS")}
                                </TableCell>
                                <TableCell>
                                    {frameToMS(row.seedFrames, gameConsole)}
                                    ms
                                </TableCell>
                                {isFRLG && (
                                    <TableCell>
                                        {humanizeSettings(row.settings)}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

export default TenLinesTable;
export type { TenLinesDatum };
