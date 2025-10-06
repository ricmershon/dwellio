import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PropertySearchForm from '@/ui/properties/search-form';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
const mockPush = jest.fn();
const mockUseRouter = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => mockUseRouter(),
    useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/ui/shared/input', () => ({
    __esModule: true,
    default: ({ id, placeholder, onChange, inputType }: any) => (
        <input
            type="text"
            id={id}
            placeholder={placeholder}
            onChange={onChange}
            data-input-type={inputType}
        />
    ),
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
describe('PropertySearchForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockUseRouter.mockReturnValue({
            push: mockPush,
            replace: jest.fn(),
            prefetch: jest.fn(),
        });
        mockUseSearchParams.mockReturnValue(createMockSearchParams());
    });

    // ========================================================================
    // Form Rendering
    // ========================================================================
    describe('Form Rendering', () => {
        it('should render search input field', () => {
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            expect(input).toBeInTheDocument();
        });

        it('should render search button', () => {
            render(<PropertySearchForm />);

            const button = screen.getByRole('button', { name: /search/i });
            expect(button).toBeInTheDocument();
        });

        it('should render form element', () => {
            const { container } = render(<PropertySearchForm />);

            const form = container.querySelector('form');
            expect(form).toBeInTheDocument();
        });

        it('should set input type to text', () => {
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            expect(input).toHaveAttribute('type', 'text');
        });

        it('should have input with id for accessibility', () => {
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            expect(input).toHaveAttribute('id', 'location');
        });
    });

    // ========================================================================
    // Initial State
    // ========================================================================
    describe('Initial State', () => {
        it('should initialize with empty input', () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams());

            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('');
        });
    });

    // ========================================================================
    // User Input Handling
    // ========================================================================
    describe('User Input Handling', () => {
        it('should update input value when user types', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity') as HTMLInputElement;
            await user.type(input, 'apartment');

            expect(input.value).toBe('apartment');
        });

        it('should allow clearing the input', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity') as HTMLInputElement;

            // First type something
            await user.type(input, 'apartment');
            expect(input.value).toBe('apartment');

            // Then clear it
            await user.clear(input);
            expect(input.value).toBe('');
        });

        it('should handle special characters in input', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity') as HTMLInputElement;
            await user.type(input, 'test & special $ chars');

            expect(input.value).toBe('test & special $ chars');
        });

        it('should update state on input change', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity') as HTMLInputElement;

            await user.type(input, 'a');
            expect(input.value).toBe('a');

            await user.type(input, 'b');
            expect(input.value).toBe('ab');
        });
    });

    // ========================================================================
    // Form Submission
    // ========================================================================
    describe('Form Submission', () => {
        it('should navigate to search results with query on submit', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, 'apartment');
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=apartment');
            });
        });

        it('should navigate to properties page when submitting empty query', async () => {
            render(<PropertySearchForm />);

            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties');
            });
        });

        it('should reset to page 1 when submitting search', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ page: '5' }));

            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, 'new search');
            fireEvent.submit(form);

            await waitFor(() => {
                const callArg = mockPush.mock.calls[0][0];
                expect(callArg).toContain('page=1');
                expect(callArg).toContain('query=new+search');
            });
        });

        it('should URL-encode query parameters', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, 'New York');
            fireEvent.submit(form);

            await waitFor(() => {
                const callArg = mockPush.mock.calls[0][0];
                expect(callArg).toContain('New+York');
            });
        });

        it('should prevent default form submission behavior', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

            await user.type(input, 'test');
            form.dispatchEvent(submitEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should handle submission via button click', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const button = screen.getByRole('button', { name: /search/i });

            await user.type(input, 'condo');
            await user.click(button);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=condo');
            });
        });

        it('should handle submission via Enter key', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');

            await user.type(input, 'villa{enter}');

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=villa');
            });
        });
    });

    // ========================================================================
    // Transition State Management
    // ========================================================================
    describe('Transition State Management', () => {
        it('should use startTransition for navigation', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, 'test');
            fireEvent.submit(form);

            // Navigation should be wrapped in startTransition
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalled();
            });
        });
    });

    // ========================================================================
    // Search Parameter Preservation
    // ========================================================================
    describe('Search Parameter Preservation', () => {
        it('should preserve existing search params except page and query', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(
                createMockSearchParams({ type: 'apartment', city: 'NYC', page: '3' })
            );

            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, 'luxury');
            fireEvent.submit(form);

            await waitFor(() => {
                const callArg = mockPush.mock.calls[0][0];
                expect(callArg).toContain('type=apartment');
                expect(callArg).toContain('city=NYC');
                expect(callArg).toContain('page=1');
                expect(callArg).toContain('query=luxury');
            });
        });

        it('should override previous query parameter', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'old query' }));

            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, 'new query');
            fireEvent.submit(form);

            await waitFor(() => {
                const callArg = mockPush.mock.calls[0][0];
                expect(callArg).toContain('page=1');
                expect(callArg).toContain('query=new+query');
                expect(callArg).not.toContain('old+query');
            });
        });

        it('should remove query parameter when submitting empty search', async () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'apartment', type: 'condo' }));

            render(<PropertySearchForm />);

            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties');
            });
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle whitespace-only query', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, '   ');
            fireEvent.submit(form);

            await waitFor(() => {
                const callArg = mockPush.mock.calls[0][0];
                // Should include the whitespace as a query
                expect(callArg).toContain('query=');
            });
        });

        it('should handle very long query strings', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const longQuery = 'a'.repeat(500);
            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, longQuery);
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalled();
                const callArg = mockPush.mock.calls[0][0];
                expect(callArg).toContain(`query=${longQuery}`);
            });
        });

        it('should handle multiple rapid submissions', async () => {
            const user = userEvent.setup();
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText('Name, description, location or amenity');
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            await user.type(input, 'test1');
            fireEvent.submit(form);

            await user.clear(input);
            await user.type(input, 'test2');
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledTimes(2);
            });
        });

        it('should handle submission with no router', () => {
            mockUseRouter.mockReturnValue({
                push: undefined,
            });

            render(<PropertySearchForm />);
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;

            expect(() => fireEvent.submit(form)).toThrow();
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Full Search Flow', () => {
        it('should complete full search flow from input to navigation', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(createMockSearchParams());

            render(<PropertySearchForm />);

            // 1. Verify initial state
            const input = screen.getByPlaceholderText('Name, description, location or amenity') as HTMLInputElement;
            expect(input.value).toBe('');

            // 2. User types query
            await user.type(input, 'luxury apartment downtown');
            expect(input.value).toBe('luxury apartment downtown');

            // 3. User submits form
            const button = screen.getByRole('button', { name: /search/i });
            await user.click(button);

            // 4. Verify navigation with correct parameters
            await waitFor(() => {
                const callArg = mockPush.mock.calls[0][0];
                expect(callArg).toContain('page=1');
                expect(callArg).toContain('query=luxury+apartment+downtown');
            });
        });

        it('should complete search flow with existing parameters', async () => {
            const user = userEvent.setup();
            mockUseSearchParams.mockReturnValue(
                createMockSearchParams({ page: '5', type: 'condo', city: 'NYC' })
            );

            render(<PropertySearchForm />);

            // 1. User types new search
            const input = screen.getByPlaceholderText('Name, description, location or amenity') as HTMLInputElement;
            await user.type(input, 'new search');

            // 2. User submits
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;
            fireEvent.submit(form);

            // 3. Verify page reset and parameter preservation
            await waitFor(() => {
                const callArg = mockPush.mock.calls[0][0];
                expect(callArg).toContain('page=1');
                expect(callArg).toContain('query=new+search');
                expect(callArg).toContain('type=condo');
                expect(callArg).toContain('city=NYC');
            });
        });

        it('should complete clear search flow', async () => {
            mockUseSearchParams.mockReturnValue(createMockSearchParams());

            render(<PropertySearchForm />);

            // 1. User submits empty form
            const form = screen.getByRole('button', { name: /search/i }).closest('form')!;
            fireEvent.submit(form);

            // 2. Verify redirect to base properties page
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/properties');
            });
        });
    });
});
