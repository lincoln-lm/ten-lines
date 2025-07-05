import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { memo } from "react";
import { frameToMS, hexSeed } from "../tenLines";
import type { StaticResult } from "../tenLines/generated";

const NATURES_EN = [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Bold",
    "Docile",
    "Relaxed",
    "Impish",
    "Lax",
    "Timid",
    "Hasty",
    "Serious",
    "Jolly",
    "Naive",
    "Modest",
    "Mild",
    "Quiet",
    "Bashful",
    "Rash",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful",
    "Quirky",
];

const CalibrationTable = memo(function CalibrationTable({
    rows,
    target,
    gameConsole,
}: {
    rows: StaticResult[];
    target: { seed: number; frame: number };
    gameConsole: string;
}) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Seed</TableCell>
                        <TableCell>Advances</TableCell>
                        <TableCell>PID</TableCell>
                        <TableCell>Shiny</TableCell>
                        <TableCell>Nature</TableCell>
                        <TableCell>Ability</TableCell>
                        <TableCell>IVs</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => {
                        if (index === 1000) {
                            return <TableRow key={index}>...</TableRow>;
                        } else if (index > 1000) {
                            return null;
                        }
                        const seedMS = frameToMS(row.frame, gameConsole);
                        const offsetMS =
                            seedMS - frameToMS(target.frame, gameConsole);
                        return (
                            <TableRow key={index}>
                                <TableCell>
                                    {hexSeed(row.seed, 16)} | {seedMS}ms (
                                    {offsetMS >= 0 && "+"}
                                    {offsetMS}
                                    ms)
                                </TableCell>
                                <TableCell>{row.advance}</TableCell>
                                <TableCell>{hexSeed(row.pid, 32)}</TableCell>
                                <TableCell>No</TableCell>
                                <TableCell>{NATURES_EN[row.nature]}</TableCell>
                                <TableCell>{row.ability}</TableCell>
                                <TableCell>{row.ivs.join("/")}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

export default CalibrationTable;
