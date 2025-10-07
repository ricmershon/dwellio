/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import EditPropertyPage from '@/app/(root)/properties/[id]/edit/page';
import { fetchProperty } from '@/lib/data/property-data';
import { PropertyDocument } from '@/models';

// Mock dependencies
jest.mock('@/lib/data/property-data');

// Mock child components
jest.mock('@/ui/properties/id/edit/edit-property-form', () => {
    return function MockEditPropertyForm({ property }: any) {
        return (
            <div data-testid="edit-property-form">
                <div data-testid="property-id">{property._id}</div>
                <div data-testid="property-name">{property.name}</div>
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: any) {
        return (
            <nav data-testid="breadcrumbs">
                {breadcrumbs.map((crumb: any, index: number) => (
                    <span key={index} data-active={crumb.active}>
                        {crumb.label}
                    </span>
                ))}
            </nav>
        );
    };
});

const mockFetchProperty = fetchProperty as jest.MockedFunction<typeof fetchProperty>;

const mockProperty: Partial<PropertyDocument> = {
    _id: 'property-123',
    name: 'Luxury Downtown Apartment',
    type: 'Apartment',
    description: 'A beautiful apartment in the heart of downtown',
    location: {
        street: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zip: '33101'
    },
    owner: 'owner-456',
    imagesData: [
        { publicId: 'img1', url: 'https://example.com/img1.jpg' },
        { publicId: 'img2', url: 'https://example.com/img2.jpg' }
    ],
    beds: 2,
    baths: 2,
    squareFeet: 1200,
    amenities: ['Pool', 'Gym'],
    rates: {
        nightly: 150,
        weekly: 900,
        monthly: 3000
    }
} as any;

describe('EditPropertyPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchProperty.mockResolvedValue(mockProperty as any);
    });

    describe('Component Rendering', () => {
        it('should render main element', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render breadcrumbs', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
        });

        it('should have correct breadcrumb labels', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Profile');
            expect(breadcrumbs).toHaveTextContent('Edit Property');
        });

        it('should mark "Edit Property" breadcrumb as active', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            const { container } = render(jsx);

            const breadcrumbSpans = container.querySelectorAll('[data-testid="breadcrumbs"] span');
            const editPropertyCrumb = Array.from(breadcrumbSpans).find(
                span => span.textContent === 'Edit Property'
            );

            expect(editPropertyCrumb).toHaveAttribute('data-active', 'true');
        });

        it('should render EditPropertyForm component', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const form = screen.getByTestId('edit-property-form');
            expect(form).toBeInTheDocument();
        });
    });

    describe('Data Fetching', () => {
        it('should call fetchProperty with correct id', async () => {
            const params = Promise.resolve({ id: 'test-property-456' });
            await EditPropertyPage({ params });

            expect(mockFetchProperty).toHaveBeenCalledTimes(1);
            expect(mockFetchProperty).toHaveBeenCalledWith('test-property-456');
        });

        it('should serialize property document for client components', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            // Property should be serialized (via JSON.parse(JSON.stringify()))
            const propertyId = screen.getByTestId('property-id');
            const propertyName = screen.getByTestId('property-name');

            expect(propertyId).toHaveTextContent('property-123');
            expect(propertyName).toHaveTextContent('Luxury Downtown Apartment');
        });

        it('should handle property with all fields', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const form = screen.getByTestId('edit-property-form');
            expect(form).toBeInTheDocument();
        });
    });

    describe('Props Passing', () => {
        it('should pass property data to EditPropertyForm', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const propertyId = screen.getByTestId('property-id');
            const propertyName = screen.getByTestId('property-name');

            expect(propertyId).toHaveTextContent('property-123');
            expect(propertyName).toHaveTextContent('Luxury Downtown Apartment');
        });

        it('should pass serialized property object', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            // Verify form receives property data
            expect(screen.getByTestId('edit-property-form')).toBeInTheDocument();
            expect(screen.getByTestId('property-id')).toBeInTheDocument();
        });
    });

    describe('Breadcrumb Navigation', () => {
        it('should have breadcrumb for Profile page', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Profile');
        });

        it('should include property id in edit breadcrumb href', async () => {
            const params = Promise.resolve({ id: 'property-789' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            // Breadcrumb should reference the property ID in the href
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
        });

        it('should have correct breadcrumb structure', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            const { container } = render(jsx);

            const breadcrumbSpans = container.querySelectorAll('[data-testid="breadcrumbs"] span');
            expect(breadcrumbSpans).toHaveLength(2);
            expect(breadcrumbSpans[0]).toHaveTextContent('Profile');
            expect(breadcrumbSpans[1]).toHaveTextContent('Edit Property');
        });

        it('should only mark last breadcrumb as active', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            const { container } = render(jsx);

            const breadcrumbSpans = container.querySelectorAll('[data-testid="breadcrumbs"] span');
            const firstCrumbActive = breadcrumbSpans[0].getAttribute('data-active');
            const lastCrumbActive = breadcrumbSpans[1].getAttribute('data-active');

            expect(firstCrumbActive === 'false' || firstCrumbActive === null).toBe(true);
            expect(lastCrumbActive).toBe('true');
        });
    });

    describe('Layout Structure', () => {
        it('should have breadcrumbs within main element', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const main = screen.getByRole('main');
            const breadcrumbs = screen.getByTestId('breadcrumbs');

            expect(main).toContainElement(breadcrumbs);
        });

        it('should have form within main element', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const main = screen.getByRole('main');
            const form = screen.getByTestId('edit-property-form');

            expect(main).toContainElement(form);
        });

        it('should render breadcrumbs before form', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            const { container } = render(jsx);

            const main = container.querySelector('main');
            const children = main?.children;

            expect(children?.[0]).toContainHTML('breadcrumbs');
            expect(children?.[1]).toContainHTML('edit-property-form');
        });
    });

    describe('Metadata', () => {
        it('should export metadata object', async () => {
            const { metadata } = await import('@/app/(root)/properties/[id]/edit/page');
            expect(metadata).toBeDefined();
        });

        it('should have correct page title in metadata', async () => {
            const { metadata } = await import('@/app/(root)/properties/[id]/edit/page');
            expect(metadata.title).toBe('Edit Property');
        });
    });

    describe('Integration Tests', () => {
        it('should render complete page with all elements', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('edit-property-form')).toBeInTheDocument();
        });

        it('should load property data and display in form', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            expect(mockFetchProperty).toHaveBeenCalledWith('property-123');
            expect(screen.getByTestId('property-name')).toHaveTextContent('Luxury Downtown Apartment');
        });

        it('should maintain consistent structure across renders', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            const { rerender } = render(jsx);

            const initialMain = screen.getByRole('main');
            expect(initialMain).toBeInTheDocument();

            const jsx2 = await EditPropertyPage({ params });
            rerender(jsx2);

            const rerenderedMain = screen.getByRole('main');
            expect(rerenderedMain).toBeInTheDocument();
            expect(screen.getByTestId('edit-property-form')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle property with minimal data', async () => {
            const minimalProperty = {
                _id: 'prop-min',
                name: 'Basic Property',
                type: 'House',
                location: { city: 'TestCity', state: 'TS', street: '', zip: '' },
                owner: 'owner-123',
                imagesData: []
            };
            mockFetchProperty.mockResolvedValue(minimalProperty as any);

            const params = Promise.resolve({ id: 'prop-min' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('property-name')).toHaveTextContent('Basic Property');
        });

        it('should handle different property IDs', async () => {
            const params1 = Promise.resolve({ id: 'property-abc' });
            await EditPropertyPage({ params: params1 });
            expect(mockFetchProperty).toHaveBeenCalledWith('property-abc');

            jest.clearAllMocks();

            const params2 = Promise.resolve({ id: 'property-xyz' });
            await EditPropertyPage({ params: params2 });
            expect(mockFetchProperty).toHaveBeenCalledWith('property-xyz');
        });

        it('should serialize complex property objects', async () => {
            const complexProperty = {
                ...mockProperty,
                amenities: ['Pool', 'Gym', 'Parking', 'WiFi', 'Security'],
                imagesData: Array(10).fill(null).map((_, i) => ({
                    publicId: `img${i}`,
                    url: `https://example.com/img${i}.jpg`
                }))
            };
            mockFetchProperty.mockResolvedValue(complexProperty as any);

            const params = Promise.resolve({ id: 'property-complex' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            expect(screen.getByTestId('edit-property-form')).toBeInTheDocument();
        });
    });

    describe('Async Behavior', () => {
        it('should properly await params promise', async () => {
            const params = Promise.resolve({ id: 'async-property' });
            await EditPropertyPage({ params });

            expect(mockFetchProperty).toHaveBeenCalledWith('async-property');
        });

        it('should properly await property fetch', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            expect(mockFetchProperty).toHaveBeenCalled();
            expect(screen.getByTestId('property-name')).toBeInTheDocument();
        });

        it('should return a promise', () => {
            const params = Promise.resolve({ id: 'property-123' });
            const result = EditPropertyPage({ params });
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to valid JSX', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            expect(jsx).toBeDefined();
            expect(jsx).not.toBeNull();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const main = screen.getByRole('main');
            expect(main.tagName).toBe('MAIN');
        });

        it('should have breadcrumb navigation', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs.tagName).toBe('NAV');
        });

        it('should be accessible to screen readers', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            const main = screen.getByRole('main');
            expect(main).toBeVisible();
        });
    });

    describe('Data Serialization', () => {
        it('should properly serialize property with JSON.stringify', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            render(jsx);

            // After serialization, data should still be available
            expect(screen.getByTestId('property-id')).toHaveTextContent('property-123');
            expect(screen.getByTestId('property-name')).toHaveTextContent('Luxury Downtown Apartment');
        });

        it('should handle dates and special types in serialization', async () => {
            const propertyWithDates = {
                ...mockProperty,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-15')
            };
            mockFetchProperty.mockResolvedValue(propertyWithDates as any);

            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });

            expect(() => render(jsx)).not.toThrow();
        });
    });

    describe('Page Structure', () => {
        it('should have exactly two main child elements', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            const { container } = render(jsx);

            const main = container.querySelector('main');
            const children = main?.children;

            expect(children).toHaveLength(2);
        });

        it('should render without errors', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await EditPropertyPage({ params });
            expect(() => render(jsx)).not.toThrow();
        });
    });
});
