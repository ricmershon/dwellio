/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock all external dependencies first
jest.mock('@/lib/data/property-data', () => ({
    fetchPropertiesByUserId: jest.fn()
}));

jest.mock('@/utils/require-session-user', () => ({
    requireSessionUser: jest.fn()
}));

jest.mock('@/assets/images/profile.png', () => '/mock-profile-image.png');

jest.mock('@/ui/shared/breadcrumbs', () => ({
    __esModule: true,
    default: ({ breadcrumbs }: any) => (
        <nav data-testid="breadcrumbs">
            {breadcrumbs.map((crumb: any, index: number) => (
                <span key={index} className={crumb.active ? 'active' : ''}>
                    {crumb.label}
                </span>
            ))}
        </nav>
    ),
}));

jest.mock('@/ui/profile/profile-properties', () => ({
    __esModule: true,
    default: ({ properties }: any) => (
        <div data-testid="profile-properties">
            {properties.map((prop: any) => (
                <div key={prop._id} data-testid={`property-${prop._id}`}>
                    {prop.name}
                </div>
            ))}
        </div>
    ),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, className, width, height }: any) => (
        <img src={src} alt={alt} className={className} width={width} height={height} />
    ),
}));

import { render } from '@testing-library/react';
import ProfilePage from '@/app/(root)/profile/page';
import { requireSessionUser } from '@/utils/require-session-user';
import { fetchPropertiesByUserId } from '@/lib/data/property-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchPropertiesByUserId = fetchPropertiesByUserId as jest.MockedFunction<typeof fetchPropertiesByUserId>;

describe('ProfilePage Integration Tests', () => {
    const mockSessionUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@test.com',
        image: 'https://example.com/profile.jpg'
    };

    const mockProperties = [
        {
            _id: 'property1',
            name: 'Test Property 1',
            type: 'House',
            description: 'Beautiful house',
            location: {
                street: '123 Main St',
                city: 'Test City',
                state: 'TX',
                zipcode: '12345'
            },
            beds: 3,
            baths: 2,
            squareFeet: 1500,
            amenities: ['WiFi', 'Pool'],
            rates: {
                nightly: 200,
                weekly: 1200,
                monthly: 4000
            },
            sellerInfo: {
                name: 'John Doe',
                email: 'john@test.com',
                phone: '555-1234'
            },
            owner: 'user123',
            imagesData: [],
            isFeatured: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireSessionUser.mockResolvedValue(mockSessionUser);
        mockFetchPropertiesByUserId.mockResolvedValue(mockProperties as any);
    });

    describe('Page Metadata', () => {
        it('should export correct metadata object', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const ProfilePageModule = require('@/app/(root)/profile/page');
            expect(ProfilePageModule.metadata).toEqual({
                title: 'Profile'
            });
        });
    });

    describe('Component Integration', () => {
        it('should call required functions during render', async () => {
            await render(<ProfilePage />);

            expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
            expect(mockFetchPropertiesByUserId).toHaveBeenCalledWith('user123');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with complete profile page', async () => {
            const { container } = await render(<ProfilePage />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with user with default profile image', async () => {
            const userWithoutImage = { ...mockSessionUser, image: null };
            mockRequireSessionUser.mockResolvedValue(userWithoutImage);

            const { container } = await render(<ProfilePage />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with empty properties state', async () => {
            mockFetchPropertiesByUserId.mockResolvedValue([]);

            const { container } = await render(<ProfilePage />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with long user information', async () => {
            const userWithLongInfo = {
                ...mockSessionUser,
                name: 'This is a very long user name that should be handled gracefully',
                email: 'very-long-email-address@example-domain-name.com'
            };
            mockRequireSessionUser.mockResolvedValue(userWithLongInfo);

            const { container } = await render(<ProfilePage />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});