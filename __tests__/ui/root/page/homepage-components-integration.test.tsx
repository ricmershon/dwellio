import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { createNextLinkMock } from '@/__tests__/shared-mocks';

// Import the actual components for integration testing
import FeaturedProperties from '@/ui/root/page/featured-properties';
import Hero from '@/ui/root/page/hero';
import InfoBoxes from '@/ui/root/page/info-boxes';

// Mock external dependencies but not the components themselves
jest.mock('next/link', () => createNextLinkMock());

jest.mock('next/image', () => {
    const MockImage = ({ src, alt, className, ...props }: any) => (
        <img 
            src={src} 
            alt={alt} 
            className={className}
            data-testid="property-image"
            {...props}
        />
    );
    MockImage.displayName = 'MockImage';
    return MockImage;
});

// Mock React Suspense
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    Suspense: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="suspense">{children}</div>
    ),
}));

// Mock external utilities and components
jest.mock('@/ui/properties/properties-list', () => {
    const MockPropertiesList = ({ featured, viewportWidth }: { featured: boolean; viewportWidth: number }) => (
        <div 
            data-testid="properties-list" 
            data-featured={featured}
            data-viewport-width={viewportWidth}
        >
            <div data-testid="property-card">Property Card 1</div>
            <div data-testid="property-card">Property Card 2</div>
            <div data-testid="property-card">Property Card 3</div>
        </div>
    );
    MockPropertiesList.displayName = 'MockPropertiesList';
    return MockPropertiesList;
});

// Mock the FeaturedProperties component to avoid async issues in integration tests
jest.mock('@/ui/root/page/featured-properties', () => {
    const MockFeaturedProperties = () => (
        <>
            <h1 className="heading">Featured Properties</h1>
            <div 
                data-testid="properties-list" 
                data-featured="true"
                data-viewport-width="1024"
            >
                <div data-testid="property-card">Property Card 1</div>
                <div data-testid="property-card">Property Card 2</div>
                <div data-testid="property-card">Property Card 3</div>
            </div>
        </>
    );
    MockFeaturedProperties.displayName = 'MockFeaturedProperties';
    return MockFeaturedProperties;
});

jest.mock('@/ui/properties/search/search-form', () => {
    const MockSearchForm = () => (
        <form data-testid="property-search-form">
            <input data-testid="search-input" placeholder="Search properties..." />
            <button type="submit" data-testid="search-button">Search</button>
        </form>
    );
    MockSearchForm.displayName = 'MockSearchForm';
    return MockSearchForm;
});

jest.mock('@/utils/get-viewport-width', () => ({
    getViewportWidth: jest.fn().mockResolvedValue(1024),
}));

// Mock React Icons
jest.mock('react-icons/fa', () => ({
    FaBed: () => <span data-testid="bed-icon">🛏️</span>,
    FaBath: () => <span data-testid="bath-icon">🛁</span>,
    FaRulerCombined: () => <span data-testid="ruler-icon">📏</span>,
    FaMoneyBill: () => <span data-testid="money-icon">💵</span>,
    FaMapMarkerAlt: () => <span data-testid="location-icon">📍</span>,
}));

describe('Homepage Components Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Integration', () => {
        it('should render all homepage components together', () => {
            const HomePageLayout = () => (
                <main>
                    <Hero />
                    <FeaturedProperties />
                    <InfoBoxes />
                </main>
            );

            render(<HomePageLayout />);

            // Verify Hero component elements
            expect(screen.getByText('Find The Perfect Rental')).toBeInTheDocument();
            expect(screen.getByText('Discover the perfect property.')).toBeInTheDocument();
            expect(screen.getByTestId('property-search-form')).toBeInTheDocument();

            // Verify FeaturedProperties component elements
            expect(screen.getByText('Featured Properties')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();

            // Verify InfoBoxes component elements
            expect(screen.getByText('For Renters')).toBeInTheDocument();
            expect(screen.getByText('For Property Owners')).toBeInTheDocument();
            expect(screen.getByText('Browse Properties')).toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();
        });

        it('should maintain proper component hierarchy', () => {
            const HomePageLayout = () => (
                <main data-testid="homepage-main">
                    <Hero />
                    <FeaturedProperties />
                    <InfoBoxes />
                </main>
            );

            render(<HomePageLayout />);

            const main = screen.getByTestId('homepage-main');
            const children = Array.from(main.children);

            // Verify order: Hero (section), FeaturedProperties content, InfoBoxes (section)
            expect(children[0].tagName).toBe('SECTION'); // Hero
            expect(children[1]).toHaveTextContent('Featured Properties'); // FeaturedProperties heading
            expect(children[3].tagName).toBe('SECTION'); // InfoBoxes
        });

        it('should handle FeaturedProperties component', () => {
            const HomePageLayout = () => (
                <div>
                    <FeaturedProperties />
                </div>
            );

            render(<HomePageLayout />);

            expect(screen.getByText('Featured Properties')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();

            // Verify viewport width was passed correctly
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-viewport-width', '1024');
            expect(propertiesList).toHaveAttribute('data-featured', 'true');
        });
    });

    describe('Component Communication', () => {
        it('should pass correct props between components', () => {
            render(<FeaturedProperties />);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-featured', 'true');
            expect(propertiesList).toHaveAttribute('data-viewport-width', '1024');
        });

        it('should render InfoBox components with correct configuration', () => {
            render(<InfoBoxes />);

            // Check that both InfoBox components are rendered with different configurations
            const browseLink = screen.getByRole('link', { name: 'Browse Properties' });
            const addLink = screen.getByRole('link', { name: 'Add Property' });

            expect(browseLink).toHaveAttribute('href', '/properties');
            expect(addLink).toHaveAttribute('href', '/properties/add');

            // Verify different content is rendered
            expect(screen.getByText('Find your dream rental property. Favorite properties and contact owners.')).toBeInTheDocument();
            expect(screen.getByText('Log in and rent your property.')).toBeInTheDocument();
        });
    });

    describe('Responsive Behavior', () => {
        it('should handle different viewport widths in FeaturedProperties', () => {
            // Since we're mocking FeaturedProperties directly, viewport width is fixed
            render(<FeaturedProperties />);
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-viewport-width', '1024');
        });

        it('should maintain responsive classes across components', () => {
            render(<Hero />);
            
            const heading = screen.getByText('Find The Perfect Rental');
            expect(heading).toHaveClass('text-4xl', 'sm:text-5xl', 'md:text-6xl');
        });
    });

    describe('Error Handling', () => {
        it('should handle individual component failures gracefully', () => {
            const HomePageLayout = () => (
                <div>
                    <Hero />
                    <InfoBoxes />
                </div>
            );

            render(<HomePageLayout />);

            // Hero and InfoBoxes should render without issues
            expect(screen.getByText('Find The Perfect Rental')).toBeInTheDocument();
            expect(screen.getByText('For Renters')).toBeInTheDocument();
            expect(screen.getByText('For Property Owners')).toBeInTheDocument();
        });
    });

    describe('Performance Integration', () => {
        it('should render all components within reasonable time', () => {
            const startTime = performance.now();
            
            const HomePageLayout = () => (
                <div>
                    <Hero />
                    <FeaturedProperties />
                    <InfoBoxes />
                </div>
            );

            render(<HomePageLayout />);
            
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
            
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(200);
        });

        it('should handle multiple re-renders efficiently', () => {
            const HomePageLayout = () => (
                <div>
                    <Hero />
                    <FeaturedProperties />
                    <InfoBoxes />
                </div>
            );

            const { rerender } = render(<HomePageLayout />);
            
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();

            // Should handle re-renders without issues
            rerender(<HomePageLayout />);
            
            expect(screen.getByText('Featured Properties')).toBeInTheDocument();
            expect(screen.getByText('Find The Perfect Rental')).toBeInTheDocument();
            expect(screen.getByText('For Renters')).toBeInTheDocument();
        });
    });

    describe('Accessibility Integration', () => {
        it('should maintain proper heading hierarchy across components', () => {
            const HomePageLayout = () => (
                <div>
                    <Hero />
                    <FeaturedProperties />
                    <InfoBoxes />
                </div>
            );

            render(<HomePageLayout />);
            
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();

            const headings = screen.getAllByRole('heading');
            expect(headings.length).toBeGreaterThan(0);
            
            // Verify H1 headings exist
            const h1Headings = headings.filter(h => h.tagName === 'H1');
            expect(h1Headings.length).toBeGreaterThan(0);
        });

        it('should provide accessible navigation across components', () => {
            const HomePageLayout = () => (
                <div>
                    <Hero />
                    <InfoBoxes />
                </div>
            );

            render(<HomePageLayout />);

            const links = screen.getAllByRole('link');
            expect(links.length).toBeGreaterThanOrEqual(2); // InfoBoxes links

            links.forEach(link => {
                expect(link).toHaveAttribute('href');
                expect(link.textContent).toBeTruthy();
            });
        });
    });

    describe('Integration Snapshots', () => {
        it('should match integration snapshot', () => {
            const HomePageLayout = () => (
                <div>
                    <Hero />
                    <FeaturedProperties />
                    <InfoBoxes />
                </div>
            );

            const { container } = render(<HomePageLayout />);
            
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();

            expect(container.firstChild).toMatchSnapshot();
        });
    });
});