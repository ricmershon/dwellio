/**
 * @jest-environment jsdom
 *
 * User Profile Workflow Test
 *
 * Tests profile viewing and management workflows.
 */
import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/(root)/profile/page';

jest.mock('@/utils/require-session-user');
jest.mock('@/lib/data/property-data');

jest.mock('@/ui/profile/profile-properties', () => {
    return function MockProfileProperties({ properties }: any) {
        return (
            <div data-testid="profile-properties">
                {properties.length} properties
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
    const MockImage = ({ src, alt, className }: any) => (
        <img src={src} alt={alt} className={className} data-testid="profile-image" />
    );
    MockImage.displayName = 'MockImage';
    return MockImage;
});

import { requireSessionUser } from '@/utils/require-session-user';
import { fetchPropertiesByUserId } from '@/lib/data/property-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchPropertiesByUserId = fetchPropertiesByUserId as jest.MockedFunction<
    typeof fetchPropertiesByUserId
>;

describe('User Profile Workflow', () => {
    const mockUser = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/photo.jpg',
    };

    const mockProperties = [
        { _id: 'prop1', name: 'Property 1' },
        { _id: 'prop2', name: 'Property 2' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireSessionUser.mockResolvedValue(mockUser as any);
        mockFetchPropertiesByUserId.mockResolvedValue(mockProperties as any);
    });

    describe('Profile Information Display', () => {
        it('should display user name', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should display user email', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('should display profile image', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const image = screen.getByTestId('profile-image');
            expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
        });
    });

    describe('Property Portfolio View', () => {
        it('should display user property listings', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByTestId('profile-properties')).toHaveTextContent('2 properties');
        });

        it('should fetch properties for current user', async () => {
            await ProfilePage();

            expect(mockFetchPropertiesByUserId).toHaveBeenCalledWith('user1');
        });
    });

    describe('Profile Sections', () => {
        it('should show "My listings" section', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByRole('heading', { name: /my listings/i })).toBeInTheDocument();
        });

        it('should show "About me" section', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByRole('heading', { name: /about me/i })).toBeInTheDocument();
        });
    });

    describe('Profile Workflow', () => {
        it('should complete profile view workflow', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            // User authentication verified
            expect(mockRequireSessionUser).toHaveBeenCalled();

            // User information displayed
            expect(screen.getByText('John Doe')).toBeInTheDocument();

            // User properties loaded
            expect(mockFetchPropertiesByUserId).toHaveBeenCalledWith('user1');
        });
    });
});
