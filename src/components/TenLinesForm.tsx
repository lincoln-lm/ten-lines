import { proxy } from "comlink";
import { useState } from "react";

import { Box, Button } from "@mui/material";

import fetchTenLines from "../tenLines";
import NumericalInput from "./NumericalInput";
import TenLinesTable, { type TenLinesDatum } from "./TenLinesTable";

export default function TenLinesForm() {
    const [data, setData] = useState<TenLinesDatum[]>([]);
    const [formData, setFormData] = useState<{
        targetSeed: number | null;
        count: number | null;
    }>({
        targetSeed: 0xdeadbeef,
        count: 10,
    });
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formData.targetSeed == null || formData.count == null) return;
        fetchTenLines().then((lib) => {
            setData([]);
            lib.ten_lines(
                formData.targetSeed as number,
                formData.count as number,
                proxy((result: []) => {
                    setData(
                        result.map((item) => ({
                            advances: item[0],
                            seed: item[1],
                        }))
                    );
                })
            );
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} p={2}>
            <NumericalInput
                label="Target Seed"
                name="targetSeed"
                minimumValue={0}
                maximumValue={0xffffffff}
                isHex={true}
                startingValue={formData.targetSeed?.toString(16)}
                changeSignal={(_, value) =>
                    setFormData((data) => ({ ...data, targetSeed: value }))
                }
            ></NumericalInput>
            <NumericalInput
                label="Result Count"
                name="resultCount"
                minimumValue={0}
                maximumValue={5000}
                startingValue={formData.count?.toString()}
                changeSignal={(_, value) =>
                    setFormData((data) => ({ ...data, count: value }))
                }
            ></NumericalInput>
            <Button variant="contained" color="primary" type="submit" fullWidth>
                Submit
            </Button>
            <TenLinesTable rows={data} />
        </Box>
    );
}
