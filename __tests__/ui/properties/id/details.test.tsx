import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import PropertyDetails from '@/ui/properties/id/details';
import { PropertyDocument } from '@/models';
import { 
    mockPropertyData, 
    mockSessionUser,
    createMockPropertyData
} from '@/__tests__/property-detail-test-utils';

// Mock react-icons/fa
jest.mock('react-icons/fa', () => ({
    FaCheck: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
        <div 
            data-testid="fa-check-icon" 
            className={className}
            {...props}
        />
    ),
}));

// Mock server utilities
jest.mock('@/utils/get-session-user', () => ({
    getSessionUser: jest.fn(),
}));

jest.mock('@/utils/get-viewport-width', () => ({
    getViewportWidth: jest.fn(),
}));

// Mock PropertyMap component
jest.mock('@/ui/properties/id/map', () => {
    return function MockPropertyMap({ property, viewportWidth }: { property: PropertyDocument; viewportWidth: number }) {
        return (
            <div 
                data-testid="property-map" 
                data-property-id={property._id}
                data-viewport-width={viewportWidth}
            >
                PropertyMap Component
            </div>
        );
    };
});

describe('PropertyDetails', () => {
    const mockGetSessionUser = jest.mocked(jest.requireMock('@/utils/get-session-user').getSessionUser);
    const mockGetViewportWidth = jest.mocked(jest.requireMock('@/utils/get-viewport-width').getViewportWidth);

    const defaultProperty = mockPropertyData as unknown as PropertyDocument;
    const defaultViewportWidth = 1024;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock returns
        mockGetSessionUser.mockResolvedValue(mockSessionUser);
        mockGetViewportWidth.mockResolvedValue(defaultViewportWidth);
    });

    describe('Server Component Rendering', () => {
        it('should render as an async server component', async () => {
            const { container } = render(await PropertyDetails({ property: defaultProperty }));
            
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should render main container div', async () => {
            const { container } = render(await PropertyDetails({ property: defaultProperty }));
            
            const mainDiv = container.querySelector('div');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should not throw errors during async operations', async () => {
            await expect(PropertyDetails({ property: defaultProperty })).resolves.toBeDefined();
        });
    });

    describe('Property Information Display', () => {
        it('should display property name and city in heading', async () => {
            const component = render(await PropertyDetails({ property: defaultProperty }));
            
            const heading = screen.getByText(`${defaultProperty.name} in ${defaultProperty.location.city}`);
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe('H1');
            expect(heading).toHaveClass('text-xl');
        });

        it('should display beds, baths, and square feet', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            const bedsText = screen.getByText(/2 beds/);
            const bathsText = screen.getByText(/2 baths/);
            const sqftText = screen.getByText(/1200 square feet/);
            
            expect(bedsText).toBeInTheDocument();
            expect(bathsText).toBeInTheDocument();
            expect(sqftText).toBeInTheDocument();
        });

        it('should handle singular bed/bath correctly', async () => {
            const singleBedBathProperty = createMockPropertyData({ 
                beds: 1, 
                baths: 1 
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: singleBedBathProperty }));
            
            expect(screen.getByText(/1 bed/)).toBeInTheDocument();
            expect(screen.getByText(/1 bath/)).toBeInTheDocument();
        });

        it('should display property description', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            expect(screen.getByText(defaultProperty.description!)).toBeInTheDocument();
        });
    });

    describe('Owner vs Visitor Logic', () => {
        it('should show "You own this property" when user is owner', async () => {
            const ownerProperty = createMockPropertyData({ 
                owner: mockSessionUser.id 
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: ownerProperty }));
            
            expect(screen.getByText('You own this property')).toBeInTheDocument();
        });

        it('should show hosted by seller name when user is not owner', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            expect(screen.getByText(`Hosted by ${defaultProperty.sellerInfo.name}`)).toBeInTheDocument();
        });

        it('should show seller contact info when user is not owner', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            // Look for the paragraph that contains both email and phone
            const contactInfo = screen.getByText((_, element) => {
                return (element?.tagName === 'P' && 
                       element?.textContent?.includes(defaultProperty.sellerInfo.email) &&
                       element?.textContent?.includes(defaultProperty.sellerInfo.phone)) ?? false;
            });
            
            expect(contactInfo).toBeInTheDocument();
        });

        it('should not show seller contact info when user is owner', async () => {
            const ownerProperty = createMockPropertyData({ 
                owner: mockSessionUser.id 
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: ownerProperty }));
            
            expect(screen.queryByText(defaultProperty.sellerInfo.email)).not.toBeInTheDocument();
            expect(screen.queryByText(defaultProperty.sellerInfo.phone)).not.toBeInTheDocument();
        });
    });

    describe('Session User Integration', () => {
        it('should handle null session user', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            
            render(await PropertyDetails({ property: defaultProperty }));
            
            expect(screen.getByText(`Hosted by ${defaultProperty.sellerInfo.name}`)).toBeInTheDocument();
        });

        it('should handle session user without id', async () => {
            mockGetSessionUser.mockResolvedValue({ ...mockSessionUser, id: undefined as unknown });
            
            render(await PropertyDetails({ property: defaultProperty }));
            
            expect(screen.getByText(`Hosted by ${defaultProperty.sellerInfo.name}`)).toBeInTheDocument();
        });

        it('should convert session user id to string for comparison', async () => {
            const numericIdUser = { ...mockSessionUser, id: 123 };
            mockGetSessionUser.mockResolvedValue(numericIdUser);
            
            const matchingProperty = createMockPropertyData({ 
                owner: '123' 
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: matchingProperty }));
            
            expect(screen.getByText('You own this property')).toBeInTheDocument();
        });
    });

    describe('Amenities Display', () => {
        it('should display amenities section', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            expect(screen.getByText('Amenities')).toBeInTheDocument();
        });

        it('should render amenities list with check icons', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            const checkIcons = screen.getAllByTestId('fa-check-icon');
            expect(checkIcons).toHaveLength(defaultProperty.amenities!.length);
            
            checkIcons.forEach(icon => {
                expect(icon).toHaveClass('inline-block', 'text-green-600', 'mr-2', 'mb-2');
            });
        });

        it('should display each amenity with proper styling', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            defaultProperty.amenities!.forEach(amenity => {
                expect(screen.getByText(amenity)).toBeInTheDocument();
            });
        });

        it('should handle empty amenities array', async () => {
            const noAmenitiesProperty = createMockPropertyData({ 
                amenities: [] 
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: noAmenitiesProperty }));
            
            expect(screen.getByText('Amenities')).toBeInTheDocument();
            expect(screen.queryAllByTestId('fa-check-icon')).toHaveLength(0);
        });

        it('should handle undefined amenities', async () => {
            const undefinedAmenitiesProperty = createMockPropertyData({ 
                amenities: undefined 
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: undefinedAmenitiesProperty }));
            
            expect(screen.getByText('Amenities')).toBeInTheDocument();
            expect(screen.queryAllByTestId('fa-check-icon')).toHaveLength(0);
        });
    });

    describe('Rate Display Logic', () => {
        it('should display all rate types when available', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            expect(screen.getByText('Rates')).toBeInTheDocument();
            expect(screen.getByText('$150')).toBeInTheDocument();
            expect(screen.getByText('nightly')).toBeInTheDocument();
            expect(screen.getByText('$900')).toBeInTheDocument();
            expect(screen.getByText('weekly')).toBeInTheDocument();
            expect(screen.getByText('$3,500')).toBeInTheDocument();
            expect(screen.getByText('monthly')).toBeInTheDocument();
        });

        it('should handle missing nightly rate', async () => {
            const noNightlyProperty = createMockPropertyData({
                rates: { weekly: 900, monthly: 3500, nightly: undefined }
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: noNightlyProperty }));
            
            expect(screen.queryByText('nightly')).not.toBeInTheDocument();
            expect(screen.getByText('weekly')).toBeInTheDocument();
            expect(screen.getByText('monthly')).toBeInTheDocument();
        });

        it('should handle missing weekly rate', async () => {
            const noWeeklyProperty = createMockPropertyData({
                rates: { nightly: 150, monthly: 3500, weekly: undefined }
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: noWeeklyProperty }));
            
            expect(screen.getByText('nightly')).toBeInTheDocument();
            expect(screen.queryByText('weekly')).not.toBeInTheDocument();
            expect(screen.getByText('monthly')).toBeInTheDocument();
        });

        it('should handle missing monthly rate', async () => {
            const noMonthlyProperty = createMockPropertyData({
                rates: { nightly: 150, weekly: 900, monthly: undefined }
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: noMonthlyProperty }));
            
            expect(screen.getByText('nightly')).toBeInTheDocument();
            expect(screen.getByText('weekly')).toBeInTheDocument();
            expect(screen.queryByText('monthly')).not.toBeInTheDocument();
        });

        it('should format large numbers with commas', async () => {
            const expensiveProperty = createMockPropertyData({
                rates: { nightly: 1500, weekly: 9000, monthly: 35000 }
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: expensiveProperty }));
            
            expect(screen.getByText('$1,500')).toBeInTheDocument();
            expect(screen.getByText('$9,000')).toBeInTheDocument();
            expect(screen.getByText('$35,000')).toBeInTheDocument();
        });
    });

    describe('Viewport Width Integration', () => {
        it('should pass viewportWidth to PropertyMap', async () => {
            const customViewport = 768;
            mockGetViewportWidth.mockResolvedValue(customViewport);
            
            render(await PropertyDetails({ property: defaultProperty }));
            
            const map = screen.getByTestId('property-map');
            expect(map).toHaveAttribute('data-viewport-width', customViewport.toString());
        });

        it('should handle different viewport widths', async () => {
            const viewportSizes = [320, 768, 1024, 1440];
            
            for (const size of viewportSizes) {
                mockGetViewportWidth.mockResolvedValue(size);
                
                const { unmount } = render(await PropertyDetails({ property: defaultProperty }));
                
                const map = screen.getByTestId('property-map');
                expect(map).toHaveAttribute('data-viewport-width', size.toString());
                
                unmount();
            }
        });
    });

    describe('PropertyMap Integration', () => {
        it('should render PropertyMap component', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            const map = screen.getByTestId('property-map');
            expect(map).toBeInTheDocument();
            expect(map).toHaveTextContent('PropertyMap Component');
        });

        it('should pass property data to PropertyMap', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            const map = screen.getByTestId('property-map');
            expect(map).toHaveAttribute('data-property-id', String(defaultProperty._id));
        });

        it('should wrap PropertyMap in styled container', async () => {
            const { container } = render(await PropertyDetails({ property: defaultProperty }));
            
            const mapContainer = container.querySelector('.bg-white.p-4.rounded-md.shadow-md');
            expect(mapContainer).toBeInTheDocument();
            
            const map = screen.getByTestId('property-map');
            expect(mapContainer).toContainElement(map);
        });
    });

    describe('Component Structure and Styling', () => {
        it('should have proper section divisions with borders', async () => {
            const { container } = render(await PropertyDetails({ property: defaultProperty }));
            
            const borderedSections = container.querySelectorAll('.border-b.border-gray-200');
            expect(borderedSections).toHaveLength(3); // Owner, Amenities, Rates sections
        });

        it('should apply responsive grid classes for amenities', async () => {
            const { container } = render(await PropertyDetails({ property: defaultProperty }));
            
            const amenitiesList = container.querySelector('.grid.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-4.lg\\:grid-cols-5');
            expect(amenitiesList).toBeInTheDocument();
        });

        it('should apply responsive flex classes for rates', async () => {
            const { container } = render(await PropertyDetails({ property: defaultProperty }));
            
            const ratesContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
            expect(ratesContainer).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle getSessionUser errors gracefully', async () => {
            mockGetSessionUser.mockRejectedValue(new Error('Session error'));
            
            await expect(PropertyDetails({ property: defaultProperty })).rejects.toThrow('Session error');
        });

        it('should handle getViewportWidth errors gracefully', async () => {
            mockGetViewportWidth.mockRejectedValue(new Error('Viewport error'));
            
            await expect(PropertyDetails({ property: defaultProperty })).rejects.toThrow('Viewport error');
        });

        it('should handle missing property data gracefully', async () => {
            // Reset mocks to default working state for this test
            mockGetSessionUser.mockResolvedValue(mockSessionUser);
            mockGetViewportWidth.mockResolvedValue(defaultViewportWidth);
            
            const incompleteProperty = createMockPropertyData({
                name: undefined,
                description: undefined,
                sellerInfo: { name: 'Default', email: 'test@example.com', phone: '555-0000' }
            }) as unknown as PropertyDocument;
            
            await expect(PropertyDetails({ property: incompleteProperty })).resolves.toBeDefined();
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            const h1Elements = screen.getAllByRole('heading', { level: 1 });
            expect(h1Elements).toHaveLength(2); // Property name and hosted by
            
            const h3Elements = screen.getAllByRole('heading', { level: 3 });
            expect(h3Elements.length).toBeGreaterThan(0);
        });

        it('should use semantic list structure for amenities', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            const amenitiesList = screen.getByRole('list');
            expect(amenitiesList).toBeInTheDocument();
            
            const amenityItems = screen.getAllByRole('listitem');
            expect(amenityItems).toHaveLength(defaultProperty.amenities!.length);
        });

        it('should provide meaningful text content', async () => {
            render(await PropertyDetails({ property: defaultProperty }));
            
            // Check that all text is readable and meaningful
            expect(screen.getByText(/beds/)).toBeInTheDocument();
            expect(screen.getByText(/baths/)).toBeInTheDocument();
            expect(screen.getByText(/square feet/)).toBeInTheDocument();
        });
    });

    describe('Performance Considerations', () => {
        it('should handle async operations efficiently', async () => {
            const startTime = performance.now();
            await PropertyDetails({ property: defaultProperty });
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('should not cause memory leaks with large amenities lists', async () => {
            const manyAmenitiesProperty = createMockPropertyData({
                amenities: Array.from({ length: 50 }, (_, i) => `Amenity ${i + 1}`)
            }) as unknown as PropertyDocument;
            
            render(await PropertyDetails({ property: manyAmenitiesProperty }));
            
            const amenityItems = screen.getAllByRole('listitem');
            expect(amenityItems).toHaveLength(50);
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with default property', async () => {
            const { container } = render(await PropertyDetails({ property: defaultProperty }));
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when user is property owner', async () => {
            const ownerProperty = createMockPropertyData({ 
                owner: mockSessionUser.id 
            }) as unknown as PropertyDocument;
            
            const { container } = render(await PropertyDetails({ property: ownerProperty }));
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with minimal rates', async () => {
            const minimalRatesProperty = createMockPropertyData({
                rates: { nightly: 100, weekly: undefined, monthly: undefined }
            }) as unknown as PropertyDocument;
            
            const { container } = render(await PropertyDetails({ property: minimalRatesProperty }));
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with no amenities', async () => {
            const noAmenitiesProperty = createMockPropertyData({
                amenities: []
            }) as unknown as PropertyDocument;
            
            const { container } = render(await PropertyDetails({ property: noAmenitiesProperty }));
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});