import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import FeaturedProperties from '@/ui/root/page/featured-properties';

// Mock dependencies
jest.mock('@/ui/properties/properties-list', () => {
    const MockPropertiesList = ({ featured, viewportWidth }: { featured: boolean; viewportWidth: number }) => (
        <div 
            data-testid="properties-list" 
            data-featured={featured}
            data-viewport-width={viewportWidth}
        >
            Properties List Component
        </div>
    );
    MockPropertiesList.displayName = 'MockPropertiesList';
    return MockPropertiesList;
});

jest.mock('@/utils/get-viewport-width', () => ({
    getViewportWidth: jest.fn().mockResolvedValue(1024),
}));

describe('FeaturedProperties', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the featured properties heading', async () => {
            const component = await FeaturedProperties();
            render(component);
            
            const heading = screen.getByRole('heading', { name: 'Featured Properties' });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveClass('heading');
        });

        it('should render the PropertiesList component with correct props', async () => {
            const component = await FeaturedProperties();
            render(component);
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
            expect(propertiesList).toHaveAttribute('data-featured', 'true');
            expect(propertiesList).toHaveAttribute('data-viewport-width', '1024');
        });
    });

    describe('Async Behavior', () => {
        it('should call getViewportWidth utility', async () => {
            const getViewportWidthModule = await import('@/utils/get-viewport-width');
            
            await FeaturedProperties();
            
            expect(getViewportWidthModule.getViewportWidth).toHaveBeenCalledTimes(1);
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', async () => {
            const component = await FeaturedProperties();
            const { container } = render(component);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});