import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { memo } from "react";
import { hexSeed } from "../tenLines";
import type {
    ExtendedSearcherState,
    ExtendedWildSearcherState,
} from "../tenLines/generated";
import {
    ABILITIES_EN,
    GENDERS_EN,
    getNameEn,
    NATURES_EN,
    SHININESS_EN,
} from "../tenLines/resources";
import { useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";

const SearcherTable = memo(function SearcherTable({
    rows,
    isStatic,
}: {
    rows: ExtendedSearcherState[] | ExtendedWildSearcherState[];
    isStatic: boolean;
}) {
    const [_, setSearchParams] = useSearchParams();

    function openInInitialSeed(
        row: ExtendedSearcherState | ExtendedWildSearcherState,
        isAuxClick: boolean
    ) {
        setSearchParams((previous) => {
            let params = new URLSearchParams(previous);
            params.set("targetSeed", hexSeed(row.seed, 32));
            params.set("page", "0");
            if (isAuxClick) {
                window.open(`?${params.toString()}`);
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
                        <TableCell>Seed</TableCell>
                        {!isStatic && <TableCell>Slot</TableCell>}
                        {!isStatic && <TableCell>Level</TableCell>}
                        <TableCell>PID</TableCell>
                        <TableCell>Shiny</TableCell>
                        <TableCell>Nature</TableCell>
                        <TableCell>Ability</TableCell>
                        <TableCell>IVs</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Open In Initial Seed</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => {
                        if (index === 1000) {
                            return <TableRow key={index}>...</TableRow>;
                        } else if (index > 1000) {
                            return null;
                        }
                        return (
                            <TableRow key={index}>
                                <TableCell>{hexSeed(row.seed, 32)}</TableCell>
                                {!isStatic && (
                                    <TableCell>
                                        {
                                            (row as ExtendedWildSearcherState)
                                                .encounterSlot
                                        }
                                        :{" "}
                                        {getNameEn(
                                            (row as ExtendedWildSearcherState)
                                                .species,
                                            (row as ExtendedWildSearcherState)
                                                .form
                                        )}
                                    </TableCell>
                                )}
                                {!isStatic && (
                                    <TableCell>
                                        {
                                            (row as ExtendedWildSearcherState)
                                                .level
                                        }
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

                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                            openInInitialSeed(row, false);
                                        }}
                                        onMouseDown={(e) => {
                                            if (e.button === 1) {
                                                e.preventDefault();
                                                openInInitialSeed(row, true);
                                            }
                                        }}
                                    >
                                        Initial Seed
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

export default SearcherTable;
