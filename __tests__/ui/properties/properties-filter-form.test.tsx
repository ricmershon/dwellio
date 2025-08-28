import React from 'react';
import { render, screen, fireEvent } from '@/__tests__/test-utils';
import PropertyFilterForm from '@/ui/properties/properties-filter-form';

// Mock Next.js navigation hooks
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/properties'),
    useSearchParams: jest.fn(() => mockSearchParams),
    useRouter: jest.fn(() => ({
        replace: mockReplace,
    })),
}));

// Mock use-debounce to return a function that calls immediately
jest.mock('use-debounce', () => ({
    useDebouncedCallback: jest.fn((callback, delay) => {
        const debouncedFn = jest.fn((...args) => callback(...args));
        // Add custom properties to the mock for testing purposes
        (debouncedFn as any)._delay = delay;
        (debouncedFn as any)._callback = callback;
        return debouncedFn;
    }),
}));

// Mock MagnifyingGlassIcon
jest.mock('@heroicons/react/24/outline', () => ({
    MagnifyingGlassIcon: ({ className }: { className?: string }) => (
        <div data-testid="magnifying-glass-icon" className={className}>
            🔍
        </div>
    ),
}));

// Helper to get the debounced callback from the rendered component
const getDebouncedCallback = () => {
    const { useDebouncedCallback } = jest.mocked(jest.requireMock('use-debounce'));
    return useDebouncedCallback.mock.results[0]?.value;
};

describe('PropertyFilterForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear URLSearchParams
        Array.from(mockSearchParams.keys()).forEach(key => {
            mockSearchParams.delete(key);
        });
        // Reset pathname mock to default
        const { usePathname, useSearchParams } = jest.mocked(jest.requireMock('next/navigation'));
        usePathname.mockReturnValue('/properties');
        useSearchParams.mockReturnValue(mockSearchParams);
        
        // Reset mockReplace to normal behavior (prevent contamination from error handling test)
        mockReplace.mockImplementation(() => {});
    });

    describe('Component Structure', () => {
        it('should render search input with correct attributes', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('id', 'property-filter');
            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('placeholder', 'Search by name, description, location or amenity');
        });

        it('should render screen reader label', () => {
            render(<PropertyFilterForm />);
            
            const label = screen.getByLabelText('Search');
            expect(label).toBeInTheDocument();
        });

        it('should render magnifying glass icon', () => {
            render(<PropertyFilterForm />);
            
            const icon = screen.getByTestId('magnifying-glass-icon');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('absolute', 'left-3', 'top-1/2', 'size-[18px]', '-translate-y-1/2', 'text-gray-500', 'peer-focus:text-gray-900');
        });

        it('should apply correct container classes', () => {
            const { container } = render(<PropertyFilterForm />);
            
            const wrapper = container.querySelector('.mb-6.relative.flex.flex-1.flex-shrink-0');
            expect(wrapper).toBeInTheDocument();
        });

        it('should apply correct input classes', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            expect(input).toHaveClass(
                'w-full',
                'rounded-md', 
                'border',
                'border-gray-300',
                'py-2',
                'pl-10',
                'px-3',
                'text-sm',
                'placeholder:text-gray-500',
                'bg-white'
            );
        });
    });

    describe('Debounced Search Setup', () => {
        it('should setup debounced callback with correct delay', () => {
            const { useDebouncedCallback } = jest.mocked(jest.requireMock('use-debounce'));
            
            render(<PropertyFilterForm />);
            
            expect(useDebouncedCallback).toHaveBeenCalledTimes(1);
            const [callback, delay] = useDebouncedCallback.mock.calls[0];
            
            expect(typeof callback).toBe('function');
            expect(delay).toBe(500);
        });

        it('should create debounced function that handles search', () => {
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            
            // Test the callback function directly
            debouncedCallback('test search');
            
            expect(mockReplace).toHaveBeenCalledWith('/properties?page=1&query=test+search');
        });
    });

    describe('Initial Value from URL', () => {
        it('should display current query from search params', () => {
            mockSearchParams.set('query', 'villa miami');
            
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            expect(input).toHaveValue('villa miami');
        });

        it('should handle empty query param', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            expect(input).toHaveValue('');
        });

        it('should preserve other search params', () => {
            mockSearchParams.set('location', 'miami');
            mockSearchParams.set('type', 'apartment');
            mockSearchParams.set('query', 'luxury');
            
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            expect(input).toHaveValue('luxury');
        });
    });

    describe('Search Functionality', () => {
        it('should trigger search when input changes', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            const debouncedCallback = getDebouncedCallback();
            
            fireEvent.change(input, { target: { value: 'beach house' } });
            
            expect(debouncedCallback).toHaveBeenCalledWith('beach house');
        });

        it('should set query parameter when searching with text', () => {
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('luxury apartment');
            
            expect(mockReplace).toHaveBeenCalledWith('/properties?page=1&query=luxury+apartment');
        });

        it('should remove query parameter when searching with empty string', () => {
            mockSearchParams.set('query', 'existing search');
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('');
            
            expect(mockReplace).toHaveBeenCalledWith('/properties?page=1');
        });

        it('should always reset page to 1 when searching', () => {
            mockSearchParams.set('page', '5');
            mockSearchParams.set('location', 'miami');
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('new search');
            
            expect(mockReplace).toHaveBeenCalledWith('/properties?page=1&location=miami&query=new+search');
        });

        it('should preserve existing search parameters', () => {
            mockSearchParams.set('location', 'miami');
            mockSearchParams.set('type', 'condo');
            mockSearchParams.set('bedrooms', '2');
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('pool');
            
            // Check that the call was made and contains all expected parameters
            expect(mockReplace).toHaveBeenCalledTimes(1);
            const actualUrl = mockReplace.mock.calls[0][0];
            expect(actualUrl).toContain('/properties?');
            expect(actualUrl).toContain('page=1');
            expect(actualUrl).toContain('location=miami');
            expect(actualUrl).toContain('type=condo');
            expect(actualUrl).toContain('bedrooms=2');
            expect(actualUrl).toContain('query=pool');
        });

        it('should handle different pathname', () => {
            const { usePathname } = jest.mocked(jest.requireMock('next/navigation'));
            usePathname.mockReturnValue('/properties/featured');
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('search term');
            
            expect(mockReplace).toHaveBeenCalledWith('/properties/featured?page=1&query=search+term');
        });
    });

    describe('URL Parameter Management', () => {
        it('should handle special characters in search', () => {
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('café & restaurant');
            
            expect(mockReplace).toHaveBeenCalledWith('/properties?page=1&query=caf%C3%A9+%26+restaurant');
        });

        it('should update existing query parameter', () => {
            mockSearchParams.set('query', 'old search');
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('new search');
            
            expect(mockReplace).toHaveBeenCalledTimes(1);
            const actualUrl = mockReplace.mock.calls[0][0];
            expect(actualUrl).toContain('/properties?');
            expect(actualUrl).toContain('page=1');
            expect(actualUrl).toContain('query=new+search');
        });

        it('should handle clearing search while maintaining other params', () => {
            mockSearchParams.set('query', 'beach');
            mockSearchParams.set('location', 'florida');
            mockSearchParams.set('bedrooms', '3');
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('');
            
            expect(mockReplace).toHaveBeenCalledTimes(1);
            const actualUrl = mockReplace.mock.calls[0][0];
            expect(actualUrl).toContain('/properties?');
            expect(actualUrl).toContain('page=1');
            expect(actualUrl).toContain('location=florida');
            expect(actualUrl).toContain('bedrooms=3');
            expect(actualUrl).not.toContain('query=');
        });
    });

    describe('Debounce Behavior', () => {
        it('should setup debounce with 500ms delay', () => {
            render(<PropertyFilterForm />);
            
            const { useDebouncedCallback } = jest.mocked(jest.requireMock('use-debounce'));
            const [, delay] = useDebouncedCallback.mock.calls[0];
            expect(delay).toBe(500);
        });

        it('should pass search term to debounced callback on input change', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            const debouncedCallback = getDebouncedCallback();
            
            fireEvent.change(input, { target: { value: 'test search' } });
            
            expect(debouncedCallback).toHaveBeenCalledWith('test search');
        });

        it('should handle rapid typing with debounce', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            const debouncedCallback = getDebouncedCallback();
            
            // Simulate rapid typing
            fireEvent.change(input, { target: { value: 'h' } });
            fireEvent.change(input, { target: { value: 'ho' } });
            fireEvent.change(input, { target: { value: 'hou' } });
            fireEvent.change(input, { target: { value: 'house' } });
            
            expect(debouncedCallback).toHaveBeenCalledTimes(4);
            expect(debouncedCallback).toHaveBeenLastCalledWith('house');
        });
    });

    describe('Component Integration', () => {
        it('should maintain component state across re-renders', () => {
            const { rerender } = render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'persistent value' } });
            
            rerender(<PropertyFilterForm />);
            
            // Input should maintain its value
            const inputAfterRerender = screen.getByRole('textbox');
            expect(inputAfterRerender).toHaveValue('persistent value');
        });

        it('should handle component unmounting gracefully', () => {
            const { unmount } = render(<PropertyFilterForm />);
            
            expect(() => {
                unmount();
            }).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have proper label association', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByLabelText('Search');
            expect(input).toHaveAttribute('id', 'property-filter');
        });

        it('should be keyboard accessible', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            input.focus();
            
            expect(input).toHaveFocus();
        });

        it('should support screen readers with proper labeling', () => {
            render(<PropertyFilterForm />);
            
            const label = screen.getByText('Search');
            const input = screen.getByRole('textbox');
            
            expect(label).toHaveAttribute('for', 'property-filter');
            expect(input).toHaveAttribute('id', 'property-filter');
        });

        it('should have helpful placeholder text', () => {
            render(<PropertyFilterForm />);
            
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('placeholder', 'Search by name, description, location or amenity');
        });
    });

    describe('Error Handling', () => {
        it('should handle navigation errors gracefully', () => {
            mockReplace.mockImplementation(() => {
                throw new Error('Navigation failed');
            });
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            
            expect(() => {
                debouncedCallback('search term');
            }).toThrow('Navigation failed');
        });

        it('should handle malformed search params', () => {
            // Set up malformed URLSearchParams
            const invalidParams = {
                get: jest.fn(() => { throw new Error('Invalid param'); }),
                toString: jest.fn(() => 'invalid'),
            };
            
            const { useSearchParams } = jest.mocked(jest.requireMock('next/navigation'));
            useSearchParams.mockReturnValue(invalidParams as unknown as URLSearchParams);
            
            expect(() => {
                render(<PropertyFilterForm />);
            }).toThrow('Invalid param');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty pathname', () => {
            const { usePathname } = jest.mocked(jest.requireMock('next/navigation'));
            usePathname.mockReturnValue('');
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('test');
            
            expect(mockReplace).toHaveBeenCalledWith('?page=1&query=test');
        });

        it('should handle very long search terms', () => {
            const longTerm = 'a'.repeat(100); // Shorter for readability in tests
            
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback(longTerm);
            
            expect(mockReplace).toHaveBeenCalledTimes(1);
            const actualUrl = mockReplace.mock.calls[0][0];
            expect(actualUrl).toContain('/properties?');
            expect(actualUrl).toContain('page=1');
            expect(actualUrl).toContain(`query=${longTerm}`);
        });

        it('should handle search terms with only whitespace', () => {
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('   ');
            
            expect(mockReplace).toHaveBeenCalledTimes(1);
            const actualUrl = mockReplace.mock.calls[0][0];
            expect(actualUrl).toContain('/properties?');
            expect(actualUrl).toContain('page=1');
            expect(actualUrl).toContain('query=+++');
        });

        it('should handle unicode characters', () => {
            render(<PropertyFilterForm />);
            
            const debouncedCallback = getDebouncedCallback();
            debouncedCallback('房屋 🏠 café');
            
            expect(mockReplace).toHaveBeenCalledTimes(1);
            const actualUrl = mockReplace.mock.calls[0][0];
            expect(actualUrl).toContain('/properties?');
            expect(actualUrl).toContain('page=1');
            expect(actualUrl).toContain('query=%E6%88%BF%E5%B1%8B+%F0%9F%8F%A0+caf%C3%A9');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with empty search', () => {
            const { container } = render(<PropertyFilterForm />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with existing search term', () => {
            mockSearchParams.set('query', 'luxury apartment');
            
            const { container } = render(<PropertyFilterForm />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with special characters', () => {
            mockSearchParams.set('query', 'café & restaurant 🍽️');
            
            const { container } = render(<PropertyFilterForm />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});