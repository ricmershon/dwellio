import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import PropertySearchForm from '@/ui/properties/search-form';

// Node module mocks are handled by __mocks__ directory
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useTransition: jest.fn(),
}));

// Application module mocks (inline for component-specific behavior)
jest.mock('@/ui/shared/input', () => {
    return function MockInput({ onChange, placeholder, id }: any) {
        return (
            <input
                id={id}
                placeholder={placeholder}
                onChange={onChange}
                data-testid="search-input"
            />
        );
    };
});

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUseTransition = useTransition as jest.MockedFunction<typeof useTransition>;
const mockStartTransition = jest.fn();

describe('PropertySearchForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseRouter.mockReturnValue({
            push: mockPush,
            replace: jest.fn(),
            refresh: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            prefetch: jest.fn(),
        });

        const mockSearchParams = new URLSearchParams();
        mockUseSearchParams.mockReturnValue(mockSearchParams as any);

        mockUseTransition.mockReturnValue([false, mockStartTransition]);
    });

    describe('Component Rendering', () => {
        it('should render search form with input and button', () => {
            render(<PropertySearchForm />);

            expect(screen.getByTestId('search-input')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/name, description, location or amenity/i)).toBeInTheDocument();
        });

        it('should render search button with proper text and icon', () => {
            render(<PropertySearchForm />);

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Search');

            // Check for the search icon (MagnifyingGlassIcon)
            const icon = button.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('h-5', 'md:ml-4');
        });

        it('should have proper form structure and classes', () => {
            render(<PropertySearchForm />);

            const form = document.querySelector('form')!;
            expect(form).toHaveClass('w-full', 'mt-4', 'flex', 'items-center', 'justify-between', 'gap-2', 'md:mt-8');

            const button = screen.getByRole('button');
            expect(button).toHaveClass('flex', 'items-center', 'md:mt-0', 'md:w-auto', 'px-4', 'h-[37px]', 'btn', 'btn-primary');
        });
    });

    describe('Form Submission', () => {
        it('should navigate to /properties when submitting empty query', async () => {
            render(<PropertySearchForm />);

            const form = document.querySelector('form')!;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });

            // Execute the transition callback
            const transitionCallback = mockStartTransition.mock.calls[0][0];
            transitionCallback();

            expect(mockPush).toHaveBeenCalledWith('/properties');
        });

        it('should navigate with query parameters when submitting with search term', async () => {
            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            const form = document.querySelector('form')!;

            fireEvent.change(input, { target: { value: 'luxury apartment' } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });

            // Execute the transition callback
            const transitionCallback = mockStartTransition.mock.calls[0][0];
            transitionCallback();

            expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=luxury+apartment');
        });

        it('should preserve existing search parameters and add query', async () => {
            const mockSearchParams = new URLSearchParams('type=apartment&location=nyc');
            mockUseSearchParams.mockReturnValue(mockSearchParams as any);

            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            const form = document.querySelector('form')!;

            fireEvent.change(input, { target: { value: 'modern' } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });

            // Execute the transition callback
            const transitionCallback = mockStartTransition.mock.calls[0][0];
            transitionCallback();

            expect(mockPush).toHaveBeenCalledWith('/properties?type=apartment&location=nyc&page=1&query=modern');
        });

        it('should reset page to 1 when submitting search', async () => {
            const mockSearchParams = new URLSearchParams('page=5');
            mockUseSearchParams.mockReturnValue(mockSearchParams as any);

            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            const form = document.querySelector('form')!;

            fireEvent.change(input, { target: { value: 'test' } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });

            // Execute the transition callback
            const transitionCallback = mockStartTransition.mock.calls[0][0];
            transitionCallback();

            expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=test');
        });
    });

    describe('Input Handling', () => {
        it('should update internal state when user types', () => {
            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            fireEvent.change(input, { target: { value: 'test query' } });

            // Submit to verify state was updated
            const form = document.querySelector('form')!;
            fireEvent.submit(form);

            expect(mockStartTransition).toHaveBeenCalled();
        });

        it('should handle special characters in search input', async () => {
            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            const form = document.querySelector('form')!;

            const specialQuery = '@#$%^&*()';
            fireEvent.change(input, { target: { value: specialQuery } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });

            // Execute the transition callback
            const transitionCallback = mockStartTransition.mock.calls[0][0];
            transitionCallback();

            expect(mockPush).toHaveBeenCalledWith('/properties?page=1&query=%40%23%24%25%5E%26*%28%29');
        });

        it('should handle empty string input correctly', async () => {
            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            const form = document.querySelector('form')!;

            // Set value then clear it
            fireEvent.change(input, { target: { value: 'test' } });
            fireEvent.change(input, { target: { value: '' } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });

            // Execute the transition callback
            const transitionCallback = mockStartTransition.mock.calls[0][0];
            transitionCallback();

            expect(mockPush).toHaveBeenCalledWith('/properties');
        });
    });

    describe('User Interaction', () => {
        it('should handle button click submission', async () => {
            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            const button = screen.getByRole('button');

            fireEvent.change(input, { target: { value: 'click test' } });
            fireEvent.click(button);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });
        });

        it('should handle Enter key submission', async () => {
            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');

            fireEvent.change(input, { target: { value: 'enter test' } });
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

            // Since we're using form submission, we need to trigger the form submit
            const form = document.querySelector('form')!;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });
        });
    });

    describe('Transition State Management', () => {
        it('should use transition for navigation', () => {
            render(<PropertySearchForm />);

            expect(mockUseTransition).toHaveBeenCalled();
        });

        it('should handle loading state during transition', () => {
            mockUseTransition.mockReturnValue([true, mockStartTransition]);

            render(<PropertySearchForm />);

            // Component should render normally even during loading
            expect(screen.getByTestId('search-input')).toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper form role', () => {
            render(<PropertySearchForm />);

            const form = document.querySelector('form')!;
            expect(form).toBeInTheDocument();
        });

        it('should have accessible button text', () => {
            render(<PropertySearchForm />);

            const button = screen.getByRole('button', { name: /search/i });
            expect(button).toBeInTheDocument();
        });

        it('should provide meaningful placeholder text', () => {
            render(<PropertySearchForm />);

            const input = screen.getByPlaceholderText(/name, description, location or amenity/i);
            expect(input).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long search queries', async () => {
            render(<PropertySearchForm />);

            const input = screen.getByTestId('search-input');
            const form = document.querySelector('form')!;

            const longQuery = 'a'.repeat(1000);
            fireEvent.change(input, { target: { value: longQuery } });
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
            });

            // Execute the transition callback
            const transitionCallback = mockStartTransition.mock.calls[0][0];
            transitionCallback();

            expect(mockPush).toHaveBeenCalledWith(`/properties?page=1&query=${encodeURIComponent(longQuery)}`);
        });

        it('should handle multiple rapid submissions', async () => {
            render(<PropertySearchForm />);

            const form = document.querySelector('form')!;

            // Rapid submissions
            fireEvent.submit(form);
            fireEvent.submit(form);
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalledTimes(3);
            });
        });

        it('should handle navigation failure gracefully', async () => {
            mockPush.mockRejectedValue(new Error('Navigation failed'));

            render(<PropertySearchForm />);

            const form = document.querySelector('form')!;
            fireEvent.submit(form);

            // Should not throw error
            await waitFor(() => {
                expect(mockStartTransition).toHaveBeenCalled();
            });
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive classes for mobile and desktop', () => {
            render(<PropertySearchForm />);

            const form = document.querySelector('form')!;
            expect(form).toHaveClass('md:mt-8');

            const button = screen.getByRole('button');
            expect(button).toHaveClass('md:mt-0', 'md:w-auto');

            const buttonText = screen.getByText('Search');
            expect(buttonText).toHaveClass('hidden', 'md:block');

            const icon = button.querySelector('svg');
            expect(icon).toHaveClass('md:ml-4');
        });
    });
});