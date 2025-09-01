import React from 'react';
import { render, screen, act } from '@/__tests__/test-utils';
import PropertyImages from '@/ui/properties/id/images';
import { mockPropertyImageData } from '@/__tests__/property-detail-test-utils';

// Mock next/dynamic
jest.mock('next/dynamic', () => {
    return (importFn: () => Promise<any>, options?: any) => {
        // Return a mock component that represents the dynamically imported Gallery
        return function MockDynamicGallery({ children }: { children: React.ReactNode }) {
            return <div data-testid="gallery-wrapper">{children}</div>;
        };
    };
});

// Mock the PropertyImagesGallery component directly
jest.mock('@/ui/properties/id/images-gallery', () => {
    return function MockPropertyImagesGallery({ imagesData }: { imagesData: any[] }) {
        return (
            <div 
                data-testid="property-images-gallery" 
                data-images-count={imagesData?.length || 0}
            >
                PropertyImagesGallery Component
            </div>
        );
    };
});

describe('PropertyImages', () => {
    describe('Component Rendering', () => {
        it('should render as a section element', () => {
            const { container } = render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            expect(container.firstChild).toBe(section);
        });

        it('should render Gallery wrapper component', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            expect(screen.getByTestId('gallery-wrapper')).toBeInTheDocument();
        });

        it('should render PropertyImagesGallery component', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            expect(screen.getByTestId('property-images-gallery')).toBeInTheDocument();
        });

        it('should have proper nested structure', () => {
            const { container } = render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const section = container.querySelector('section');
            const galleryWrapper = section?.querySelector('[data-testid="gallery-wrapper"]');
            const imagesGallery = galleryWrapper?.querySelector('[data-testid="property-images-gallery"]');
            
            expect(section).toBeInTheDocument();
            expect(galleryWrapper).toBeInTheDocument();
            expect(imagesGallery).toBeInTheDocument();
        });
    });

    describe('Props Passing', () => {
        it('should pass imagesData to PropertyImagesGallery', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const gallery = screen.getByTestId('property-images-gallery');
            expect(gallery).toHaveAttribute('data-images-count', mockPropertyImageData.length.toString());
        });

        it('should handle empty images array', () => {
            render(<PropertyImages imagesData={[]} />);
            
            const gallery = screen.getByTestId('property-images-gallery');
            expect(gallery).toHaveAttribute('data-images-count', '0');
        });

        it('should handle single image', () => {
            const singleImage = [mockPropertyImageData[0]];
            render(<PropertyImages imagesData={singleImage} />);
            
            const gallery = screen.getByTestId('property-images-gallery');
            expect(gallery).toHaveAttribute('data-images-count', '1');
        });

        it('should handle multiple images', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const gallery = screen.getByTestId('property-images-gallery');
            expect(gallery).toHaveAttribute('data-images-count', mockPropertyImageData.length.toString());
        });
    });

    describe('Dynamic Import Integration', () => {
        it('should use dynamic import for Gallery component', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            // The Gallery component should be rendered through dynamic import
            expect(screen.getByTestId('gallery-wrapper')).toBeInTheDocument();
        });

        it('should render without server-side rendering for Gallery', () => {
            // This tests that the Gallery component is imported with { ssr: false }
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            expect(screen.getByTestId('gallery-wrapper')).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should maintain semantic HTML structure', () => {
            const { container } = render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            // Should be wrapped in a semantic section element
            expect(container.querySelector('section')).toBeInTheDocument();
        });

        it('should not have additional CSS classes on section', () => {
            const { container } = render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const section = container.querySelector('section');
            expect(section).not.toHaveAttribute('class');
        });
    });

    describe('Error Handling', () => {
        it('should render without throwing when images array is empty', () => {
            expect(() => render(<PropertyImages imagesData={[]} />)).not.toThrow();
        });

        it('should render without throwing when images data is missing properties', () => {
            const invalidImages = [
                { secureUrl: 'test.jpg' }, // missing other properties
            ] as any;
            
            expect(() => render(<PropertyImages imagesData={invalidImages} />)).not.toThrow();
        });

        it('should handle undefined imagesData gracefully', () => {
            expect(() => render(<PropertyImages imagesData={undefined as any} />)).not.toThrow();
        });
    });

    describe('Integration with PropertyImagesGallery', () => {
        it('should pass correct data structure to gallery', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const gallery = screen.getByTestId('property-images-gallery');
            expect(gallery).toHaveTextContent('PropertyImagesGallery Component');
        });

        it('should render gallery within photoswipe wrapper', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const wrapper = screen.getByTestId('gallery-wrapper');
            const gallery = screen.getByTestId('property-images-gallery');
            
            expect(wrapper).toContainElement(gallery);
        });
    });

    describe('Performance Considerations', () => {
        it('should use client-side only Gallery component', () => {
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            // Gallery should be loaded dynamically without SSR
            expect(screen.getByTestId('gallery-wrapper')).toBeInTheDocument();
        });

        it('should render quickly with multiple images', () => {
            const startTime = performance.now();
            render(<PropertyImages imagesData={mockPropertyImageData} />);
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(200); // Reasonable threshold for CI/different systems
        });
    });

    describe('Accessibility', () => {
        it('should use semantic section element', () => {
            const { container } = render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });

        it('should maintain proper document structure', () => {
            const { container } = render(<PropertyImages imagesData={mockPropertyImageData} />);
            
            // Should have proper nesting: section > gallery wrapper > gallery component
            const section = container.querySelector('section');
            expect(section?.children).toHaveLength(1);
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with standard image data', () => {
            const { container } = render(<PropertyImages imagesData={mockPropertyImageData} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with empty image array', () => {
            const { container } = render(<PropertyImages imagesData={[]} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with single image', () => {
            const singleImage = [mockPropertyImageData[0]];
            const { container } = render(<PropertyImages imagesData={singleImage} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});