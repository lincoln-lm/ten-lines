import { Box, Button } from "@mui/material";
import { useState } from "react";
import NumericalInput from "./NumericalInput";
import React from "react";

function RangeInput({
    label,
    name,
    value,
    minimumValue,
    maximumValue,
    isLeewayWindow,
    onChange,
    resetButton = false,
    leewayWindowButton = false,
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
            isLeewayWindow: boolean;
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
            isLeewayWindow,
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
            isLeewayWindow,
        });
    };

    // TODO: converting the events is hacky but nothing currently actually cares about the event
    const resetRanges = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMinValid(true);
        setMaxValid(true);
        onChange(event as any, {
            value: [minimumValue.toString(), maximumValue.toString()],
            isValid: true,
            isLeewayWindow,
        });
    };
    const toggleLeewayWindow = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!minValid || !maxValid) return;
        const windowMiddle = Math.floor(
            parseInt(value[0]) + parseInt(value[1]) / 2
        );
        const windowWidth = parseInt(value[1]) - parseInt(value[0]);
        const newMin = Math.floor(windowMiddle - windowWidth / 2);
        const newMax = Math.floor(windowMiddle + windowWidth / 2);
        setMinValid(true);
        setMaxValid(true);
        onChange(event as any, {
            value: [newMin.toString(), newMax.toString()],
            isValid: true,
            isLeewayWindow: !isLeewayWindow,
        });
    };
    return (
        <Box sx={{ display: "flex" }}>
            {isLeewayWindow ? (
                <></>
            ) : (
                <React.Fragment>
                    <NumericalInput
                        label={`Minimum ${label}`}
                        name={name}
                        minimumValue={minimumValue}
                        maximumValue={
                            maxValid ? parseInt(value[1]) : maximumValue
                        }
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
                        minimumValue={
                            minValid ? parseInt(value[0]) : minimumValue
                        }
                        maximumValue={maximumValue}
                        onChange={maxChange}
                        value={value[1]}
                        {...props}
                    />
                </React.Fragment>
            )}
            {leewayWindowButton && (
                <Button
                    onClick={toggleLeewayWindow}
                    size="large"
                    sx={{
                        maxWidth: "35px",
                        minWidth: "35px",
                    }}
                >
                    ↔
                </Button>
            )}
            {resetButton && (
                <Button
                    onClick={resetRanges}
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
