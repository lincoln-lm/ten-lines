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
import { frameToMS, hexSeed } from "../tenLines";
import type { InitialSeedResult } from "../tenLines/generated";

dayjs.extend(duration);

const TenLinesTable = memo(function TenLinesTable({
    rows,
    isFRLG,
    gameConsole,
}: {
    rows: InitialSeedResult[];
    isFRLG: boolean;
    gameConsole: string;
}) {
    if (!isFRLG) gameConsole = "Generic";
    function humanizeSettings(settings: string | undefined) {
        if (!settings) return "";
        const [
            sound,
            buttonMode,
            active_button,
            held_button_modifier,
            held_button,
        ] = settings.split("_");
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
        const humanizedButtonModes: Record<string, string> = {
            a: "L=A",
            h: "Help",
            r: "LR",
        };
        return `${humanizedTerms[sound]} | ${humanizedButtonModes[buttonMode]} Button: ${humanizedTerms[active_button]} |  Held: ${humanizedTerms[held_button_modifier]} ${humanizedTerms[held_button]}`;
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
                                {!isFRLG && (
                                    <TableCell>{row.initialSeed}</TableCell>
                                )}
                                <TableCell>
                                    {hexSeed(row.initialSeed, 16)}
                                </TableCell>
                                <TableCell>{row.advance}</TableCell>
                                <TableCell>
                                    {row.seedFrame + row.advance}
                                </TableCell>
                                <TableCell>
                                    {dayjs
                                        .duration(
                                            frameToMS(
                                                row.seedFrame + row.advance,
                                                gameConsole
                                            )
                                        )
                                        .format("HH:mm:ss.SSS")}
                                </TableCell>
                                <TableCell>
                                    {frameToMS(row.seedFrame, gameConsole)}
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
