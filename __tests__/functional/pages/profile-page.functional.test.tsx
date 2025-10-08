/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/(root)/profile/page';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Services (Mocked)
jest.mock('@/utils/require-session-user');
jest.mock('@/lib/data/property-data');

// ✅ Child Components (Mocked for functional test isolation)
jest.mock('@/ui/profile/profile-properties', () => {
    return function MockProfileProperties({ properties }: any) {
        return (
            <div data-testid="profile-properties">
                Profile Properties Component: {properties.length} properties
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: any) {
        return (
            <div data-testid="breadcrumbs">
                {breadcrumbs.map((crumb: any, idx: number) => (
                    <span key={idx} data-active={crumb.active}>
                        {crumb.label}
                    </span>
                ))}
            </div>
        );
    };
});

jest.mock('next/image', () => {
    return function MockImage({ src, alt, className }: any) {
        return <img src={src} alt={alt} className={className} data-testid="profile-image" />;
    };
});

import { requireSessionUser } from '@/utils/require-session-user';
import { fetchPropertiesByUserId } from '@/lib/data/property-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchPropertiesByUserId = fetchPropertiesByUserId as jest.MockedFunction<
    typeof fetchPropertiesByUserId
>;

describe('ProfilePage', () => {
    const mockSessionUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/profile.jpg',
    };

    const mockProperties = [
        {
            _id: 'prop1',
            name: 'Property 1',
            owner: 'user123',
        },
        {
            _id: 'prop2',
            name: 'Property 2',
            owner: 'user123',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireSessionUser.mockResolvedValue(mockSessionUser as any);
        mockFetchPropertiesByUserId.mockResolvedValue(mockProperties as any);
    });

    describe('Authentication', () => {
        it('should require authenticated user', async () => {
            await ProfilePage();

            expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
        });

        it('should fetch user properties with session user id', async () => {
            await ProfilePage();

            expect(mockFetchPropertiesByUserId).toHaveBeenCalledWith('user123');
        });

        it('should handle authentication check before data fetching', async () => {
            const callOrder: string[] = [];

            mockRequireSessionUser.mockImplementation(async () => {
                callOrder.push('auth');
                return mockSessionUser as any;
            });

            mockFetchPropertiesByUserId.mockImplementation(async () => {
                callOrder.push('fetch');
                return mockProperties as any;
            });

            await ProfilePage();

            expect(callOrder).toEqual(['auth', 'fetch']);
        });
    });

    describe('Page Structure', () => {
        it('should render main element', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render breadcrumbs', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
        });

        it('should render "My listings" heading', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const heading = screen.getByRole('heading', { name: /my listings/i });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveClass('heading');
        });

        it('should render "About me" heading', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const heading = screen.getByRole('heading', { name: /about me/i });
            expect(heading).toBeInTheDocument();
        });
    });

    describe('Breadcrumbs', () => {
        it('should render correct breadcrumb trail', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Home');
            expect(breadcrumbs).toHaveTextContent('Profile');
        });

        it('should mark Profile breadcrumb as active', async () => {
            const jsx = await ProfilePage();
            const { container } = render(jsx);

            const profileCrumb = container.querySelector('[data-active="true"]');
            expect(profileCrumb).toHaveTextContent('Profile');
        });
    });

    describe('User Information Display', () => {
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

        it('should display user profile image', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toBeInTheDocument();
            expect(profileImage).toHaveAttribute('src', 'https://example.com/profile.jpg');
            expect(profileImage).toHaveAttribute('alt', 'User');
        });

        it('should display default profile image when user has no image', async () => {
            mockRequireSessionUser.mockResolvedValue({
                ...mockSessionUser,
                image: null,
            } as any);

            const jsx = await ProfilePage();
            render(jsx);

            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toBeInTheDocument();
        });
    });

    describe('Property Listings', () => {
        it('should render ProfileProperties component', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const profileProperties = screen.getByTestId('profile-properties');
            expect(profileProperties).toBeInTheDocument();
        });

        it('should pass fetched properties to ProfileProperties', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const profileProperties = screen.getByTestId('profile-properties');
            expect(profileProperties).toHaveTextContent('2 properties');
        });

        it('should handle empty property list', async () => {
            mockFetchPropertiesByUserId.mockResolvedValue([] as any);

            const jsx = await ProfilePage();
            render(jsx);

            const profileProperties = screen.getByTestId('profile-properties');
            expect(profileProperties).toHaveTextContent('0 properties');
        });

        it('should handle multiple properties', async () => {
            const manyProperties = Array.from({ length: 10 }, (_, i) => ({
                _id: `prop${i}`,
                name: `Property ${i}`,
                owner: 'user123',
            }));

            mockFetchPropertiesByUserId.mockResolvedValue(manyProperties as any);

            const jsx = await ProfilePage();
            render(jsx);

            const profileProperties = screen.getByTestId('profile-properties');
            expect(profileProperties).toHaveTextContent('10 properties');
        });
    });

    describe('Layout', () => {
        it('should use flex column on mobile and flex row on desktop', async () => {
            const jsx = await ProfilePage();
            const { container } = render(jsx);

            const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
            expect(flexContainer).toBeInTheDocument();
        });

        it('should render properties section with correct width', async () => {
            const jsx = await ProfilePage();
            const { container } = render(jsx);

            const propertiesSection = container.querySelector('.md\\:w-3\\/4');
            expect(propertiesSection).toBeInTheDocument();
        });

        it('should render user info section with correct width', async () => {
            const jsx = await ProfilePage();
            const { container } = render(jsx);

            const userInfoSection = container.querySelector('.md\\:w-1\\/4');
            expect(userInfoSection).toBeInTheDocument();
        });

        it('should apply rounded and shadow styling to user card', async () => {
            const jsx = await ProfilePage();
            const { container } = render(jsx);

            const userCard = container.querySelector('.rounded-3xl.shadow-xl');
            expect(userCard).toBeInTheDocument();
        });
    });

    describe('Metadata', () => {
        it('should export metadata with Profile title', async () => {
            const { metadata } = await import('@/app/(root)/profile/page');
            expect(metadata.title).toBe('Profile');
        });

        it('should export dynamic as force-dynamic', async () => {
            const { dynamic } = await import('@/app/(root)/profile/page');
            expect(dynamic).toBe('force-dynamic');
        });
    });

    describe('Async Server Component', () => {
        it('should be an async function', () => {
            const result = ProfilePage();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to JSX element', async () => {
            const jsx = await ProfilePage();
            expect(jsx).toBeDefined();
            expect(typeof jsx).toBe('object');
        });
    });

    describe('Error Handling', () => {
        it('should handle requireSessionUser errors', async () => {
            mockRequireSessionUser.mockRejectedValue(new Error('Unauthorized'));

            await expect(ProfilePage()).rejects.toThrow('Unauthorized');
        });

        it('should handle fetchPropertiesByUserId errors', async () => {
            mockFetchPropertiesByUserId.mockRejectedValue(new Error('Database error'));

            await expect(ProfilePage()).rejects.toThrow('Database error');
        });
    });

    describe('Data Flow', () => {
        it('should complete full data flow', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            // Authentication completed
            expect(mockRequireSessionUser).toHaveBeenCalled();

            // Properties fetched
            expect(mockFetchPropertiesByUserId).toHaveBeenCalled();

            // UI rendered
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByTestId('profile-properties')).toBeInTheDocument();
        });

        it('should use session user data for fetching properties', async () => {
            await ProfilePage();

            expect(mockFetchPropertiesByUserId).toHaveBeenCalledWith(mockSessionUser.id);
        });
    });

    describe('Responsive Design', () => {
        it('should have mobile-first layout classes', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            // Profile image should be smaller on mobile
            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toHaveClass('size-14', 'md:size-20');
        });

        it('should center image on mobile and not on desktop', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toHaveClass('mx-auto', 'md:mx-0');
        });

        it('should apply responsive margins', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const heading = screen.getByRole('heading', { name: /my listings/i });
            expect(heading).toHaveClass('mt-5', 'md:mt-0');
        });
    });

    describe('Component Integration', () => {
        it('should integrate all required components', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('profile-properties')).toBeInTheDocument();
            expect(screen.getByTestId('profile-image')).toBeInTheDocument();
        });

        it('should pass correct data to child components', async () => {
            const jsx = await ProfilePage();
            render(jsx);

            const profileProperties = screen.getByTestId('profile-properties');
            expect(profileProperties).toHaveTextContent('2 properties');

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Home');
            expect(breadcrumbs).toHaveTextContent('Profile');
        });
    });
});
