import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import PropertyPage from '@/app/properties/[id]/page';
import { mockPropertyData, mockSessionUser } from '@/__tests__/property-detail-test-utils';
import { PropertyDocument } from '@/models';

// Mock fetchProperty
jest.mock('@/lib/data/property-data', () => ({
    fetchProperty: jest.fn(),
}));

// Mock getSessionUser
jest.mock('@/utils/get-session-user', () => ({
    getSessionUser: jest.fn(),
}));

// Mock toSerializedObject
jest.mock('@/utils/to-serialized-object', () => ({
    toSerializedObject: jest.fn(),
}));

const mockFetchProperty = jest.requireMock('@/lib/data/property-data').fetchProperty;
const mockGetSessionUser = jest.requireMock('@/utils/get-session-user').getSessionUser;
const mockToSerializedObject = jest.requireMock('@/utils/to-serialized-object').toSerializedObject;

// Mock child components
jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: { 
        breadcrumbs: Array<{ label: string; href: string; active?: boolean }> 
    }) {
        return (
            <nav data-testid="breadcrumbs">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index} data-active={crumb.active} data-href={crumb.href}>
                        {crumb.label}
                    </span>
                ))}
            </nav>
        );
    };
});

jest.mock('@/ui/properties/id/share-buttons', () => {
    return function MockShareButtons({ property }: { property: any }) {
        return (
            <div data-testid="share-buttons" data-property-id={property._id}>
                ShareButtons Component
            </div>
        );
    };
});

jest.mock('@/ui/properties/shared/form/property-favorite-button', () => {
    return function MockPropertyFavoriteButton({ propertyId }: { propertyId: string }) {
        return (
            <button data-testid="property-favorite-button" data-property-id={propertyId}>
                Favorite
            </button>
        );
    };
});

jest.mock('@/ui/properties/id/images', () => {
    return function MockPropertyImages({ imagesData }: { imagesData: any[] }) {
        return (
            <div data-testid="property-images" data-image-count={imagesData?.length || 0}>
                PropertyImages Component
            </div>
        );
    };
});

jest.mock('@/ui/properties/id/details', () => {
    return function MockPropertyDetails({ property }: { property: any }) {
        return (
            <div data-testid="property-details" data-property-id={property._id}>
                PropertyDetails Component
            </div>
        );
    };
});

jest.mock('@/ui/properties/id/aside', () => {
    return function MockPropertyPageAside({ property }: { property: any }) {
        return (
            <div data-testid="property-page-aside" data-property-id={property._id}>
                PropertyPageAside Component
            </div>
        );
    };
});

// Mock clsx
jest.mock('clsx', () => {
    return jest.fn((baseClasses, conditionalClasses) => {
        let result = baseClasses || '';
        
        if (typeof conditionalClasses === 'object') {
            const conditionalClassNames = Object.keys(conditionalClasses)
                .filter(key => conditionalClasses[key])
                .join(' ');
            result = result + ' ' + conditionalClassNames;
        }
        
        return result.trim();
    });
});

describe('PropertyPage', () => {
    const mockParams = Promise.resolve({ id: 'test-property-id' });
    const defaultProperty = mockPropertyData as unknown as PropertyDocument;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default successful responses
        mockFetchProperty.mockResolvedValue(defaultProperty);
        mockToSerializedObject.mockReturnValue(defaultProperty);
        mockGetSessionUser.mockResolvedValue(mockSessionUser);
    });

    describe('Page Structure and Components', () => {
        it('should render main element as page container', async () => {
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();
            expect(container.firstChild).toBe(main);
        });

        it('should render all required components for authenticated non-owner', async () => {
            const differentOwnerProperty = {
                ...defaultProperty,
                owner: 'different-owner-id'
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(differentOwnerProperty);
            mockToSerializedObject.mockReturnValue(differentOwnerProperty);
            
            render(await PropertyPage({ params: mockParams }));
            
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
            expect(screen.getByTestId('property-favorite-button')).toBeInTheDocument();
            expect(screen.getByTestId('property-images')).toBeInTheDocument();
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
            expect(screen.getByTestId('property-page-aside')).toBeInTheDocument();
        });

        it('should render components for property owner (no favorite button or aside)', async () => {
            const ownProperty = {
                ...defaultProperty,
                owner: mockSessionUser.id
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(ownProperty);
            mockToSerializedObject.mockReturnValue(ownProperty);
            
            render(await PropertyPage({ params: mockParams }));
            
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
            expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
            expect(screen.getByTestId('property-images')).toBeInTheDocument();
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
            expect(screen.queryByTestId('property-page-aside')).not.toBeInTheDocument();
        });

        it('should render components for unauthenticated user (no favorite button or aside)', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            
            render(await PropertyPage({ params: mockParams }));
            
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
            expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
            expect(screen.getByTestId('property-images')).toBeInTheDocument();
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
            expect(screen.queryByTestId('property-page-aside')).not.toBeInTheDocument();
        });
    });

    describe('Next.js 15 Params Handling', () => {
        it('should handle params Promise correctly', async () => {
            const testId = 'specific-property-id';
            const testParams = Promise.resolve({ id: testId });
            
            render(await PropertyPage({ params: testParams }));
            
            expect(mockFetchProperty).toHaveBeenCalledWith(testId);
        });

        it('should work with different property IDs', async () => {
            const propertyIds = ['prop-1', 'prop-2', 'prop-3'];
            
            for (const id of propertyIds) {
                jest.clearAllMocks();
                mockFetchProperty.mockResolvedValue(defaultProperty);
                mockToSerializedObject.mockReturnValue(defaultProperty);
                
                const params = Promise.resolve({ id });
                render(await PropertyPage({ params }));
                
                expect(mockFetchProperty).toHaveBeenCalledWith(id);
            }
        });
    });

    describe('Data Fetching Integration', () => {
        it('should fetch property data and serialize it correctly', async () => {
            const rawPropertyData = { ...defaultProperty, _someMongooseField: 'test' };
            
            mockFetchProperty.mockResolvedValue(rawPropertyData);
            mockToSerializedObject.mockReturnValue(defaultProperty);
            
            render(await PropertyPage({ params: mockParams }));
            
            expect(mockFetchProperty).toHaveBeenCalledWith('test-property-id');
            expect(mockToSerializedObject).toHaveBeenCalledWith(rawPropertyData);
        });

        it('should get session user data correctly', async () => {
            render(await PropertyPage({ params: mockParams }));
            
            expect(mockGetSessionUser).toHaveBeenCalledWith();
        });

        it('should pass correct property data to all components', async () => {
            render(await PropertyPage({ params: mockParams }));
            
            const shareButtons = screen.getByTestId('share-buttons');
            const propertyImages = screen.getByTestId('property-images');
            const propertyDetails = screen.getByTestId('property-details');
            
            expect(shareButtons).toHaveAttribute('data-property-id', defaultProperty._id);
            expect(propertyImages).toHaveAttribute('data-image-count', '3');
            expect(propertyDetails).toHaveAttribute('data-property-id', defaultProperty._id);
        });
    });

    describe('Breadcrumbs Integration', () => {
        it('should render breadcrumbs with correct property information', async () => {
            const customProperty = {
                ...defaultProperty,
                type: 'House',
                location: { ...defaultProperty.location, city: 'San Francisco' }
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(customProperty);
            mockToSerializedObject.mockReturnValue(customProperty);
            
            render(await PropertyPage({ params: mockParams }));
            
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
            
            // Check breadcrumb content
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('House in San Francisco')).toBeInTheDocument();
        });

        it('should set active breadcrumb correctly', async () => {
            render(await PropertyPage({ params: mockParams }));
            
            const activeBreadcrumb = screen.getByText(`${defaultProperty.type} in ${defaultProperty.location.city}`);
            expect(activeBreadcrumb.closest('span')).toHaveAttribute('data-active', 'true');
        });
    });

    describe('Conditional Rendering Logic', () => {
        it('should correctly identify property owner vs visitor', async () => {
            // Test as property owner
            const ownProperty = {
                ...defaultProperty,
                owner: mockSessionUser.id
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(ownProperty);
            mockToSerializedObject.mockReturnValue(ownProperty);
            
            render(await PropertyPage({ params: mockParams }));
            
            expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
            expect(screen.queryByTestId('property-page-aside')).not.toBeInTheDocument();
        });

        it('should show favorite button and aside for authenticated non-owners', async () => {
            const visitorProperty = {
                ...defaultProperty,
                owner: 'different-user-id'
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(visitorProperty);
            mockToSerializedObject.mockReturnValue(visitorProperty);
            
            render(await PropertyPage({ params: mockParams }));
            
            expect(screen.getByTestId('property-favorite-button')).toBeInTheDocument();
            expect(screen.getByTestId('property-page-aside')).toBeInTheDocument();
            
            // Check favorite button props
            const favoriteButton = screen.getByTestId('property-favorite-button');
            expect(favoriteButton).toHaveAttribute('data-property-id', defaultProperty._id);
        });

        it('should handle string vs ObjectId owner comparison', async () => {
            const propertyWithObjectIdOwner = {
                ...defaultProperty,
                owner: { toString: () => mockSessionUser.id }
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(propertyWithObjectIdOwner);
            mockToSerializedObject.mockReturnValue(propertyWithObjectIdOwner);
            
            render(await PropertyPage({ params: mockParams }));
            
            // Should recognize as owner and hide favorite/aside
            expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
            expect(screen.queryByTestId('property-page-aside')).not.toBeInTheDocument();
        });
    });

    describe('Grid Layout and Responsive Design', () => {
        it('should apply correct grid classes for non-property owner', async () => {
            const visitorProperty = {
                ...defaultProperty,
                owner: 'different-user-id'
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(visitorProperty);
            mockToSerializedObject.mockReturnValue(visitorProperty);
            
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            const gridContainer = container.querySelector('[class*="md:grid-cols-70/30"]');
            expect(gridContainer).toBeInTheDocument();
            expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'w-full', 'gap-[20px]', 'md:grid-cols-70/30');
        });

        it('should apply correct grid classes for property owner', async () => {
            const ownProperty = {
                ...defaultProperty,
                owner: mockSessionUser.id
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(ownProperty);
            mockToSerializedObject.mockReturnValue(ownProperty);
            
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toBeInTheDocument();
            expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'w-full', 'gap-[20px]');
            expect(gridContainer).not.toHaveClass('md:grid-cols-70/30');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle fetchProperty errors gracefully', async () => {
            mockFetchProperty.mockRejectedValue(new Error('Property not found'));
            
            await expect(PropertyPage({ params: mockParams })).rejects.toThrow('Property not found');
            expect(mockFetchProperty).toHaveBeenCalledWith('test-property-id');
        });

        it('should handle getSessionUser errors gracefully', async () => {
            mockGetSessionUser.mockRejectedValue(new Error('Session error'));
            
            await expect(PropertyPage({ params: mockParams })).rejects.toThrow('Session error');
        });

        it('should handle toSerializedObject errors gracefully', async () => {
            mockToSerializedObject.mockImplementation(() => {
                throw new Error('Serialization error');
            });
            
            await expect(PropertyPage({ params: mockParams })).rejects.toThrow('Serialization error');
        });

        it('should handle missing imagesData gracefully', async () => {
            const propertyWithoutImages = {
                ...defaultProperty,
                imagesData: undefined
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(propertyWithoutImages);
            mockToSerializedObject.mockReturnValue(propertyWithoutImages);
            
            render(await PropertyPage({ params: mockParams }));
            
            const propertyImages = screen.getByTestId('property-images');
            expect(propertyImages).toHaveAttribute('data-image-count', '0');
        });

        it('should handle null session user', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            
            render(await PropertyPage({ params: mockParams }));
            
            expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
            expect(screen.queryByTestId('property-page-aside')).not.toBeInTheDocument();
        });

        it('should handle session user without id', async () => {
            mockGetSessionUser.mockResolvedValue({ ...mockSessionUser, id: undefined });
            
            render(await PropertyPage({ params: mockParams }));
            
            // When sessionUser.id is undefined, the comparison sessionUser.id !== property.owner.toString() 
            // evaluates to true, so the favorite button and aside should be present
            expect(screen.getByTestId('property-favorite-button')).toBeInTheDocument();
            expect(screen.getByTestId('property-page-aside')).toBeInTheDocument();
        });
    });

    describe('Integration Testing', () => {
        it('should orchestrate all components together correctly', async () => {
            const complexProperty = {
                ...defaultProperty,
                _id: 'integration-test-id',
                name: 'Integration Test Property',
                type: 'Condo',
                location: { ...defaultProperty.location, city: 'Test City' },
                owner: 'other-user-id',
                imagesData: [
                    { secureUrl: 'test1.jpg', publicId: '1', width: 800, height: 600 },
                    { secureUrl: 'test2.jpg', publicId: '2', width: 800, height: 600 },
                    { secureUrl: 'test3.jpg', publicId: '3', width: 800, height: 600 }
                ]
            } as unknown as PropertyDocument;
            
            mockFetchProperty.mockResolvedValue(complexProperty);
            mockToSerializedObject.mockReturnValue(complexProperty);
            
            render(await PropertyPage({ params: Promise.resolve({ id: 'integration-test-id' }) }));
            
            // Verify all components are rendered and receive correct data
            expect(screen.getByText('Condo in Test City')).toBeInTheDocument(); // Breadcrumbs
            expect(screen.getByTestId('share-buttons')).toHaveAttribute('data-property-id', 'integration-test-id');
            expect(screen.getByTestId('property-favorite-button')).toHaveAttribute('data-property-id', 'integration-test-id');
            expect(screen.getByTestId('property-images')).toHaveAttribute('data-image-count', '3');
            expect(screen.getByTestId('property-details')).toHaveAttribute('data-property-id', 'integration-test-id');
            expect(screen.getByTestId('property-page-aside')).toHaveAttribute('data-property-id', 'integration-test-id');
        });

        it('should handle full page lifecycle correctly', async () => {
            const testParams = Promise.resolve({ id: 'lifecycle-test-id' });
            
            render(await PropertyPage({ params: testParams }));
            
            // Verify the sequence of operations
            expect(mockFetchProperty).toHaveBeenCalledWith('lifecycle-test-id');
            expect(mockGetSessionUser).toHaveBeenCalled();
            expect(mockToSerializedObject).toHaveBeenCalledWith(defaultProperty);
            
            // Verify all components are present
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
            expect(screen.getByTestId('property-images')).toBeInTheDocument();
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot for property owner view', async () => {
            const defaultProperty = mockPropertyData as unknown as PropertyDocument;
            mockGetSessionUser.mockResolvedValue({ ...mockSessionUser, id: defaultProperty.owner });
            
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            expect(container.firstChild).toMatchSnapshot('property-owner-view');
        });

        it('should match snapshot for authenticated non-owner view', async () => {
            mockGetSessionUser.mockResolvedValue(mockSessionUser);
            
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            expect(container.firstChild).toMatchSnapshot('authenticated-non-owner-view');
        });

        it('should match snapshot for unauthenticated user view', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            expect(container.firstChild).toMatchSnapshot('unauthenticated-user-view');
        });

        it('should match snapshot with different property types', async () => {
            const defaultProperty = mockPropertyData as unknown as PropertyDocument;
            const apartmentProperty = {
                ...defaultProperty,
                type: 'Apartment',
                location: { ...defaultProperty.location, city: 'Seattle' }
            };
            mockToSerializedObject.mockReturnValue(apartmentProperty);
            mockGetSessionUser.mockResolvedValue(mockSessionUser);
            
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            expect(container.firstChild).toMatchSnapshot('apartment-property-view');
        });

        it('should match snapshot consistently across renders', async () => {
            mockGetSessionUser.mockResolvedValue(mockSessionUser);
            
            const { container: container1 } = render(await PropertyPage({ params: mockParams }));
            const { container: container2 } = render(await PropertyPage({ params: mockParams }));
            
            expect(container1.innerHTML).toBe(container2.innerHTML);
        });

        it('should match snapshot with all components present', async () => {
            mockGetSessionUser.mockResolvedValue(mockSessionUser);
            
            const { container } = render(await PropertyPage({ params: mockParams }));
            
            // Verify snapshot includes all expected elements
            expect(container.innerHTML).toContain('data-testid="breadcrumbs"');
            expect(container.innerHTML).toContain('data-testid="share-buttons"');
            expect(container.innerHTML).toContain('data-testid="property-favorite-button"');
            expect(container.innerHTML).toContain('data-testid="property-images"');
            expect(container.innerHTML).toContain('data-testid="property-details"');
            expect(container.innerHTML).toContain('data-testid="property-page-aside"');
            
            expect(container.firstChild).toMatchSnapshot('full-page-with-all-components');
        });
    });
});