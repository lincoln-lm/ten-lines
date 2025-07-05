import { InputAdornment, TextField } from "@mui/material";
import { useMemo } from "react";

function NumericalInput({
    label,
    name,
    minimumValue,
    maximumValue,
    isHex,
    onChange,
    value,
    ...props
}: {
    label: string;
    name: string;
    minimumValue: number;
    maximumValue: number;
    onChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        value: {
            isValid: boolean;
            value: string;
        }
    ) => void;
    value: string;
    isHex?: boolean;
    [key: string]: any;
}) {
    const prefix = isHex ? "0x" : "";

    const getError = (value: string) => {
        const reg = new RegExp(isHex ? "[^0-9a-fA-F]+" : "[^0-9]+");
        const intValue = parseInt(value, isHex ? 16 : 10);
        if (reg.test(value)) {
            return "Invalid input";
        } else if (intValue < minimumValue || intValue > maximumValue) {
            return `Value must be between ${
                prefix + (isHex ? minimumValue.toString(16) : minimumValue)
            } and ${
                prefix + (isHex ? maximumValue.toString(16) : maximumValue)
            }`;
        }
        return "";
    };

    const error = useMemo(
        () => getError(value),
        [value, isHex, minimumValue, maximumValue]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let { value } = event.target;
        while (value.charAt(0) === "0") {
            value = value.substring(1);
        }
        if (value === "") {
            value = "0";
        }
        onChange(event, { isValid: getError(value) === "", value });
    };

    return (
        <TextField
            label={label}
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={error !== ""}
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
