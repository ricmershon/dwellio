"use client";

import dynamic from "next/dynamic";
import { PropsValue, StylesConfig, Theme, GroupBase, SingleValue } from "react-select";
const Select = dynamic(() => import("react-select"), { ssr: false });

import { OptionType } from "@/types";

const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    singleValue: (baseStyles) => ({ ...baseStyles, fontSize: ".875rem" }),
    option: (baseStyles) => ({ ...baseStyles, fontSize: ".875rem" }),
    control: (baseStyles) => ({ ...baseStyles, minHeight: "35px" }),
    menu: (baseStyles) => ({ ...baseStyles, fontSize: ".875rem" }),
    placeholder: (baseStyles) => ({ ...baseStyles, fontSize: ".875rem" }),
    indicatorSeparator: (baseStyles) => ({ ...baseStyles, display: "none" })
};

const customTheme = (theme: Theme) => ({
    ...theme,
    borderRadius: 6,
    colors: {
        ...theme.colors,
        neutral20: "#d1d5dc",
        primary: "#0058C2"
    }
});

interface DwellioSelectProps {
    options: OptionType[];
    placeholder?: string;
    name?: string;
    id?: string;
    defaultValue?: PropsValue<OptionType>;
    value?: PropsValue<OptionType>;
    onChange?: (selectedOption: SingleValue<OptionType>) => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    isClearable?: boolean;
    isSearchable?: boolean;
    [x: string]: unknown;
}

// TODO: Make colors consistent with rest of scheme
const DwellioSelect = ({ 
    options, 
    placeholder, 
    name, 
    id, 
    defaultValue, 
    onChange,
    isDisabled = false,
    isLoading = false,
    isClearable = false,
    isSearchable = true,
    ...restProps 
}: DwellioSelectProps) => {
    
    // Wrapper function to handle the onChange with proper typing
    const handleChange = (newValue: unknown) => {
        if (onChange) {
            onChange(newValue as SingleValue<OptionType>);
        }
    };

    return (
        <Select
            options={options}
            isClearable={isClearable}
            isSearchable={isSearchable}
            isDisabled={isDisabled}
            isLoading={isLoading}
            placeholder={placeholder}
            name={name}
            id={id}
            defaultValue={defaultValue}
            onChange={handleChange}
            styles={customStyles as StylesConfig<unknown, boolean, GroupBase<unknown>>}
            theme={customTheme}
            {...restProps}
        />
    );
};

export default DwellioSelect;