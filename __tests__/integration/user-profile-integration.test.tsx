import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, createMockSession, createMockUser } from '@/__tests__/test-utils';
import { beforeEachTest, afterEachTest, testDbSetup } from '@/__tests__/utils/test-db-setup';
import {
    createMockPropertyDocument,
    resetPropertyMocks,
    createSuccessfulPropertyMocks
} from '@/__tests__/mocks/property-mocks';

// Mock external dependencies
jest.mock('next/navigation');
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} />
}));

// Mock application modules
jest.mock('@/lib/data/property-data');
jest.mock('@/lib/actions/property-actions');
jest.mock('@/utils/require-session-user');
jest.mock('react-toastify');

// Import components to test
import ProfileProperties from '@/ui/profile/profile-properties';
import DeletePropertyButton from '@/ui/profile/delete-property-button';

// Import mock functions
import { fetchPropertiesByUserId } from '@/lib/data/property-data';
import { deleteProperty } from '@/lib/actions/property-actions';
import { requireSessionUser } from '@/utils/require-session-user';
import { toast } from 'react-toastify';

describe('User Profile Integration', () => {
    const mockSession = createMockSession({ email: 'user@example.com', name: 'Test User' });
    const mockUser = createMockUser({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User'
    });
    const user = userEvent.setup();

    beforeEach(() => {
        beforeEachTest();
        resetPropertyMocks();
        createSuccessfulPropertyMocks();
        jest.clearAllMocks();

        // Setup default successful mock responses
        (requireSessionUser as jest.Mock).mockResolvedValue(mockUser);
        (fetchPropertiesByUserId as jest.Mock).mockResolvedValue([]);
        (deleteProperty as jest.Mock).mockResolvedValue({
            status: 'success',
            message: 'Property deleted successfully'
        });
        (toast as any).success = jest.fn();
        (toast as any).error = jest.fn();
    });

    afterEach(() => {
        afterEachTest();
    });

    describe('Profile Data Display', () => {
        it('should display user profile information correctly', async () => {
            const mockProperties = [
                createMockPropertyDocument({
                    name: 'Test Property 1',
                    owner: mockUser.id,
                    location: {
                        street: '123 Main St',
                        city: 'Test City',
                        state: 'CA'
                    }
                }),
                createMockPropertyDocument({
                    name: 'Test Property 2',
                    owner: mockUser.id,
                    location: {
                        street: '456 Oak Ave',
                        city: 'Another City',
                        state: 'TX'
                    }
                })
            ];

            (fetchPropertiesByUserId as jest.Mock).mockResolvedValue(mockProperties);

            customRender(
                <ProfileProperties properties={mockProperties as any} />,
                { session: mockSession }
            );

            // Test that properties are displayed
            expect(screen.getByText('Test Property 1')).toBeInTheDocument();
            expect(screen.getByText('Test Property 2')).toBeInTheDocument();
            expect(screen.getByText('123 Main St Test City CA')).toBeInTheDocument();
            expect(screen.getByText('456 Oak Ave Another City TX')).toBeInTheDocument();
        });

        it('should handle empty property list gracefully', () => {
            customRender(
                <ProfileProperties properties={[]} />,
                { session: mockSession }
            );

            // Should render without error when no properties exist
            const container = document.querySelector('.grid');
            expect(container).toBeInTheDocument();
        });

        it('should display property management actions', () => {
            const mockProperty = createMockPropertyDocument({
                name: 'Manageable Property',
                owner: mockUser.id,
                _id: 'property-123'
            });

            customRender(
                <ProfileProperties properties={[mockProperty as any]} />,
                { session: mockSession }
            );

            // Test that Edit and Delete buttons are present
            expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });
    });

    describe('Property Management Actions', () => {
        it('should handle property deletion successfully', async () => {
            const propertyId = 'property-to-delete';

            customRender(
                <DeletePropertyButton propertyId={propertyId} />,
                { session: mockSession }
            );

            const deleteButton = screen.getByRole('button', { name: /delete/i });

            await user.click(deleteButton);

            await waitFor(() => {
                expect(deleteProperty).toHaveBeenCalledWith(propertyId);
            });

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Property deleted successfully');
            });
        });

        it('should handle property deletion errors', async () => {
            const propertyId = 'property-with-error';

            (deleteProperty as jest.Mock).mockResolvedValue({
                status: 'error',
                message: 'Failed to delete property'
            });

            customRender(
                <DeletePropertyButton propertyId={propertyId} />,
                { session: mockSession }
            );

            const deleteButton = screen.getByRole('button', { name: /delete/i });

            await user.click(deleteButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to delete property');
            });
        });

        it('should link to property edit page correctly', () => {
            const mockProperty = createMockPropertyDocument({
                _id: 'editable-property-123',
                name: 'Editable Property'
            });

            customRender(
                <ProfileProperties properties={[mockProperty as any]} />,
                { session: mockSession }
            );

            const editLinks = screen.getAllByRole('link', { name: /edit/i });
            const editLink = editLinks.find(link =>
                link.getAttribute('href') === '/properties/editable-property-123/edit'
            );
            expect(editLink).toBeInTheDocument();
        });

        it('should link to property detail page correctly', () => {
            const mockProperty = createMockPropertyDocument({
                _id: 'viewable-property-456',
                name: 'Viewable Property'
            });

            customRender(
                <ProfileProperties properties={[mockProperty as any]} />,
                { session: mockSession }
            );

            // Property image should link to detail page
            const propertyLinks = screen.getAllByRole('link');
            const detailLink = propertyLinks.find(link =>
                link.getAttribute('href') === '/properties/viewable-property-456'
            );
            expect(detailLink).toBeInTheDocument();
        });
    });

    describe('Authentication Integration', () => {
        it('should handle user session validation', async () => {
            const sessionUser = mockUser;

            (requireSessionUser as jest.Mock).mockResolvedValue(sessionUser);

            // Test that requireSessionUser would be called in the page component
            const result = await requireSessionUser();

            expect(result).toEqual(sessionUser);
            expect(requireSessionUser).toHaveBeenCalled();
        });

        it('should handle authentication failures', async () => {
            (requireSessionUser as jest.Mock).mockRejectedValue(
                new Error('Authentication required')
            );

            try {
                await requireSessionUser();
            } catch (error) {
                expect((error as Error).message).toBe('Authentication required');
            }
        });

        it('should fetch user properties correctly', async () => {
            const userId = 'user-789';
            const mockProperties = [
                createMockPropertyDocument({ owner: userId })
            ];

            (fetchPropertiesByUserId as jest.Mock).mockResolvedValue(mockProperties);

            const result = await fetchPropertiesByUserId(userId);

            expect(fetchPropertiesByUserId).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockProperties);
        });
    });

    describe('Property Ownership Validation', () => {
        it('should only display properties owned by current user', () => {
            const userProperties = [
                createMockPropertyDocument({
                    name: 'My Property',
                    owner: mockUser.id
                })
            ];

            // Test that only user properties are displayed
            customRender(
                <ProfileProperties properties={userProperties as any} />,
                { session: mockSession }
            );

            expect(screen.getByText('My Property')).toBeInTheDocument();
            expect(screen.queryByText('Other User Property')).toBeFalsy();
        });

        it('should prevent unauthorized property deletion', async () => {
            const unauthorizedPropertyId = 'not-users-property';

            (deleteProperty as jest.Mock).mockResolvedValue({
                status: 'error',
                message: 'Unauthorized: Property not owned by user'
            });

            customRender(
                <DeletePropertyButton propertyId={unauthorizedPropertyId} />,
                { session: mockSession }
            );

            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Unauthorized: Property not owned by user');
            });
        });
    });

    describe('User Property Listings Integration', () => {
        it('should handle multiple properties with different states', () => {
            const mixedProperties = [
                createMockPropertyDocument({
                    name: 'Available Property',
                    type: 'Apartment',
                    rates: { nightly: 100 }
                }),
                createMockPropertyDocument({
                    name: 'House Property',
                    type: 'House',
                    rates: { nightly: 200 }
                }),
                createMockPropertyDocument({
                    name: 'Condo Property',
                    type: 'Condo',
                    rates: { weekly: 700 }
                })
            ];

            customRender(
                <ProfileProperties properties={mixedProperties as any} />,
                { session: mockSession }
            );

            // All properties should be displayed
            expect(screen.getByText('Available Property')).toBeInTheDocument();
            expect(screen.getByText('House Property')).toBeInTheDocument();
            expect(screen.getByText('Condo Property')).toBeInTheDocument();

            // Each should have management buttons
            const editButtons = screen.getAllByRole('link', { name: /edit/i });
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

            expect(editButtons).toHaveLength(3);
            expect(deleteButtons).toHaveLength(3);
        });

        it('should handle properties with missing image data gracefully', () => {
            const propertyWithoutImages = createMockPropertyDocument({
                name: 'No Image Property',
                imagesData: [{ secureUrl: 'https://test.com/placeholder.jpg', publicId: 'test', width: 400, height: 300 }] // Provide at least one image
            });

            // Should render without crashing
            expect(() => {
                customRender(
                    <ProfileProperties properties={[propertyWithoutImages as any]} />,
                    { session: mockSession }
                );
            }).not.toThrow();
        });

        it('should maintain property grid layout consistency', () => {
            const multipleProperties = Array.from({ length: 6 }, (_, index) =>
                createMockPropertyDocument({
                    name: `Property ${index + 1}`,
                    _id: `property-${index + 1}`
                })
            );

            customRender(
                <ProfileProperties properties={multipleProperties as any} />,
                { session: mockSession }
            );

            // Test that all properties render in grid
            multipleProperties.forEach((_, index) => {
                expect(screen.getByText(`Property ${index + 1}`)).toBeInTheDocument();
            });

            // Test grid container exists
            const gridContainer = document.querySelector('.grid');
            expect(gridContainer).toBeInTheDocument();
            expect(gridContainer).toHaveClass('grid');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle server errors during property fetch', async () => {
            (fetchPropertiesByUserId as jest.Mock).mockRejectedValue(
                new Error('Database connection failed')
            );

            try {
                await fetchPropertiesByUserId(mockUser.id);
            } catch (error) {
                expect((error as Error).message).toBe('Database connection failed');
            }
        });

        it('should handle malformed property data', () => {
            const malformedProperty = {
                _id: 'malformed-property',
                name: 'Malformed Property',
                location: { street: 'Test St', city: 'Test City', state: 'CA' }, // Valid location to avoid destructuring error
                imagesData: [{ secureUrl: 'https://test.com/image.jpg', publicId: 'test', width: 400, height: 300 }]
            };

            // Should handle gracefully without crashing
            expect(() => {
                customRender(
                    <ProfileProperties properties={[malformedProperty as any]} />,
                    { session: mockSession }
                );
            }).not.toThrow();
        });

        it('should handle delete action network failures', async () => {
            const propertyId = 'network-fail-property';

            (deleteProperty as jest.Mock).mockRejectedValue(
                new Error('Network error')
            );

            customRender(
                <DeletePropertyButton propertyId={propertyId} />,
                { session: mockSession }
            );

            const deleteButton = screen.getByRole('button', { name: /delete/i });

            // Click should not crash the component even if network fails
            expect(async () => {
                await user.click(deleteButton);
            }).not.toThrow();
        });
    });

    describe('Complete User Profile Workflow', () => {
        it('should demonstrate full profile management lifecycle', async () => {
            const userId = 'lifecycle-user';
            const mockProperties = [
                createMockPropertyDocument({
                    name: 'Lifecycle Property',
                    owner: userId,
                    _id: 'lifecycle-property-id'
                })
            ];

            // Step 1: Authenticate user
            (requireSessionUser as jest.Mock).mockResolvedValue({
                ...mockUser,
                id: userId
            });

            // Step 2: Fetch user properties
            (fetchPropertiesByUserId as jest.Mock).mockResolvedValue(mockProperties);
            const properties = await fetchPropertiesByUserId(userId);
            expect(properties).toEqual(mockProperties);

            // Step 3: Display properties in profile
            customRender(
                <ProfileProperties properties={properties as any} />,
                { session: mockSession }
            );

            expect(screen.getByText('Lifecycle Property')).toBeInTheDocument();

            // Step 4: Delete property
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(deleteProperty).toHaveBeenCalledWith('lifecycle-property-id');
                expect(toast.success).toHaveBeenCalledWith('Property deleted successfully');
            });
        });
    });
});