import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { memo } from "react";
import { frameToMS, hexSeed } from "../tenLines";
import type {
    CalibrationState,
    CalibrationWildState,
    FRLGContiguousSeedEntry,
} from "../tenLines/generated";
import {
    ABILITIES_EN,
    GENDERS_EN,
    getNameEn,
    NATURES_EN,
    SHININESS_EN,
} from "../tenLines/resources";

const CalibrationTable = memo(function CalibrationTable({
    rows,
    target,
    gameConsole,
    isStatic,
}: {
    rows: CalibrationState[] | CalibrationWildState[];
    target: FRLGContiguousSeedEntry;
    gameConsole: string;
    isStatic: boolean;
}) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Seed</TableCell>
                        <TableCell>Advances</TableCell>
                        {!isStatic && <TableCell>Slot</TableCell>}
                        {!isStatic && <TableCell>Level</TableCell>}
                        <TableCell>PID</TableCell>
                        <TableCell>Shiny</TableCell>
                        <TableCell>Nature</TableCell>
                        <TableCell>Ability</TableCell>
                        <TableCell>IVs</TableCell>
                        <TableCell>Gender</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => {
                        if (index === 1000) {
                            return <TableRow key={index}>...</TableRow>;
                        } else if (index > 1000) {
                            return null;
                        }
                        const seedMS = frameToMS(row.seedFrame, gameConsole);
                        const offsetMS =
                            seedMS - frameToMS(target.seedFrame, gameConsole);

                        return (
                            <TableRow key={index}>
                                <TableCell>
                                    {/* so only the actual number gets selected on double click */}
                                    <div style={{ float: "left" }}>
                                        {hexSeed(row.initialSeed, 16)} |{" "}
                                        {seedMS}
                                    </div>
                                    <span>ms</span> ({offsetMS >= 0 && "+"}
                                    {offsetMS}
                                    ms)
                                </TableCell>
                                <TableCell>{row.advances}</TableCell>
                                {!isStatic && (
                                    <TableCell>
                                        {
                                            (row as CalibrationWildState)
                                                .encounterSlot
                                        }
                                        :{" "}
                                        {getNameEn(
                                            (row as CalibrationWildState)
                                                .species,
                                            (row as CalibrationWildState).form
                                        )}
                                    </TableCell>
                                )}
                                {!isStatic && (
                                    <TableCell>
                                        {(row as CalibrationWildState).level}
                                    </TableCell>
                                )}
                                <TableCell>{hexSeed(row.pid, 32)}</TableCell>
                                <TableCell>{SHININESS_EN[row.shiny]}</TableCell>
                                <TableCell>{NATURES_EN[row.nature]}</TableCell>
                                <TableCell>
                                    {row.ability}:{" "}
                                    {ABILITIES_EN[row.abilityIndex - 1]}
                                </TableCell>
                                <TableCell>{row.ivs.join("/")}</TableCell>
                                <TableCell>{GENDERS_EN[row.gender]}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

export default CalibrationTable;
