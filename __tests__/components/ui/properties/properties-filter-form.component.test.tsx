import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDebouncedCallback } from 'use-debounce';

import PropertyFilterForm from '@/ui/properties/properties-filter-form';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
const mockReplace = jest.fn();
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();
const mockUseRouter = jest.fn();

jest.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
    useSearchParams: () => mockUseSearchParams(),
    useRouter: () => mockUseRouter(),
}));

jest.mock('use-debounce', () => ({
    useDebouncedCallback: jest.fn((callback) => callback),
}));

jest.mock('@heroicons/react/24/outline', () => ({
    MagnifyingGlassIcon: () => <span data-testid="search-icon" />,
}));

// ============================================================================
// MOCK SETUP
// ============================================================================
const createMockSearchParams = (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return {
        get: (key: string) => searchParams.get(key),
        toString: () => searchParams.toString(),
        [Symbol.iterator]: searchParams[Symbol.iterator].bind(searchParams),
    };
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('PropertyFilterForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockUsePathname.mockReturnValue('/properties');
        mockUseSearchParams.mockReturnValue(createMockSearchParams());
        mockUseRouter.mockReturnValue({
            replace: mockReplace,
            push: jest.fn(),
            prefetch: jest.fn(),
        });
        (useDebouncedCallback as jest.Mock).mockImplementation((callback) => callback);
    });

    // ========================================================================
    // Form Rendering
    // ========================================================================
    describe('Form Rendering', () => {
        it('should render search input field', () => {
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            expect(input).toBeInTheDocument();
        });

        it('should render input with correct type', () => {
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            expect(input).toHaveAttribute('type', 'text');
        });

        it('should render search icon', () => {
            render(<PropertyFilterForm />);

            expect(screen.getByTestId('search-icon')).toBeInTheDocument();
        });

        it('should have accessible label for screen readers', () => {
            render(<PropertyFilterForm />);

            const label = screen.getByLabelText('Search');
            expect(label).toBeInTheDocument();
        });

        it('should render input with correct id', () => {
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            expect(input).toHaveAttribute('id', 'property-filter');
        });

        it('should have sr-only label for accessibility', () => {
            const { container } = render(<PropertyFilterForm />);

            const label = container.querySelector('label.sr-only');
            expect(label).toBeInTheDocument();
            expect(label).toHaveTextContent('Search');
        });
    });

    // ========================================================================
    // Query Parameter Initialization
    // ========================================================================
    describe('Query Parameter Initialization', () => {
        it('should initialize with empty input when no query param', () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams());

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('');
        });

        it('should initialize with query param value when present', () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'apartment' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('apartment');
        });

        it('should initialize with complex query value', () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'luxury downtown wifi' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('luxury downtown wifi');
        });

        it('should handle URL-encoded query parameter', () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'New York' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('New York');
        });

        it('should handle special characters in initial query', () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'test & special' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('test & special');
        });
    });

    // ========================================================================
    // Debounced Search Functionality
    // ========================================================================
    describe('Debounced Search Functionality', () => {
        it('should call useDebouncedCallback with 500ms delay', () => {
            render(<PropertyFilterForm />);

            expect(useDebouncedCallback).toHaveBeenCalledWith(expect.any(Function), 500);
        });

        it('should trigger search when user types', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'apartment');

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalled();
            });
        });

        it('should update URL with search term', async () => {
            const user = userEvent.setup();
            mockUsePathname.mockReturnValue('/properties');

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'condo');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('query=condo');
            });
        });

        it('should reset page to 1 when searching', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ page: '5' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'a');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('page=1');
            });
        });

        it('should delete query param when input is cleared', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'apartment' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.clear(input);

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).not.toContain('query=');
            });
        });

        it('should handle empty string search', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'test' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.clear(input);

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalled();
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toBe('/properties?page=1');
            });
        });
    });

    // ========================================================================
    // Search Parameter Management
    // ========================================================================
    describe('Search Parameter Management', () => {
        it('should preserve existing search parameters', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(
                createMockSearchParams({ type: 'apartment', city: 'NYC' })
            );

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'luxury');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('type=apartment');
                expect(lastCall[0]).toContain('city=NYC');
                expect(lastCall[0]).toContain('query=luxury');
            });
        });

        it('should override existing page parameter', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ page: '10' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'test');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('page=1');
                expect(lastCall[0]).not.toContain('page=10');
            });
        });

        it('should update existing query parameter', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'old' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.clear(input);
            await user.type(input, 'new');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('query=new');
                expect(lastCall[0]).not.toContain('query=old');
            });
        });

        it('should use current pathname in navigation', async () => {
            const user = userEvent.setup();
            mockUsePathname.mockReturnValue('/properties/search');

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'test');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('/properties/search');
            });
        });
    });

    // ========================================================================
    // User Input Handling
    // ========================================================================
    describe('User Input Handling', () => {
        it('should update input value as user types', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;

            await user.type(input, 'apartment');
            expect(input.value).toBe('apartment');
        });

        it('should handle rapid typing', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');

            await user.type(input, 'abcdefghijklmnop');

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalled();
            });
        });

        it('should handle special characters', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'test & special $ chars');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('query=');
            });
        });

        it('should handle backspace/deletion', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'apartment' }));

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.clear(input);
            await user.type(input, 'apart');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('query=apart');
            });
        });

        it('should handle paste events', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.click(input);
            await user.paste('pasted content');

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalled();
            });
        });
    });

    // ========================================================================
    // URL Encoding
    // ========================================================================
    describe('URL Encoding', () => {
        it('should URL-encode search terms with spaces', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'New York');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('New+York');
            });
        });

        it('should URL-encode special characters', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'test&value');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('test%26value');
            });
        });

        it('should handle unicode characters', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'café');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('caf');
            });
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle whitespace-only input', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, '   ');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('query=');
            });
        });

        it('should handle very long search terms', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const longTerm = 'a'.repeat(200);
            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, longTerm);

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalled();
            });
        });

        it('should handle multiple consecutive spaces', async () => {
            const user = userEvent.setup();
            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');
            await user.type(input, 'test     spaces');

            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('query=');
            });
        });

        it('should handle input when router is unavailable', () => {
            mockUseRouter.mockReturnValue({
                replace: undefined,
            });

            const { container } = render(<PropertyFilterForm />);
            expect(container).toBeInTheDocument();
        });

        it('should handle null search params gracefully', () => {
            mockUseSearchParams.mockReturnValue({
                get: () => null,
                toString: () => '',
            });

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Full Filter Flow', () => {
        it('should complete full search flow from empty to populated', async () => {
            const user = userEvent.setup();
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());

            render(<PropertyFilterForm />);

            // 1. Verify initial empty state
            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('');

            // 2. User types search term
            await user.type(input, 'luxury apartment');

            // 3. Verify debounced navigation calls
            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalled();
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('page=1');
                expect(lastCall[0]).toContain('query=luxury+apartment');
            });
        });

        it('should complete flow with existing filters', async () => {
            const user = userEvent.setup();
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(
                createMockSearchParams({
                    page: '3',
                    query: 'old search',
                    type: 'condo',
                    city: 'NYC'
                })
            );

            render(<PropertyFilterForm />);

            // 1. Verify initialization
            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('old search');

            // 2. User updates search
            await user.clear(input);
            await user.type(input, 'wifi pool');

            // 3. Verify page reset and filter preservation
            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).toContain('page=1');
                expect(lastCall[0]).toContain('query=wifi+pool');
                expect(lastCall[0]).toContain('type=condo');
                expect(lastCall[0]).toContain('city=NYC');
            });
        });

        it('should complete clear filter flow', async () => {
            const user = userEvent.setup();
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(
                createMockSearchParams({ query: 'apartment', type: 'condo' })
            );

            render(<PropertyFilterForm />);

            // 1. Verify initial state with query
            const input = screen.getByPlaceholderText('Search by name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('apartment');

            // 2. User clears input
            await user.clear(input);

            // 3. Verify query removed but other params preserved
            await waitFor(() => {
                const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
                expect(lastCall[0]).not.toContain('query=');
                expect(lastCall[0]).toContain('type=condo');
                expect(lastCall[0]).toContain('page=1');
            });
        });

        it('should handle incremental typing with debounce', async () => {
            const user = userEvent.setup();
            const mockDebouncedCallback = jest.fn();

            (useDebouncedCallback as jest.Mock).mockImplementation((callback) => {
                return (...args: any[]) => {
                    mockDebouncedCallback(...args);
                    callback(...args);
                };
            });

            render(<PropertyFilterForm />);

            const input = screen.getByPlaceholderText('Search by name, description, location or amenity');

            // Type incrementally
            await user.type(input, 'a');
            await user.type(input, 'p');
            await user.type(input, 't');

            // Verify debounced callback was triggered for each keystroke
            await waitFor(() => {
                expect(mockDebouncedCallback).toHaveBeenCalled();
            });
        });
    });
});
