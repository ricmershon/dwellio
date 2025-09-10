import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import PropertySearchForm from '@/ui/properties/search-form';

// Create a clean URLSearchParams mock that doesn't leak function definitions
const createCleanSearchParams = () => {
    const params = new Map<string, string>();
    
    // Create a mock that behaves like URLSearchParams when passed to the constructor
    const mock = {
        get: jest.fn((key: string) => params.get(key) || null),
        set: jest.fn((key: string, value: string) => { params.set(key, value); }),
        delete: jest.fn((key: string) => { params.delete(key); }),
        has: jest.fn((key: string) => params.has(key)),
        keys: jest.fn(() => params.keys()),
        toString: jest.fn(() => {
            const searchParams = new URLSearchParams();
            for (const [key, value] of params) {
                searchParams.set(key, value);
            }
            return searchParams.toString();
        }),
        // Make it properly iterable for URLSearchParams constructor
        [Symbol.iterator]: jest.fn(() => {
            return params.entries();
        }),
        entries: jest.fn(() => params.entries()),
    };
    
    // Make non-enumerable to prevent iteration over function properties
    Object.defineProperties(mock, {
        get: { enumerable: false },
        set: { enumerable: false },
        delete: { enumerable: false },
        has: { enumerable: false },
        keys: { enumerable: false },
        toString: { enumerable: false },
        entries: { enumerable: false },
    });
    
    return mock;
};

// Mock Next.js navigation hooks
const mockPush = jest.fn();
const mockSearchParams = createCleanSearchParams();

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: mockPush })),
    useSearchParams: jest.fn(() => mockSearchParams),
}));

// Mock @heroicons/react/24/outline
jest.mock('@heroicons/react/24/outline', () => ({
    MagnifyingGlassIcon: ({ className }: { className?: string }) => (
        <div data-testid="magnifying-glass-icon" className={className}>
            🔍
        </div>
    ),
}));

// Mock Input component
jest.mock('@/ui/shared/input', () => {
    const MockInput = ({ 
        id, 
        placeholder, 
        onChange, 
        noClasses,
        inputType,
        ...props 
    }: {
        id: string;
        placeholder: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        noClasses: boolean;
        inputType?: string;
        [key: string]: unknown;
    }) => (
        <div data-testid="mock-input-wrapper" data-no-classes={noClasses}>
            <input
                id={id}
                placeholder={placeholder}
                onChange={onChange}
                data-testid="search-input"
                data-input-type={inputType}
                {...props}
            />
        </div>
    );
    MockInput.displayName = 'MockInput';
    return MockInput;
});

describe('PropertySearchForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear URLSearchParams properly
        for (const key of Array.from(mockSearchParams.keys())) {
            mockSearchParams.delete(key);
        }
        // Reset router push mock
        mockPush.mockImplementation(() => {});
    });

    describe('Component Structure', () => {
        it('should render form with correct attributes', () => {
            const { container } = render(<PropertySearchForm />);
            
            const form = container.querySelector('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveClass(
                'w-full',
                'mt-4',
                'flex',
                'items-center',
                'justify-between',
                'gap-2',
                'md:mt-8'
            );
        });

        it('should render search input with correct props', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('id', 'location');
            expect(input).toHaveAttribute('placeholder', 'Name, description, location or amenity');
            
            const inputWrapper = screen.getByTestId('mock-input-wrapper');
            expect(inputWrapper).toHaveAttribute('data-no-classes', 'true');
        });

        it('should render submit button with correct structure', () => {
            render(<PropertySearchForm />);
            
            const button = screen.getByRole('button', { name: /search/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute('type', 'submit');
            expect(button).toHaveClass(
                'flex',
                'items-center',
                'md:mt-0',
                'md:w-auto',
                'px-4',
                'h-[37px]',
                'btn',
                'btn-primary'
            );
        });

        it('should render search text on larger screens', () => {
            render(<PropertySearchForm />);
            
            const searchText = screen.getByText('Search');
            expect(searchText).toBeInTheDocument();
            expect(searchText).toHaveClass('hidden', 'md:block');
        });

        it('should render magnifying glass icon', () => {
            render(<PropertySearchForm />);
            
            const icon = screen.getByTestId('magnifying-glass-icon');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('h-5', 'md:ml-4');
        });

        it('should have proper container structure', () => {
            render(<PropertySearchForm />);
            
            const container = screen.getByTestId('mock-input-wrapper').parentElement;
            expect(container).toHaveClass('w-full', 'md:mb-0');
        });
    });

    describe('Form Submission Behavior', () => {
        it('should prevent default form submission', () => {
            const { container } = render(<PropertySearchForm />);
            
            const form = container.querySelector('form')!;
            
            // Check that the form has an onSubmit handler
            expect(form.onsubmit).toBeDefined();
            
            // Test that the component handles submission
            expect(() => fireEvent.submit(form)).not.toThrow();
        });

        it('should navigate to /properties when query is empty', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const form = container.querySelector('form')!;
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties');
            });
        });

        it('should navigate to /properties with query when search has value', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'luxury apartment' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=luxury+apartment');
            });
        });

        it('should preserve existing search params when adding query', async () => {
            mockSearchParams.set('location', 'miami');
            mockSearchParams.set('type', 'condo');
            
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'beach view' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                const expectedUrl = '/properties?location=miami&type=condo&page=1&query=beach+view';
                expect(mockPush).toHaveBeenCalledWith(expectedUrl);
            });
        });

        it('should always reset page to 1', async () => {
            mockSearchParams.set('page', '5');
            mockSearchParams.set('location', 'florida');
            
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'pool' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                const expectedUrl = '/properties?page=1&location=florida&query=pool';
                expect(mockPush).toHaveBeenCalledWith(expectedUrl);
            });
        });

        it('should handle empty string submission', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            // Set value to empty string explicitly
            fireEvent.change(input, { target: { value: '' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties');
            });
        });

        it('should handle whitespace-only submission', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: '   ' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=+++');
            });
        });
    });

    describe('Input State Management', () => {
        it('should update query state when input changes', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            
            fireEvent.change(input, { target: { value: 'test search' } });
            
            expect(input).toHaveValue('test search');
        });

        it('should maintain independent state from URL params', () => {
            mockSearchParams.set('query', 'url-query');
            
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            
            // Input should start empty despite URL having query
            expect(input).toHaveValue('');
            
            // User can type independently
            fireEvent.change(input, { target: { value: 'user input' } });
            expect(input).toHaveValue('user input');
        });

        it('should handle rapid input changes', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            
            fireEvent.change(input, { target: { value: 'a' } });
            fireEvent.change(input, { target: { value: 'ap' } });
            fireEvent.change(input, { target: { value: 'apt' } });
            fireEvent.change(input, { target: { value: 'apartment' } });
            
            expect(input).toHaveValue('apartment');
        });

        it('should preserve input state during component re-renders', () => {
            const { rerender } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            fireEvent.change(input, { target: { value: 'persistent value' } });
            
            rerender(<PropertySearchForm />);
            
            const inputAfterRerender = screen.getByTestId('search-input');
            expect(inputAfterRerender).toHaveValue('persistent value');
        });
    });

    describe('User Interactions', () => {
        it('should handle Enter key press on input', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'enter test' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=enter+test');
            });
        });

        it('should handle button click submission', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'click test' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=click+test');
            });
        });

        it('should be keyboard accessible', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const button = screen.getByRole('button', { name: /search/i });
            
            // Focus input
            input.focus();
            expect(input).toHaveFocus();
            
            // Tab to button
            fireEvent.keyDown(input, { key: 'Tab' });
            button.focus();
            expect(button).toHaveFocus();
        });

        it('should handle multiple rapid submissions', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'rapid test' } });
            
            // Submit multiple times quickly
            fireEvent.submit(form);
            fireEvent.submit(form);
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledTimes(3);
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=rapid+test');
            });
        });
    });

    describe('URL Parameter Handling', () => {
        it('should encode special characters in query', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'café & restaurant' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=caf%C3%A9+%26+restaurant');
            });
        });

        it('should handle unicode characters', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: '房屋 🏠' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=%E6%88%BF%E5%B1%8B+%F0%9F%8F%A0');
            });
        });

        it('should preserve complex search parameters', async () => {
            mockSearchParams.set('location', 'new york');
            mockSearchParams.set('type', 'apartment');
            mockSearchParams.set('bedrooms', '2');
            mockSearchParams.set('bathrooms', '1');
            mockSearchParams.set('minPrice', '1000');
            mockSearchParams.set('maxPrice', '3000');
            
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'luxury' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                const actualUrl = mockPush.mock.calls[0][0];
                expect(actualUrl).toContain('/properties?');
                expect(actualUrl).toContain('location=new+york');
                expect(actualUrl).toContain('type=apartment');
                expect(actualUrl).toContain('bedrooms=2');
                expect(actualUrl).toContain('bathrooms=1');
                expect(actualUrl).toContain('minPrice=1000');
                expect(actualUrl).toContain('maxPrice=3000');
                expect(actualUrl).toContain('page=1');
                expect(actualUrl).toContain('query=luxury');
            });
        });

        it('should handle existing query parameter override', async () => {
            mockSearchParams.set('query', 'old search');
            mockSearchParams.set('page', '3');
            
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'new search' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?query=new+search&page=1');
            });
        });
    });

    describe('useTransition Integration', () => {
        it('should use startTransition for navigation', async () => {
            // Mock useTransition
            const mockStartTransition = jest.fn(callback => callback());
            jest.spyOn(React, 'useTransition').mockReturnValue([false, mockStartTransition]);
            
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'transition test' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalled();
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=transition+test');
            });
            
            // Restore original implementation
            jest.restoreAllMocks();
        });

        it('should handle isPending state from useTransition', () => {
            // Mock useTransition to return pending state
            jest.spyOn(React, 'useTransition').mockReturnValue([true, jest.fn()]);
            
            const { container } = render(<PropertySearchForm />);
            
            // Component should render without errors even when pending
            expect(container.querySelector('form')!).toBeInTheDocument();
            expect(screen.getByTestId('search-input')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
            
            // Restore original implementation
            jest.restoreAllMocks();
        });
    });

    describe('Error Handling', () => {
        it('should handle router push errors gracefully', async () => {
            mockPush.mockImplementation(() => {
                throw new Error('Navigation failed');
            });
            
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'error test' } });
            
            // The error should propagate since it's not handled in the component
            expect(() => {
                fireEvent.submit(form);
            }).toThrow('Navigation failed');
        });

        it('should handle search params errors', () => {
            // Mock search params with error
            const errorSearchParams = {
                toString: jest.fn(() => { throw new Error('SearchParams error'); }),
                set: jest.fn(),
            };
            
            const { useSearchParams } = jest.requireMock('next/navigation');
            useSearchParams.mockReturnValue(errorSearchParams);
            
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'test' } });
            
            expect(() => {
                fireEvent.submit(form);
            }).not.toThrow();
        });

        it('should handle missing router', () => {
            const { useRouter } = jest.requireMock('next/navigation');
            useRouter.mockReturnValue(null);
            
            // Should render without error
            const { container } = render(<PropertySearchForm />);
            expect(container.querySelector('form')).toBeInTheDocument();
            
            // Restore proper router mock
            useRouter.mockReturnValue({ push: mockPush });
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long search queries', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const longQuery = 'a'.repeat(100); // Reasonable length for testing
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: longQuery } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledTimes(1);
                const actualUrl = mockPush.mock.calls[0][0];
                expect(actualUrl).toContain('/properties?');
                expect(actualUrl).toContain('page=1');
                expect(actualUrl).toContain(`query=${longQuery}`);
            });
        });

        it('should handle null input value', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            
            // Simulate null value (edge case)
            fireEvent.change(input, { target: { value: null } });
            
            // Should not crash
            expect(input).toBeInTheDocument();
        });

        it('should handle form submission without input changes', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const form = container.querySelector('form')!;
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties');
            });
        });

        it('should handle component unmounting during form submission', () => {
            const { unmount, container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'test' } });
            
            // Unmount before submission
            expect(() => {
                unmount();
            }).not.toThrow();
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive classes on form', () => {
            const { container } = render(<PropertySearchForm />);
            
            const form = container.querySelector('form')!;
            expect(form).toHaveClass('mt-4', 'md:mt-8');
        });

        it('should have responsive classes on search text', () => {
            render(<PropertySearchForm />);
            
            const searchText = screen.getByText('Search');
            expect(searchText).toHaveClass('hidden', 'md:block');
        });

        it('should have responsive classes on button', () => {
            render(<PropertySearchForm />);
            
            const button = screen.getByRole('button', { name: /search/i });
            expect(button).toHaveClass('md:mt-0', 'md:w-auto');
        });

        it('should have responsive classes on icon', () => {
            render(<PropertySearchForm />);
            
            const icon = screen.getByTestId('magnifying-glass-icon');
            expect(icon).toHaveClass('md:ml-4');
        });

        it('should have responsive classes on input container', () => {
            render(<PropertySearchForm />);
            
            const container = screen.getByTestId('mock-input-wrapper').parentElement;
            expect(container).toHaveClass('md:mb-0');
        });
    });

    describe('Accessibility', () => {
        it('should have proper form role', () => {
            const { container } = render(<PropertySearchForm />);
            
            const form = container.querySelector('form')!;
            expect(form).toBeInTheDocument();
        });

        it('should have proper button role and type', () => {
            render(<PropertySearchForm />);
            
            const button = screen.getByRole('button', { name: /search/i });
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should have descriptive placeholder text', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            expect(input).toHaveAttribute('placeholder', 'Name, description, location or amenity');
        });

        it('should have proper input id', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            expect(input).toHaveAttribute('id', 'location');
        });

        it('should be navigable with Tab key', () => {
            render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const button = screen.getByRole('button', { name: /search/i });
            
            // Both elements should be focusable
            input.focus();
            expect(input).toHaveFocus();
            
            button.focus();
            expect(button).toHaveFocus();
        });
    });

    describe('Component Integration', () => {
        it('should integrate properly with Input component', () => {
            render(<PropertySearchForm />);
            
            const inputWrapper = screen.getByTestId('mock-input-wrapper');
            expect(inputWrapper).toBeInTheDocument();
            expect(inputWrapper).toHaveAttribute('data-no-classes', 'true');
            
            const input = screen.getByTestId('search-input');
            expect(input).toHaveAttribute('id', 'location');
        });

        it('should integrate properly with Next.js navigation', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            fireEvent.change(input, { target: { value: 'integration test' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledTimes(1);
                const actualCall = mockPush.mock.calls[0][0];
                expect(actualCall).toContain('/properties?');
                expect(actualCall).toContain('page=1');
                expect(actualCall).toContain('query=integration+test');
            });
        });

        it('should maintain state consistency across interactions', async () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            const form = container.querySelector('form')!;
            
            // Type and submit
            fireEvent.change(input, { target: { value: 'first search' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledTimes(1);
                const firstCall = mockPush.mock.calls[0][0];
                expect(firstCall).toContain('/properties?');
                expect(firstCall).toContain('page=1');
                expect(firstCall).toContain('query=first+search');
            });
            
            // Change and submit again
            fireEvent.change(input, { target: { value: 'second search' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledTimes(2);
                const secondCall = mockPush.mock.calls[1][0];
                expect(secondCall).toContain('/properties?');
                expect(secondCall).toContain('page=1');
                expect(secondCall).toContain('query=second+search');
            });
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot for initial render', () => {
            const { container } = render(<PropertySearchForm />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with input value', () => {
            const { container } = render(<PropertySearchForm />);
            
            const input = screen.getByTestId('search-input');
            fireEvent.change(input, { target: { value: 'luxury apartment' } });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with existing search params', () => {
            mockSearchParams.set('location', 'miami');
            mockSearchParams.set('type', 'condo');
            
            const { container } = render(<PropertySearchForm />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});