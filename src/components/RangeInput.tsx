import { Box, Button } from "@mui/material";
import { useState } from "react";
import NumericalInput from "./NumericalInput";

function RangeInput({
    label,
    name,
    value,
    minimumValue,
    maximumValue,
    onChange,
    resetButton = false,
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
    resetButton?: boolean;
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
            <span
                style={{
                    margin: "0 10px",
                    alignSelf: "center",
                }}
            >
                -
            </span>
            <NumericalInput
                label={`Maximum ${label}`}
                name={name}
                minimumValue={minValid ? parseInt(value[0]) : minimumValue}
                maximumValue={maximumValue}
                onChange={maxChange}
                value={value[1]}
                {...props}
            />
            {resetButton && (
                <Button
                    onClick={(e) => {
                        setMinValid(true);
                        setMaxValid(true);
                        // TODO: this is hacky but nothing currently actually cares about the event
                        onChange(e as any, {
                            value: [
                                minimumValue.toString(),
                                maximumValue.toString(),
                            ],
                            isValid: true,
                        });
                    }}
                    size="large"
                    sx={{
                        maxWidth: "35px",
                        minWidth: "35px",
                    }}
                >
                    ↻
                </Button>
            )}
        </Box>
    );
}

export default RangeInput;
