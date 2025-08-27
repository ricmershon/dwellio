import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import PropertyFavoriteButton from '@/ui/properties/shared/form/property-favorite-button';
import { ActionStatus } from '@/types/types';

// Mock dependencies
jest.mock('@/lib/actions/property-actions', () => ({
    getFavoriteStatus: jest.fn(),
    favoriteProperty: jest.fn(),
}));

// Create a complete mock that includes what layout.test.tsx needs plus what we need
const MockToastContainer = (props: { position?: string; theme?: string }) => (
    <div 
        data-testid="toast-container"
        data-position={props.position}
        data-theme={props.theme}
    />
);

jest.mock('react-toastify', () => ({
    ToastContainer: MockToastContainer,
    Slide: 'slide',
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock('@heroicons/react/24/solid', () => ({
    HeartIcon: ({ className }: { className?: string }) => (
        <div data-testid="heart-solid-icon" className={className}>
            Solid Heart
        </div>
    ),
}));

jest.mock('@heroicons/react/24/outline', () => ({
    HeartIcon: ({ className }: { className?: string }) => (
        <div data-testid="heart-outline-icon" className={className}>
            Outline Heart
        </div>
    ),
}));

// Get mocked functions
const { getFavoriteStatus, favoriteProperty } = jest.mocked(
    jest.requireMock('@/lib/actions/property-actions')
);
const { toast } = jest.mocked(jest.requireMock('react-toastify'));

beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations
    getFavoriteStatus.mockReset();
    favoriteProperty.mockReset();
    toast.error.mockReset();
    toast.success.mockReset();
});

describe('PropertyFavoriteButton', () => {
    const testPropertyId = 'test-property-123';

    describe('Initial Loading and State', () => {
        it('should render with outline heart initially', () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            expect(screen.queryByTestId('heart-solid-icon')).not.toBeInTheDocument();
        });

        it('should call getFavoriteStatus on mount', () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            expect(getFavoriteStatus).toHaveBeenCalledWith(testPropertyId);
            expect(getFavoriteStatus).toHaveBeenCalledTimes(1);
        });

        it('should display solid heart when property is favorited', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: true,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('heart-outline-icon')).not.toBeInTheDocument();
        });

        it('should display outline heart when property is not favorited', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('heart-solid-icon')).not.toBeInTheDocument();
        });
    });

    describe('Favorite Status Loading Error Handling', () => {
        it('should show toast error when getFavoriteStatus fails', async () => {
            const errorMessage = 'Failed to get favorite status';
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: errorMessage,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(errorMessage);
            });
        });

        // TODO: Fix mock isolation issue - this test interferes with others
        it.skip('should throw error when getFavoriteStatus promise rejects', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            getFavoriteStatus.mockRejectedValue(new Error('Network error'));

            expect(() => {
                render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            }).not.toThrow(); // Component should render, but useEffect error should be thrown

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Form Structure', () => {
        it('should render form with correct classes', () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            const { container } = render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            const form = container.querySelector('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveClass('size-[18px]', 'z-20');
        });

        it('should render button with correct classes', () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('size-4', 'hover:cursor-pointer');
        });
    });

    describe('Heart Icon Styling', () => {
        it('should apply red color to solid heart icon', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: true,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });

            const solidHeart = screen.getByTestId('heart-solid-icon');
            expect(solidHeart).toHaveClass('text-red-600');
        });

        it('should apply gray color to outline heart icon', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                const outlineHeart = screen.getByTestId('heart-outline-icon');
                expect(outlineHeart).toHaveClass('text-gray-600');
            });
        });
    });

    describe('Favorite Toggle Functionality', () => {
        it('should call favoriteProperty when button is clicked', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            favoriteProperty.mockResolvedValue({
                isFavorite: true,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(favoriteProperty).toHaveBeenCalledWith(testPropertyId);
        });

        it('should update heart icon after successful favorite toggle', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            favoriteProperty.mockResolvedValue({
                isFavorite: true,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('heart-outline-icon')).not.toBeInTheDocument();
        });

        it('should toggle from favorited to unfavorited', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: true,
            });

            favoriteProperty.mockResolvedValue({
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('heart-solid-icon')).not.toBeInTheDocument();
        });
    });

    describe('Form Action Error Handling', () => {
        it('should handle favoriteProperty errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            favoriteProperty.mockRejectedValue(new Error('Favorite action failed'));

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            
            // Should not crash when clicking
            expect(() => {
                fireEvent.click(button);
            }).not.toThrow();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Component Lifecycle', () => {
        it('should handle property ID changes', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            const { rerender } = render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(getFavoriteStatus).toHaveBeenCalledWith(testPropertyId);
            });

            const newPropertyId = 'new-property-456';
            rerender(<PropertyFavoriteButton propertyId={newPropertyId} />);

            await waitFor(() => {
                expect(getFavoriteStatus).toHaveBeenCalledWith(newPropertyId);
            });

            expect(getFavoriteStatus).toHaveBeenCalledTimes(2);
        });

        it('should cleanup properly on unmount', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            const { unmount } = render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            expect(() => {
                unmount();
            }).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible button element', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should be keyboard accessible', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            const button = screen.getByRole('button');
            button.focus();
            
            expect(button).toHaveFocus();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot when not favorited', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            const { container } = render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when favorited', async () => {
            getFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: true,
            });

            const { container } = render(<PropertyFavoriteButton propertyId={testPropertyId} />);

            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });

            expect(container.firstChild).toMatchSnapshot();
        });
    });
});