import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { useState } from "react";
import NumericalInput from "./NumericalInput";

function TeachyTVEntry({
    teachyTVMode,
    teachyTVFramesOut,
    onChange,
}: {
    teachyTVMode: boolean;
    teachyTVFramesOut: string;
    onChange: (
        teachyTVMode: boolean,
        teachyTVFramesOut: { isValid: boolean; value: string }
    ) => void;
}) {
    const [teachyTVFramesOutValid, setTeachyTVFramesOutValid] = useState(true);
    return (
        <Box sx={teachyTVMode ? { display: "flex", alignItems: "center" } : {}}>
            {teachyTVMode && (
                <NumericalInput
                    label="Minimum Frames Outside of TeachyTV"
                    name="teachyTVFramesOut"
                    value={teachyTVFramesOut}
                    minimumValue={0}
                    maximumValue={100000000}
                    onChange={(_, value) => {
                        setTeachyTVFramesOutValid(value.isValid);
                        onChange(teachyTVMode, value);
                    }}
                />
            )}
            <FormControlLabel
                style={teachyTVMode ? { marginLeft: 8 } : {}}
                control={
                    <Checkbox
                        checked={teachyTVMode}
                        onChange={(e) => {
                            onChange(e.target.checked, {
                                value: teachyTVFramesOut,
                                isValid: teachyTVFramesOutValid,
                            });
                        }}
                    />
                }
                label="TeachyTV Mode"
                sx={{
                    whiteSpace: "nowrap",
                }}
            />
        </Box>
    );
}

export default TeachyTVEntry;
