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
import { Button } from "@mui/material";
import { useSearchParams } from "react-router-dom";

dayjs.extend(duration);

const InitialSeedTable = memo(function InitialSeedTable({
    rows,
    isFRLG,
    gameConsole,
}: {
    rows: InitialSeedResult[];
    isFRLG: boolean;
    gameConsole: string;
}) {
    const [_, setSearchParams] = useSearchParams();
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
            al: "A+L",
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

    function openInCalibration(row: InitialSeedResult, isAuxClick: boolean) {
        setSearchParams((previous) => {
            let params = new URLSearchParams(previous);
            params.set("targetInitialSeed", hexSeed(row.initialSeed, 16));
            params.set(
                "advanceMin",
                Math.max(0, row.advance - 1000).toString()
            );
            params.set("advanceMax", (row.advance + 1000).toString());
            params.set("page", "1");
            if (isFRLG) {
                const [
                    sound,
                    buttonMode,
                    active_button,
                    held_button_modifier,
                    held_button,
                ] = (row.settings as string).split("_");
                params.set("sound", sound);
                params.set("buttonMode", buttonMode);
                params.set("button", active_button);
                params.set(
                    "heldButton",
                    held_button_modifier +
                        (held_button ? "_" + held_button : "")
                );
            }
            if (isAuxClick) {
                window.open(`/?${params.toString()}`);
                return previous;
            }
            return params;
        });
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
                        <TableCell>Open In Calibration</TableCell>
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
                                        {humanizeSettings(
                                            row.settings as string
                                        )}
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                            openInCalibration(row, false);
                                        }}
                                        onMouseDown={(e) => {
                                            if (e.button === 1) {
                                                e.preventDefault();
                                                openInCalibration(row, true);
                                            }
                                        }}
                                    >
                                        Calibration
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

export default InitialSeedTable;
