import { InputAdornment, TextField } from "@mui/material";
import { useState } from "react";

function NumericalInput({
    label,
    name,
    minimumValue,
    maximumValue,
    isHex,
    changeSignal,
    startingValue = "0",
    ...props
}: {
    label: string;
    name: string;
    minimumValue: number;
    maximumValue: number;
    changeSignal: (
        event: React.ChangeEvent<HTMLInputElement>,
        value: number | null
    ) => void;
    startingValue?: string;
    isHex?: boolean;
    [key: string]: any;
}) {
    const [value, setValue] = useState(startingValue);
    const [valid, setValid] = useState(true);
    const [error, setError] = useState("");
    const prefix = isHex ? "0x" : "";
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let { value } = event.target;
        while (value.charAt(0) === "0") {
            value = value.substring(1);
        }
        if (value === "") {
            value = "0";
        }
        setValue(value);
        const intValue = parseInt(value, isHex ? 16 : 10);
        const reg = new RegExp(isHex ? "/[^0-9A-F]/i" : "[^0-9]");
        setValid(true);
        setError("");
        if (reg.test(value)) {
            setValid(false);
            setError("Invalid input");
        } else if (intValue < minimumValue || intValue > maximumValue) {
            setValid(false);
            setError(
                `Value must be between ${
                    prefix + (isHex ? minimumValue.toString(16) : minimumValue)
                } and ${
                    prefix + (isHex ? maximumValue.toString(16) : maximumValue)
                }`
            );
            changeSignal(event, null);
        } else {
            changeSignal(event, intValue);
        }
    };
    return (
        <TextField
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            fullWidth
            margin="normal"
            error={!valid}
            helperText={error}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            {prefix}
                        </InputAdornment>
                    ),
                },
            }}
            {...props}
        ></TextField>
    );
}

export default NumericalInput;
