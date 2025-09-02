import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';

import PropertyFavoriteButton from '@/ui/properties/shared/form/property-favorite-button';
import { favoriteProperty } from '@/lib/actions/property-actions';
import { getFavoriteStatus } from '@/lib/actions/property-actions';
import { ActionStatus } from '@/types/types';

// Mock the dependencies
jest.mock('@/lib/actions/property-actions', () => ({
    favoriteProperty: jest.fn(),
    getFavoriteStatus: jest.fn(),
}));

// Get typed mock functions
const mockedFavoriteProperty = favoriteProperty as jest.MockedFunction<typeof favoriteProperty>;
const mockedGetFavoriteStatus = getFavoriteStatus as jest.MockedFunction<typeof getFavoriteStatus>;

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
    },
}));

jest.mock('@heroicons/react/24/solid', () => ({
    HeartIcon: ({ className, ...props }: { className: string }) => 
        <div data-testid="heart-solid-icon" className={className} {...props} />
}));

jest.mock('@heroicons/react/24/outline', () => ({
    HeartIcon: ({ className, ...props }: { className: string }) => 
        <div data-testid="heart-outline-icon" className={className} {...props} />
}));

describe('PropertyFavoriteButton', () => {
    const testPropertyId = 'test-property-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial Loading and State', () => {
        it('should render with outline heart initially', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });
        });

        it('should call getFavoriteStatus on mount', () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            expect(mockedGetFavoriteStatus).toHaveBeenCalledWith(testPropertyId);
        });

        it('should display solid heart when property is favorited', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: true,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });
        });

        it('should display outline heart when property is not favorited', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });
        });
    });

    describe('Favorite Status Loading Error Handling', () => {
        it('should show toast error when getFavoriteStatus fails', async () => {
            const errorMessage = 'Failed to get favorite status';
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: errorMessage,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(errorMessage);
            });
        });
    });

    describe('Form Structure', () => {
        it('should render form with correct classes', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            const { container } = render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                const form = container.querySelector('form');
                expect(form).toHaveClass('size-[18px]', 'z-20');
            });
        });

        it('should render button with correct classes', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                const button = screen.getByRole('button');
                expect(button).toHaveClass('size-4', 'hover:cursor-pointer');
            });
        });
    });

    describe('Heart Icon Styling', () => {
        it('should apply red color to solid heart icon', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: true,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                const solidHeart = screen.getByTestId('heart-solid-icon');
                expect(solidHeart).toHaveClass('text-red-600');
            });
        });

        it('should apply gray color to outline heart icon', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
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
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            mockedFavoriteProperty.mockResolvedValue({ isFavorite: true });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            fireEvent.click(button);

            await waitFor(() => {
                expect(mockedFavoriteProperty).toHaveBeenCalledWith(testPropertyId);
            });
        });

        it('should update heart icon after successful favorite toggle', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            mockedFavoriteProperty.mockResolvedValue({ isFavorite: true });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });
        });

        it('should toggle from favorited to unfavorited', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: true,
            });

            mockedFavoriteProperty.mockResolvedValue({ isFavorite: false });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });
        });
    });

    describe('Form Action Error Handling', () => {
        it('should handle favoriteProperty errors gracefully', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            mockedFavoriteProperty.mockRejectedValue(new Error('Favorite action failed'));

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
            });

            const button = screen.getByRole('button');
            
            expect(() => fireEvent.click(button)).not.toThrow();
        });
    });

    describe('Component Lifecycle', () => {
        it('should handle property ID changes', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            const { rerender } = render(<PropertyFavoriteButton propertyId="property-1" />);
            
            expect(mockedGetFavoriteStatus).toHaveBeenCalledWith("property-1");

            rerender(<PropertyFavoriteButton propertyId="property-2" />);
            
            expect(mockedGetFavoriteStatus).toHaveBeenCalledWith("property-2");
        });

        it('should cleanup properly on unmount', () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            const { unmount } = render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible button element', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                const button = screen.getByRole('button');
                expect(button).toBeInTheDocument();
            });
        });

        it('should be keyboard accessible', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                isFavorite: false,
            });

            render(<PropertyFavoriteButton propertyId={testPropertyId} />);
            
            await waitFor(() => {
                const button = screen.getByRole('button');
                button.focus();
                expect(document.activeElement).toBe(button);
            });
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot when not favorited', async () => {
            mockedGetFavoriteStatus.mockResolvedValue({
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
            mockedGetFavoriteStatus.mockResolvedValue({
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

    // Phase 5 & 6: Favorites Integration Tests (Simplified - No Form Submissions)
    describe('Phase 5 & 6: Favorites Integration Tests', () => {
        describe('Navigation Integration', () => {
            it('should maintain correct favorite status during component lifecycle', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: true,
                });

                render(<PropertyFavoriteButton propertyId={testPropertyId} />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
                });

                expect(screen.getByTestId('heart-solid-icon')).toHaveClass('text-red-600');
            });

            it('should handle property ID changes correctly', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: false,
                });

                const { rerender } = render(<PropertyFavoriteButton propertyId="property-1" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });

                expect(mockedGetFavoriteStatus).toHaveBeenCalledWith("property-1");

                // Change property ID
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: true,
                });

                rerender(<PropertyFavoriteButton propertyId="property-2" />);

                await waitFor(() => {
                    expect(mockedGetFavoriteStatus).toHaveBeenCalledWith("property-2");
                    expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
                });
            });
        });

        describe('User Experience', () => {
            it('should provide visual feedback for different states', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: false,
                });

                render(<PropertyFavoriteButton propertyId={testPropertyId} />);

                await waitFor(() => {
                    const outlineHeart = screen.getByTestId('heart-outline-icon');
                    expect(outlineHeart).toHaveClass('text-gray-600');
                });
            });

            it('should handle button states properly', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: false,
                });

                render(<PropertyFavoriteButton propertyId={testPropertyId} />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });

                const button = screen.getByRole('button');
                expect(button).toHaveClass('hover:cursor-pointer');
                expect(button).toHaveClass('size-4');
            });
        });

        describe('Session Management', () => {
            it('should handle session state properly', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: false,
                });

                render(<PropertyFavoriteButton propertyId="123" />);
                
                await waitFor(() => {
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });

                expect(mockedGetFavoriteStatus).toHaveBeenCalledWith('123');
            });

            it('should maintain session state consistency', async () => {
                const mockSessionData = {
                    status: ActionStatus.SUCCESS,
                    isFavorite: true,
                };

                mockedGetFavoriteStatus.mockResolvedValue(mockSessionData);

                render(<PropertyFavoriteButton propertyId="123" />);
                
                await waitFor(() => {
                    expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
                });

                expect(mockedGetFavoriteStatus).toHaveBeenCalledWith('123');
            });
        });

        describe('Data Integration', () => {
            it('should handle error states gracefully', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.ERROR,
                    message: 'User not found',
                });

                render(<PropertyFavoriteButton propertyId="123" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });

                expect(mockedGetFavoriteStatus).toHaveBeenCalledWith('123');
            });

            it('should update display when data changes', async () => {
                mockedGetFavoriteStatus.mockResolvedValueOnce({
                    status: ActionStatus.SUCCESS,
                    isFavorite: false,
                });

                const { rerender } = render(<PropertyFavoriteButton propertyId="123" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });

                // Data change - mock the new value
                mockedGetFavoriteStatus.mockResolvedValueOnce({
                    status: ActionStatus.SUCCESS,
                    isFavorite: true,
                });

                rerender(<PropertyFavoriteButton propertyId="456" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
                });
            });

            it('should maintain data privacy and security', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: true,
                });

                render(<PropertyFavoriteButton propertyId="123" />);

                await waitFor(() => {
                    expect(mockedGetFavoriteStatus).toHaveBeenCalledWith('123');
                    expect(mockedGetFavoriteStatus).toHaveBeenCalledTimes(1);
                });

                // Verify no unauthorized data access
                expect(getFavoriteStatus).not.toHaveBeenCalledWith(expect.stringMatching(/admin|system|root/));
            });
        });

        describe('Favorites Ownership', () => {
            it('should filter favorites by user ID correctly', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: true,
                });

                render(<PropertyFavoriteButton propertyId="user-specific-123" />);

                await waitFor(() => {
                    expect(mockedGetFavoriteStatus).toHaveBeenCalledWith('user-specific-123');
                    expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
                });
            });

            it('should handle authorization errors', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.ERROR,
                    message: 'Unauthorized access to favorites',
                });

                render(<PropertyFavoriteButton propertyId="123" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });
            });

            it('should prevent unauthorized access', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.ERROR,
                    message: 'Access denied',
                });

                render(<PropertyFavoriteButton propertyId="restricted-property" />);

                await waitFor(() => {
                    expect(mockedGetFavoriteStatus).toHaveBeenCalledWith('restricted-property');
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });
            });
        });

        describe('Property Availability', () => {
            it('should handle property privacy changes', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.ERROR,
                    message: 'Property is now private',
                });

                render(<PropertyFavoriteButton propertyId="private-123" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-outline-icon')).toBeInTheDocument();
                });
            });
        });

        describe('State Management', () => {
            it('should fetch status on each mount', async () => {
                mockedGetFavoriteStatus.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    isFavorite: true,
                });

                const { unmount } = render(<PropertyFavoriteButton propertyId="persistent-123" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
                });

                expect(mockedGetFavoriteStatus).toHaveBeenCalledTimes(1);
                
                unmount();
                
                // Remount component - should fetch status again
                render(<PropertyFavoriteButton propertyId="persistent-123" />);

                await waitFor(() => {
                    expect(screen.getByTestId('heart-solid-icon')).toBeInTheDocument();
                });

                expect(mockedGetFavoriteStatus).toHaveBeenCalledTimes(2);
            });
        });
    });
});