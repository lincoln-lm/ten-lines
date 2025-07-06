import { useState } from "react";
import RangeInput from "./RangeInput";
import React from "react";

function IvEntry({
    value,
    onChange,
}: {
    value: [string, string][];
    onChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        value: { value: [string, string][]; isValid: boolean }
    ) => void;
}) {
    const [ivRangeVailidities, setIvRangeVailidities] = useState([
        true,
        true,
        true,
        true,
        true,
        true,
    ]);

    const handleChange = (
        stat: number,
        event: React.ChangeEvent<HTMLInputElement>,
        { isValid, value: range }: { isValid: boolean; value: [string, string] }
    ) => {
        const currentValue = [...value];
        const currentIvRangeVailidities = [...ivRangeVailidities];
        setIvRangeVailidities((data) => {
            const newData = [...data];
            newData[stat] = isValid;
            return newData;
        });
        currentIvRangeVailidities[stat] = isValid;
        const allIvRangesAreValid = currentIvRangeVailidities.reduce(
            (a, b) => a && b,
            true
        );
        currentValue[stat] = range;
        onChange(event, { value: currentValue, isValid: allIvRangesAreValid });
    };
    return (
        <React.Fragment>
            <RangeInput
                label="HP"
                name="hpRange"
                onChange={(event, value) => handleChange(0, event, value)}
                value={value[0]}
                minimumValue={0}
                maximumValue={31}
                resetButton
            />
            <RangeInput
                label="Attack"
                name="atkRange"
                onChange={(event, value) => handleChange(1, event, value)}
                value={value[1]}
                minimumValue={0}
                maximumValue={31}
                resetButton
            />
            <RangeInput
                label="Defense"
                name="defRange"
                onChange={(event, value) => handleChange(2, event, value)}
                value={value[2]}
                minimumValue={0}
                maximumValue={31}
                resetButton
            />
            <RangeInput
                label="Special Attack"
                name="spaRange"
                onChange={(event, value) => handleChange(3, event, value)}
                value={value[3]}
                minimumValue={0}
                maximumValue={31}
                resetButton
            />
            <RangeInput
                label="Special Defense"
                name="spdRange"
                onChange={(event, value) => handleChange(4, event, value)}
                value={value[4]}
                minimumValue={0}
                maximumValue={31}
                resetButton
            />
            <RangeInput
                label="Speed"
                name="speRange"
                onChange={(event, value) => handleChange(5, event, value)}
                value={value[5]}
                minimumValue={0}
                maximumValue={31}
                resetButton
            />
        </React.Fragment>
    );
}

export default IvEntry;
