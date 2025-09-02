import React from 'react';
import { render, screen, fireEvent } from '@/__tests__/test-utils';
import PropertyImagesGallery from '@/ui/properties/id/images-gallery';
import { PropertyImageData } from '@/types/types';

// Mock react-photoswipe-gallery first
jest.mock('react-photoswipe-gallery', () => ({
    Item: ({ children, original, thumbnail, width, height }: { 
        children: (props: { ref: React.RefObject<any>; open: () => void }) => React.ReactNode;
        original: string;
        thumbnail: string; 
        width: number;
        height: number;
    }) => {
        const mockRef = { current: null };
        const mockOpen = jest.fn();
        return (
            <div 
                data-testid="gallery-item" 
                data-original={original} 
                data-thumbnail={thumbnail}
                data-width={width}
                data-height={height}
            >
                {children({ ref: mockRef, open: mockOpen })}
            </div>
        );
    },
    useGallery: jest.fn(() => ({ open: jest.fn() })),
}));

// Mock next/dynamic
jest.mock('next/dynamic', () => {
    return jest.fn().mockImplementation(() => {
        const { Item } = require('react-photoswipe-gallery');
        return Item;
    });
});

// Mock next/image
jest.mock('next/image', () => {
    return function MockImage({ 
        src, 
        alt, 
        fill, 
        className, 
        onClick, 
        priority,
        ...props 
    }: { 
        src: string;
        alt: string;
        fill?: boolean;
        className?: string;
        onClick?: () => void;
        priority?: boolean;
        [key: string]: any;
    }) {
        return (
            <img 
                src={src} 
                alt={alt} 
                className={className}
                onClick={onClick}
                data-testid="next-image" 
                data-fill={fill?.toString()}
                data-priority={priority?.toString()}
                {...props} 
            />
        );
    };
});

// Mock react-icons/ri
jest.mock('react-icons/ri', () => ({
    RiGalleryView2: ({ className, onClick, ...props }: { 
        className?: string;
        onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
        [key: string]: any;
    }) => (
        <svg 
            data-testid="gallery-view-icon" 
            className={className}
            onClick={onClick}
            {...props}
        >
            Gallery Icon
        </svg>
    ),
}));

// Mock clsx
jest.mock('clsx', () => jest.fn((baseClasses, conditionalClasses) => {
    let result = baseClasses || '';
    
    if (typeof conditionalClasses === 'object') {
        const conditionalClassNames = Object.keys(conditionalClasses)
            .filter(key => conditionalClasses[key])
            .join(' ');
        result = result + ' ' + conditionalClassNames;
    }
    
    return result.trim();
}));

describe('PropertyImagesGallery', () => {
    const createImageData = (count: number): PropertyImageData[] => {
        return Array.from({ length: count }, (_, index) => ({
            secureUrl: `https://example.com/image${index + 1}.jpg`,
            publicId: `image${index + 1}`,
            width: 800,
            height: 600,
        }));
    };

    const mockUseGallery = jest.requireMock('react-photoswipe-gallery').useGallery;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGallery.mockReturnValue({ open: jest.fn() });
    });

    describe('Component Structure', () => {
        it('should render gallery container', () => {
            const imagesData = createImageData(3);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            expect(container.firstChild).toHaveClass('relative');
        });

        it('should render all provided images', () => {
            const imagesData = createImageData(4);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const galleryItems = screen.getAllByTestId('gallery-item');
            expect(galleryItems).toHaveLength(4);
        });

        it('should render next/image components for each image', () => {
            const imagesData = createImageData(3);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const images = screen.getAllByTestId('next-image');
            expect(images).toHaveLength(3);
        });
    });

    describe('Grid Layout Logic', () => {
        it('should apply grid-cols-3 class for 3 images', () => {
            const imagesData = createImageData(3);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass('grid-cols-3');
        });

        it('should apply grid-cols-2 class for 4 images', () => {
            const imagesData = createImageData(4);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass('grid-cols-2');
        });

        it('should apply grid-cols-4 class for 5 images', () => {
            const imagesData = createImageData(5);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass('grid-cols-4');
        });

        it('should not apply grid-cols class for more than 5 images', () => {
            const imagesData = createImageData(8);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).not.toHaveClass('grid-cols-3');
            expect(gridContainer).not.toHaveClass('grid-cols-2');
            expect(gridContainer).not.toHaveClass('grid-cols-4');
            expect(gridContainer).toHaveClass('grid', 'grid-rows-2', 'gap-2', 'md:gap-3');
        });

        it('should always apply base grid classes', () => {
            const imagesData = createImageData(3);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass('grid', 'grid-rows-2', 'gap-2', 'md:gap-3');
        });
    });

    describe('Image Positioning Classes', () => {
        it('should apply col-span-2 row-span-2 to first image when numImages > 4', () => {
            const imagesData = createImageData(5);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const firstImageDiv = container.querySelector('[class*="col-span-2 row-span-2"]');
            expect(firstImageDiv).toBeInTheDocument();
        });

        it('should apply col-span-2 row-span-2 to first image when numImages === 3', () => {
            const imagesData = createImageData(3);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const firstImageDiv = container.querySelector('[class*="col-span-2 row-span-2"]');
            expect(firstImageDiv).toBeInTheDocument();
        });

        it('should apply correct positioning classes for 5+ images layout', () => {
            const imagesData = createImageData(6);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            // Check specific positioning classes exist
            expect(container.querySelector('[class*="col-start-3"]')).toBeInTheDocument();
            expect(container.querySelector('[class*="col-start-4 row-start-1"]')).toBeInTheDocument();
            expect(container.querySelector('[class*="col-start-4 row-start-2"]')).toBeInTheDocument();
        });

        it('should hide images after index 4 when numImages > 4', () => {
            const imagesData = createImageData(8);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const hiddenImages = container.querySelectorAll('[class*="hidden"]');
            expect(hiddenImages.length).toBeGreaterThan(0);
        });
    });

    describe('Gallery Item Props', () => {
        it('should pass correct props to gallery items', () => {
            const imagesData = createImageData(2);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const firstGalleryItem = screen.getAllByTestId('gallery-item')[0];
            expect(firstGalleryItem).toHaveAttribute('data-original', 'https://example.com/image1.jpg');
            expect(firstGalleryItem).toHaveAttribute('data-thumbnail', 'https://example.com/image1.jpg');
            expect(firstGalleryItem).toHaveAttribute('data-width', '800');
            expect(firstGalleryItem).toHaveAttribute('data-height', '600');
        });

        it('should use unique secureUrl as key for each gallery item', () => {
            const imagesData = [
                { secureUrl: 'https://example.com/unique1.jpg', publicId: 'id1', width: 800, height: 600 },
                { secureUrl: 'https://example.com/unique2.jpg', publicId: 'id2', width: 800, height: 600 }
            ];
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const galleryItems = screen.getAllByTestId('gallery-item');
            expect(galleryItems[0]).toHaveAttribute('data-original', 'https://example.com/unique1.jpg');
            expect(galleryItems[1]).toHaveAttribute('data-original', 'https://example.com/unique2.jpg');
        });
    });

    describe('Next/Image Configuration', () => {
        it('should set priority=true for first image only', () => {
            const imagesData = createImageData(3);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const images = screen.getAllByTestId('next-image');
            expect(images[0]).toHaveAttribute('data-priority', 'true');
            expect(images[1]).toHaveAttribute('data-priority', 'false');
            expect(images[2]).toHaveAttribute('data-priority', 'false');
        });

        it('should apply fill prop to all images', () => {
            const imagesData = createImageData(2);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const images = screen.getAllByTestId('next-image');
            images.forEach(image => {
                expect(image).toHaveAttribute('data-fill', 'true');
            });
        });

        it('should apply correct CSS classes to images', () => {
            const imagesData = createImageData(1);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const image = screen.getByTestId('next-image');
            expect(image).toHaveClass('object-cover', 'rounded-md', 'cursor-pointer');
        });

        it('should use secureUrl as src for images', () => {
            const imagesData = [{ 
                secureUrl: 'https://custom.com/test.jpg', 
                publicId: 'test', 
                width: 400, 
                height: 300 
            }];
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const image = screen.getByTestId('next-image');
            expect(image).toHaveAttribute('src', 'https://custom.com/test.jpg');
        });

        it('should have empty alt text for all images', () => {
            const imagesData = createImageData(2);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const images = screen.getAllByTestId('next-image');
            images.forEach(image => {
                expect(image).toHaveAttribute('alt', '');
            });
        });
    });

    describe('Gallery View Icon', () => {
        it('should show gallery icon when image at index 4 exists and total images > 5', () => {
            const imagesData = createImageData(7);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            expect(screen.getByTestId('gallery-view-icon')).toBeInTheDocument();
        });

        it('should not show gallery icon when total images <= 5', () => {
            const imagesData = createImageData(5);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            expect(screen.queryByTestId('gallery-view-icon')).not.toBeInTheDocument();
        });

        it('should not show gallery icon when total images < 5 (no image at index 4)', () => {
            const imagesData = createImageData(4);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            expect(screen.queryByTestId('gallery-view-icon')).not.toBeInTheDocument();
        });

        it('should apply correct CSS classes to gallery icon', () => {
            const imagesData = createImageData(6);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const icon = screen.getByTestId('gallery-view-icon');
            expect(icon).toHaveClass(
                'absolute', 'bottom-2', 'right-2', 'size-10', 
                'z-10', 'text-gray-400', 'bg-white/80', 'rounded-sm'
            );
        });
    });

    describe('Gallery Interaction', () => {
        it('should call gallery open function when photo icon is clicked', () => {
            const mockOpen = jest.fn();
            mockUseGallery.mockReturnValue({ open: mockOpen });
            
            const imagesData = createImageData(6);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const galleryIcon = screen.getByTestId('gallery-view-icon');
            fireEvent.click(galleryIcon);
            
            expect(mockOpen).toHaveBeenCalledWith(5);
        });

        it('should prevent default event when photo icon is clicked', () => {
            const mockOpen = jest.fn();
            mockUseGallery.mockReturnValue({ open: mockOpen });
            
            const imagesData = createImageData(6);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const galleryIcon = screen.getByTestId('gallery-view-icon');
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
            
            fireEvent(galleryIcon, clickEvent);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should use useGallery hook for gallery functionality', () => {
            const imagesData = createImageData(3);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            expect(mockUseGallery).toHaveBeenCalled();
        });
    });

    describe('Dynamic Import Behavior', () => {
        it('should handle dynamic import of Item component', () => {
            const mockDynamic = jest.requireMock('next/dynamic');
            mockDynamic.mockImplementation(() => require('react-photoswipe-gallery').Item);
            
            const imagesData = createImageData(1);
            expect(() => render(<PropertyImagesGallery imagesData={imagesData} />)).not.toThrow();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty images array', () => {
            const { container } = render(<PropertyImagesGallery imagesData={[]} />);
            
            expect(container.firstChild).toBeInTheDocument();
            expect(screen.queryByTestId('gallery-item')).not.toBeInTheDocument();
        });

        it('should handle single image', () => {
            const imagesData = createImageData(1);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            expect(screen.getByTestId('gallery-item')).toBeInTheDocument();
            expect(screen.getByTestId('next-image')).toBeInTheDocument();
        });

        it('should handle images with different dimensions', () => {
            const imagesData = [
                { secureUrl: 'https://example.com/small.jpg', publicId: 'small', width: 200, height: 150 },
                { secureUrl: 'https://example.com/large.jpg', publicId: 'large', width: 1200, height: 800 }
            ];
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const galleryItems = screen.getAllByTestId('gallery-item');
            expect(galleryItems[0]).toHaveAttribute('data-width', '200');
            expect(galleryItems[0]).toHaveAttribute('data-height', '150');
            expect(galleryItems[1]).toHaveAttribute('data-width', '1200');
            expect(galleryItems[1]).toHaveAttribute('data-height', '800');
        });

        it('should handle images with special characters in URLs', () => {
            const imagesData = [{
                secureUrl: 'https://example.com/image with spaces & symbols.jpg',
                publicId: 'special',
                width: 800,
                height: 600
            }];
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const galleryItem = screen.getByTestId('gallery-item');
            expect(galleryItem).toHaveAttribute('data-original', 'https://example.com/image with spaces & symbols.jpg');
        });
    });

    describe('Container Structure', () => {
        it('should have proper nested div structure', () => {
            const imagesData = createImageData(2);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const outerDiv = container.firstChild;
            expect(outerDiv).toHaveClass('relative');
            
            const gridDiv = outerDiv?.firstChild;
            expect(gridDiv).toHaveClass('grid');
        });

        it('should create individual containers for each image', () => {
            const imagesData = createImageData(3);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const imageContainers = container.querySelectorAll('div[class*="object-cover h-full w-full rounded-md cursor-pointer aspect-square"]');
            expect(imageContainers).toHaveLength(3);
        });

        it('should apply cursor-pointer to image containers', () => {
            const imagesData = createImageData(1);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const imageContainer = container.querySelector('div[class*="cursor-pointer"]');
            expect(imageContainer).toBeInTheDocument();
        });

        it('should apply aspect-square class to maintain aspect ratio', () => {
            const imagesData = createImageData(1);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const imageContainer = container.querySelector('div[class*="aspect-square"]');
            expect(imageContainer).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('should apply responsive gap classes', () => {
            const imagesData = createImageData(2);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass('gap-2', 'md:gap-3');
        });

        it('should handle different screen sizes with appropriate grid layout', () => {
            const imagesData = createImageData(4);
            const { container } = render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass('grid-rows-2');
        });
    });

    describe('Performance Considerations', () => {
        it('should set priority loading only for first image', () => {
            const imagesData = createImageData(5);
            render(<PropertyImagesGallery imagesData={imagesData} />);
            
            const images = screen.getAllByTestId('next-image');
            expect(images[0]).toHaveAttribute('data-priority', 'true');
            
            for (let i = 1; i < images.length; i++) {
                expect(images[i]).toHaveAttribute('data-priority', 'false');
            }
        });

        it('should handle dynamic imports efficiently', () => {
            const mockDynamic = jest.requireMock('next/dynamic');
            expect(mockDynamic).toBeDefined();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshots for different layouts', () => {
            // Single image layout
            const singleImage = render(<PropertyImagesGallery imagesData={createImageData(1)} />);
            expect(singleImage.container.firstChild).toMatchSnapshot('single image');
            
            // Grid layout with multiple images
            const multipleImages = render(<PropertyImagesGallery imagesData={createImageData(5)} />);
            expect(multipleImages.container.firstChild).toMatchSnapshot('multiple images');
            
            // Empty state
            const emptyImages = render(<PropertyImagesGallery imagesData={[]} />);
            expect(emptyImages.container.firstChild).toMatchSnapshot('empty images');
        });
    });
});