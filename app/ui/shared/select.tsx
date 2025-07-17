'use client';

import dynamic from 'next/dynamic';

import { PropsValue, StylesConfig, Theme } from 'react-select';
const Select = dynamic(() => import('react-select'), { ssr: false });

interface OptionType {
    value: string;
    label: string;
}

const customStyles: StylesConfig<OptionType, false> = {
    singleValue: (baseStyles) => ({
        ...baseStyles,
        fontSize: '.875rem',
    }),
    option: (baseStyles) => ({
        ...baseStyles,
        fontSize: '.875rem',
    }),
    control: (baseStyles) => ({
        ...baseStyles,
        minHeight: '35px',
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        fontSize: '.875rem', 
    }),
    placeholder: (baseStyles) => ({
        ...baseStyles,
        fontSize: '.875rem',
    }),
    indicatorSeparator: (baseStyles) => ({
        ...baseStyles,
        display: 'none',
    })
};

const customTheme = (theme: Theme) => ({
    ...theme,
    borderRadius: 6,
    colors: {
        ...theme.colors,
        neutral20: '#d1d5dc',
        primary: '#0058C2'
    }
});

interface DwellioSelectProps {
    options: OptionType[];
    placeholder: string;
    name: string;
    id: string;
    defaultValue?: PropsValue<OptionType>;
    [x: string]: unknown;
}

const DwellioSelect = ({ options, placeholder, name, id, defaultValue, ...restProps }: DwellioSelectProps) => (
    <Select
        options={options}
        isClearable={false}
        isSearchable={true}
        placeholder={placeholder}
        name={name}
        id={id}
        defaultValue={defaultValue}
        styles={customStyles}
        theme={customTheme}
        {...restProps}
    />
);

export default DwellioSelect;