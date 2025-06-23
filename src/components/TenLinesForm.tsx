import { proxy } from "comlink";
import { useState } from "react";

import { Box, Button } from "@mui/material";

import fetchTenLines from "../tenLines";
import NumericalInput from "./NumericalInput";
import TenLinesTable, { type TenLinesDatum } from "./TenLinesTable";

export default function TenLinesForm() {
    const [data, setData] = useState<TenLinesDatum[]>([]);
    const [formData, setFormData] = useState({
        targetSeed: 0xdeadbeef,
        count: 10,
    });
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        fetchTenLines().then((lib) => {
            setData([]);
            lib.ten_lines(
                formData.targetSeed,
                formData.count,
                proxy((result: number[]) => {
                    setData((data) => [
                        ...data,
                        { seed: result[0], advances: result[1] },
                    ]);
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
                startingValue={formData.targetSeed.toString(16)}
                changeSignal={(_, value) =>
                    setFormData((data) => ({ ...data, targetSeed: value }))
                }
            ></NumericalInput>
            <NumericalInput
                label="Result Count"
                name="resultCount"
                minimumValue={0}
                maximumValue={65535}
                startingValue={formData.count}
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
