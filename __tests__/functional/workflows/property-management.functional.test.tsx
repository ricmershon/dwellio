/**
 * @jest-environment jsdom
 *
 * Property Management Workflow Test
 *
 * Tests property CRUD operations workflow including listing, editing, and deletion.
 */
import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/(root)/profile/page';

jest.mock('@/utils/require-session-user');
jest.mock('@/lib/data/property-data');

jest.mock('@/ui/profile/profile-properties', () => {
    return function MockProfileProperties({ properties }: any) {
        return (
            <div data-testid="profile-properties">
                {properties.map((prop: any) => (
                    <div key={prop._id} data-testid={`property-item-${prop._id}`}>
                        <span>{prop.name}</span>
                        <button data-testid={`edit-${prop._id}`}>Edit</button>
                        <button data-testid={`delete-${prop._id}`}>Delete</button>
                    </div>
                ))}
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    const MockBreadcrumbs = () => <div data-testid="breadcrumbs">Profile</div>;
    MockBreadcrumbs.displayName = 'MockBreadcrumbs';
    return MockBreadcrumbs;
});

jest.mock('next/image', () => {
    const MockImage = ({ src, alt }: any) => <img src={src} alt={alt} />;
    MockImage.displayName = 'MockImage';
    return MockImage;
});

import { requireSessionUser } from '@/utils/require-session-user';
import { fetchPropertiesByUserId } from '@/lib/data/property-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchPropertiesByUserId = fetchPropertiesByUserId as jest.MockedFunction<
    typeof fetchPropertiesByUserId
>;

describe('Property Management Workflow', () => {
    const mockUser = { id: 'user1', name: 'John', email: 'john@test.com' };
    const mockProperties = [
        { _id: 'prop1', name: 'Property 1', owner: 'user1' },
        { _id: 'prop2', name: 'Property 2', owner: 'user1' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireSessionUser.mockResolvedValue(mockUser as any);
        mockFetchPropertiesByUserId.mockResolvedValue(mockProperties as any);
    });

    describe('Property Listing Workflow', () => {
        it('should display user properties', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByTestId('property-item-prop1')).toBeInTheDocument();
            expect(screen.getByTestId('property-item-prop2')).toBeInTheDocument();
        });

        it('should show edit and delete buttons for each property', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByTestId('edit-prop1')).toBeInTheDocument();
            expect(screen.getByTestId('delete-prop1')).toBeInTheDocument();
        });
    });

    describe('Property Ownership Verification', () => {
        it('should fetch properties for current user only', async () => {
            await ProfilePage();

            expect(mockFetchPropertiesByUserId).toHaveBeenCalledWith('user1');
        });

        it('should display properties owned by current user', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByText('Property 1')).toBeInTheDocument();
            expect(screen.getByText('Property 2')).toBeInTheDocument();
        });
    });

    describe('Property Management Actions', () => {
        it('should provide edit action for properties', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const editButtons = screen.getAllByText('Edit');
            expect(editButtons).toHaveLength(2);
        });

        it('should provide delete action for properties', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const deleteButtons = screen.getAllByText('Delete');
            expect(deleteButtons).toHaveLength(2);
        });
    });
});
