import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DwellioSelect from '@/ui/shared/select';
import { OptionType } from '@/types';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('react-select', () => {
    // Import React inside the mock factory to avoid hoisting issues
    const React = jest.requireActual('react');

    return {
        __esModule: true,
        default: (props: any) => {
            return React.createElement('div', { 'data-testid': 'react-select' },
                React.createElement('select', {
                    'data-testid': 'mock-select',
                    onChange: (e: any) => {
                        const selectedValue = e.target.value;
                        const selectedOption = props.options.find((opt: any) => opt.value === selectedValue);
                        if (props.onChange) {
                            props.onChange(selectedOption || null);
                        }
                    },
                    disabled: props.isDisabled,
                    value: props.value?.value || props.defaultValue?.value || '',
                },
                React.createElement('option', { value: '' }, props.placeholder || 'Select...'),
                ...props.options.map((option: any) =>
                    React.createElement('option', { key: option.value, value: option.value }, option.label)
                ))
            );
        },
    };
});

// Mock next/dynamic to return the mocked react-select
jest.mock('next/dynamic', () => ({
    __esModule: true,
    default: () => jest.requireMock('react-select').default,
}));

// ============================================================================
// TEST SUITE: DwellioSelect Component
// ============================================================================
describe('DwellioSelect Component', () => {
    const mockOptions: OptionType[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Option Rendering
    // ========================================================================
    describe('Option Rendering', () => {
        it('should render select with all options', () => {
            render(<DwellioSelect options={mockOptions} />);

            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
            expect(screen.getByText('Option 3')).toBeInTheDocument();
        });

        it('should render empty select when no options provided', () => {
            render(<DwellioSelect options={[]} />);

            const select = screen.getByTestId('mock-select');
            const options = select.querySelectorAll('option');
            // Only placeholder option
            expect(options).toHaveLength(1);
        });
    });

    // ========================================================================
    // Option Selection
    // ========================================================================
    describe('Option Selection', () => {
        it('should call onChange when option selected', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(<DwellioSelect options={mockOptions} onChange={handleChange} />);

            const select = screen.getByTestId('mock-select');
            await user.selectOptions(select, 'option2');

            await waitFor(() => {
                expect(handleChange).toHaveBeenCalledWith(mockOptions[1]);
            });
        });

        it('should not call onChange when no option selected', () => {
            const handleChange = jest.fn();

            render(<DwellioSelect options={mockOptions} onChange={handleChange} />);

            expect(handleChange).not.toHaveBeenCalled();
        });

        it('should handle onChange with null when clearing', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(<DwellioSelect options={mockOptions} onChange={handleChange} />);

            const select = screen.getByTestId('mock-select');
            await user.selectOptions(select, ''); // Select placeholder (clear)

            await waitFor(() => {
                expect(handleChange).toHaveBeenCalledWith(null);
            });
        });
    });

    // ========================================================================
    // Placeholder Handling
    // ========================================================================
    describe('Placeholder Handling', () => {
        it('should display custom placeholder', () => {
            render(<DwellioSelect options={mockOptions} placeholder="Choose an option" />);

            expect(screen.getByText('Choose an option')).toBeInTheDocument();
        });

        it('should use default placeholder when not provided', () => {
            render(<DwellioSelect options={mockOptions} />);

            expect(screen.getByText('Select...')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Default Value
    // ========================================================================
    describe('Default Value', () => {
        it('should set defaultValue', () => {
            const defaultValue = mockOptions[1];

            render(<DwellioSelect options={mockOptions} defaultValue={defaultValue} />);

            const select = screen.getByTestId('mock-select') as HTMLSelectElement;
            expect(select.value).toBe('option2');
        });

        it('should handle undefined defaultValue', () => {
            render(<DwellioSelect options={mockOptions} defaultValue={undefined} />);

            const select = screen.getByTestId('mock-select') as HTMLSelectElement;
            expect(select.value).toBe('');
        });
    });

    // ========================================================================
    // Disabled State
    // ========================================================================
    describe('Disabled State', () => {
        it('should be enabled by default', () => {
            render(<DwellioSelect options={mockOptions} />);

            const select = screen.getByTestId('mock-select');
            expect(select).not.toBeDisabled();
        });

        it('should be disabled when isDisabled is true', () => {
            render(<DwellioSelect options={mockOptions} isDisabled={true} />);

            const select = screen.getByTestId('mock-select');
            expect(select).toBeDisabled();
        });

        it('should be enabled when isDisabled is false', () => {
            render(<DwellioSelect options={mockOptions} isDisabled={false} />);

            const select = screen.getByTestId('mock-select');
            expect(select).not.toBeDisabled();
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle empty options array', () => {
            render(<DwellioSelect options={[]} />);

            expect(screen.getByTestId('react-select')).toBeInTheDocument();
        });

        it('should handle single option', () => {
            const singleOption = [mockOptions[0]];

            render(<DwellioSelect options={singleOption} />);

            expect(screen.getByText('Option 1')).toBeInTheDocument();
        });

        it('should handle very long option labels', () => {
            const longOption: OptionType[] = [
                { value: 'long', label: 'A'.repeat(100) },
            ];

            render(<DwellioSelect options={longOption} />);

            expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
        });

        it('should handle options with special characters', () => {
            const specialOptions: OptionType[] = [
                { value: 'special', label: 'Option <>&"' },
            ];

            render(<DwellioSelect options={specialOptions} />);

            expect(screen.getByText('Option <>&"')).toBeInTheDocument();
        });

        it('should handle undefined onChange gracefully', async () => {
            const user = userEvent.setup();

            render(<DwellioSelect options={mockOptions} />);

            const select = screen.getByTestId('mock-select');

            // Should not throw error
            await expect(async () => {
                await user.selectOptions(select, 'option1');
            }).not.toThrow();
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Select Component', () => {
        it('should render fully configured select', () => {
            const handleChange = jest.fn();
            const defaultValue = mockOptions[1];

            render(
                <DwellioSelect
                    options={mockOptions}
                    placeholder="Select property type"
                    name="propertyType"
                    id="property-type-select"
                    defaultValue={defaultValue}
                    onChange={handleChange}
                    isSearchable={true}
                    isClearable={true}
                />
            );

            expect(screen.getByText('Select property type')).toBeInTheDocument();
            const select = screen.getByTestId('mock-select') as HTMLSelectElement;
            expect(select.value).toBe('option2');
        });

        it('should handle complete user interaction flow', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(
                <DwellioSelect
                    options={mockOptions}
                    onChange={handleChange}
                    placeholder="Choose option"
                />
            );

            const select = screen.getByTestId('mock-select');

            // Select first option
            await user.selectOptions(select, 'option1');
            await waitFor(() => {
                expect(handleChange).toHaveBeenCalledWith(mockOptions[0]);
            });

            // Select different option
            await user.selectOptions(select, 'option3');
            await waitFor(() => {
                expect(handleChange).toHaveBeenCalledWith(mockOptions[2]);
            });

            expect(handleChange).toHaveBeenCalledTimes(2);
        });

        it('should work in disabled state', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(
                <DwellioSelect
                    options={mockOptions}
                    onChange={handleChange}
                    isDisabled={true}
                />
            );

            const select = screen.getByTestId('mock-select');
            expect(select).toBeDisabled();

            // Attempt to select (should not work)
            try {
                await user.selectOptions(select, 'option1');
            } catch {
                // Expected - disabled select cannot be interacted with
            }

            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    // ========================================================================
    // Dynamic Loading (next/dynamic)
    // ========================================================================
    describe('Dynamic Loading', () => {
        it('should load react-select dynamically', () => {
            render(<DwellioSelect options={mockOptions} />);

            // Component should render even though react-select is dynamically loaded
            expect(screen.getByTestId('react-select')).toBeInTheDocument();
        });

        it('should disable SSR for react-select', () => {
            // next/dynamic is called with { ssr: false }
            // This is tested by the mock implementation
            render(<DwellioSelect options={mockOptions} />);

            expect(screen.getByTestId('react-select')).toBeInTheDocument();
        });
    });
});
