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

const TenLinesTable = memo(function TenLinesTable({
    rows,
    isFRLG,
}: {
    rows: TenLinesDatum[];
    isFRLG: boolean;
}) {
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
                                            Math.floor(
                                                ((row.seedFrames +
                                                    row.advances) /
                                                    (16777216 / 280896)) *
                                                    1000
                                            )
                                        )
                                        .format("HH:mm:ss.SSS")}
                                </TableCell>
                                <TableCell>
                                    {Math.floor(
                                        (row.seedFrames / (16777216 / 280896)) *
                                            1000
                                    )}
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
