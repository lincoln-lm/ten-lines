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
}

const TenLinesTable = memo(function TenLinesTable({
    rows,
}: {
    rows: TenLinesDatum[];
}) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Seed (dec)</TableCell>
                        <TableCell>Seed (hex)</TableCell>
                        <TableCell>Advances</TableCell>
                        <TableCell>Est. Total Frames</TableCell>
                        <TableCell>Est. Total Time</TableCell>
                        <TableCell>Seed Time</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => {
                        return (
                            <TableRow key={index}>
                                <TableCell>{row.seed}</TableCell>
                                <TableCell>
                                    {row.seed
                                        .toString(16)
                                        .padStart(4, "0")
                                        .toUpperCase()}
                                </TableCell>
                                <TableCell>{row.advances}</TableCell>
                                <TableCell>{row.seed + row.advances}</TableCell>
                                <TableCell>
                                    {dayjs
                                        .duration(
                                            Math.floor(
                                                ((row.seed + row.advances) /
                                                    (16777216 / 280896)) *
                                                    1000
                                            )
                                        )
                                        .format("HH:mm:ss.SSS")}
                                </TableCell>
                                <TableCell>
                                    {Math.floor(
                                        (row.seed / (16777216 / 280896)) * 1000
                                    )}
                                    ms
                                </TableCell>
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
