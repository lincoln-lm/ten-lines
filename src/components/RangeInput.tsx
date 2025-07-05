import { Box } from "@mui/material";
import { useState } from "react";
import NumericalInput from "./NumericalInput";

function RangeInput({
    label,
    name,
    value,
    minimumValue,
    maximumValue,
    onChange,
    ...props
}: {
    label: string;
    name: string;
    value: [string, string];
    minimumValue: number;
    maximumValue: number;
    onChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        value: {
            isValid: boolean;
            value: [string, string];
        }
    ) => void;
    [key: string]: any;
}) {
    const [minValid, setMinValid] = useState(true);
    const [maxValid, setMaxValid] = useState(true);
    const minChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        { value: newMin, isValid }: { value: string; isValid: boolean }
    ) => {
        setMinValid(isValid);
        onChange(event, {
            value: [newMin, value[1]],
            isValid: isValid && maxValid,
        });
    };
    const maxChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        { value: newMax, isValid }: { value: string; isValid: boolean }
    ) => {
        setMaxValid(isValid);
        onChange(event, {
            value: [value[0], newMax],
            isValid: minValid && isValid,
        });
    };
    return (
        <Box sx={{ display: "flex" }}>
            <NumericalInput
                label={`Minimum ${label}`}
                name={name}
                minimumValue={minimumValue}
                maximumValue={maxValid ? parseInt(value[1]) : maximumValue}
                onChange={minChange}
                value={value[0]}
                {...props}
            />
            <div
                style={{
                    margin: "0 10px",
                    alignSelf: "center",
                }}
            >
                -
            </div>
            <NumericalInput
                label={`Maximum ${label}`}
                name={name}
                minimumValue={minValid ? parseInt(value[0]) : minimumValue}
                maximumValue={maximumValue}
                onChange={maxChange}
                value={value[1]}
                {...props}
            />
        </Box>
    );
}

export default RangeInput;
