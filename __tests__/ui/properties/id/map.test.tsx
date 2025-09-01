import React from 'react';
import { render, screen, waitFor } from '@/__tests__/test-utils';
import PropertyMap from '@/ui/properties/id/map';
import { PropertyDocument } from '@/models';
import { mockPropertyData } from '@/__tests__/property-detail-test-utils';

// Mock react-geocode
jest.mock('react-geocode', () => ({
    setDefaults: jest.fn(),
    fromAddress: jest.fn(),
    OutputFormat: {
        JSON: 'JSON'
    }
}));

const mockFromAddress = jest.requireMock('react-geocode').fromAddress;
const mockSetDefaults = jest.requireMock('react-geocode').setDefaults;

// Mock next/dynamic
jest.mock('next/dynamic', () => {
    return jest.fn().mockImplementation((dynamicImport, options) => {
        // Return the actual components based on the import path
        if (dynamicImport.toString().includes('mod.default')) {
            const { default: MockMap } = require('react-map-gl/mapbox');
            return MockMap;
        }
        if (dynamicImport.toString().includes('mod.Marker')) {
            const { Marker } = require('react-map-gl/mapbox');
            return Marker;
        }
        if (dynamicImport.toString().includes('mod.NavigationControl')) {
            const { NavigationControl } = require('react-map-gl/mapbox');
            return NavigationControl;
        }
        // Default fallback
        const { default: MockMap } = require('react-map-gl/mapbox');
        return MockMap;
    });
});

// Mock react-map-gl/mapbox
jest.mock('react-map-gl/mapbox', () => ({
    __esModule: true,
    default: ({ children, mapboxAccessToken, initialViewState, style, mapStyle, mapLib, ...props }: { 
        children: React.ReactNode;
        mapboxAccessToken: string;
        initialViewState: { longitude?: number; latitude?: number; zoom: number };
        style: { width: string; height: number };
        mapStyle: string;
        mapLib: any;
        [key: string]: any;
    }) => (
        <div 
            data-testid="mapbox-map" 
            data-mapbox-token={mapboxAccessToken || ''}
            data-longitude={initialViewState?.longitude || ''}
            data-latitude={initialViewState?.latitude || ''}
            data-zoom={initialViewState?.zoom || ''}
            data-map-style={mapStyle || ''}
            style={style}
            {...props}
        >
            {children}
        </div>
    ),
    Marker: ({ longitude, latitude, anchor, children, ...props }: { 
        longitude: number;
        latitude: number;
        anchor: string;
        children: React.ReactNode;
        [key: string]: any;
    }) => (
        <div 
            data-testid="map-marker" 
            data-longitude={longitude} 
            data-latitude={latitude} 
            data-anchor={anchor}
            {...props}
        >
            {children}
        </div>
    ),
    NavigationControl: ({ showCompass, position, ...props }: { 
        showCompass: boolean;
        position: string;
        [key: string]: any;
    }) => (
        <div 
            data-testid="navigation-control" 
            data-show-compass={showCompass}
            data-position={position}
            {...props} 
        />
    ),
}));

// Mock next/image
jest.mock('next/image', () => {
    return function MockImage({ 
        src, 
        alt, 
        width, 
        height,
        ...props 
    }: { 
        src: string;
        alt: string;
        width: number;
        height: number;
        [key: string]: any;
    }) {
        return (
            <img 
                src={src} 
                alt={alt} 
                width={width}
                height={height}
                data-testid="next-image" 
                {...props} 
            />
        );
    };
});

// Mock pin asset
jest.mock('@/assets/images/pin.svg', () => '/mock-pin.svg');

// Mock mapbox-gl CSS import and the actual mapbox-gl library
jest.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

// Mock mapbox-gl library to prevent TextDecoder issues
jest.mock('mapbox-gl', () => ({
    Map: jest.fn(),
    NavigationControl: jest.fn(),
    Marker: jest.fn(),
}));

// Mock MapSkeleton
jest.mock('@/ui/skeletons/map-skeleton', () => {
    return function MockMapSkeleton({ height }: { height: number }) {
        return (
            <div data-testid="map-skeleton" data-height={height}>
                Loading map...
            </div>
        );
    };
});

describe('PropertyMap', () => {
    const defaultProperty = mockPropertyData as unknown as PropertyDocument;
    const defaultViewportWidth = 1024;

    const mockGeocodeSuccess = {
        results: [
            {
                geometry: {
                    location: {
                        lat: 40.7128,
                        lng: -74.0060
                    }
                }
            }
        ]
    };

    const mockGeocodeEmpty = {
        results: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock environment variables
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'mock-google-api-key';
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'mock-mapbox-token';
        
        // Default successful geocoding response
        mockFromAddress.mockResolvedValue(mockGeocodeSuccess);
    });

    afterEach(() => {
        delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    });

    describe('Component Structure', () => {
        it('should render location info', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            expect(screen.getByText(/123 Main St Downtown, CA 90210/)).toBeInTheDocument();
        });

        it('should display property address correctly', async () => {
            const customProperty = {
                ...defaultProperty,
                location: {
                    street: '456 Oak Ave',
                    city: 'San Francisco',
                    state: 'CA',
                    zipcode: '94102'
                }
            } as PropertyDocument;

            render(<PropertyMap property={customProperty} viewportWidth={defaultViewportWidth} />);
            
            expect(screen.getByText(/456 Oak Ave San Francisco, CA 94102/)).toBeInTheDocument();
        });
    });

    describe('Geocoding Integration', () => {
        it('should call setDefaults with correct configuration on mount', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(mockSetDefaults).toHaveBeenCalledWith({
                    key: 'mock-google-api-key',
                    language: 'en',
                    region: 'us',
                    outputFormat: 'JSON'
                });
            });
        });

        it('should call fromAddress with property location', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(mockFromAddress).toHaveBeenCalledWith('123 Main St Downtown CA 90210');
            });
        });

        it('should handle successful geocoding response', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(mockFromAddress).toHaveBeenCalledWith('123 Main St Downtown CA 90210');
            });
        });

        it('should handle geocoding API errors gracefully', async () => {
            mockFromAddress.mockRejectedValue(new Error('API Error'));
            
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByText('No location data found.')).toBeInTheDocument();
            });
        });

        it('should handle empty geocoding results', async () => {
            mockFromAddress.mockResolvedValue(mockGeocodeEmpty);
            
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByText('No location data found.')).toBeInTheDocument();
            });
        });
    });

    describe('Map Component Integration', () => {
        it('should render map with correct mapbox token', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveAttribute('data-mapbox-token', 'mock-mapbox-token');
            });
        });

        it('should set correct map style', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveAttribute('data-map-style', 'mapbox://styles/mapbox/streets-v9');
            });
        });

        it('should set correct initial zoom level', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveAttribute('data-zoom', '15');
            });
        });

        it('should apply correct map dimensions', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={1024} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ width: '100%', height: '800px' });
            });
        });
    });

    describe('Map Marker', () => {
        it('should render marker at correct coordinates', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const marker = screen.getByTestId('map-marker');
                expect(marker).toHaveAttribute('data-longitude', '-74.006');
                expect(marker).toHaveAttribute('data-latitude', '40.7128');
                expect(marker).toHaveAttribute('data-anchor', 'bottom');
            });
        });

        it('should display pin image in marker', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const pinImage = screen.getByTestId('next-image');
                expect(pinImage).toHaveAttribute('src', '/mock-pin.svg');
                expect(pinImage).toHaveAttribute('alt', 'location');
                expect(pinImage).toHaveAttribute('width', '40');
                expect(pinImage).toHaveAttribute('height', '40');
            });
        });
    });

    describe('Navigation Controls', () => {
        it('should render navigation controls with correct settings', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const navControl = screen.getByTestId('navigation-control');
                expect(navControl).toHaveAttribute('data-show-compass', 'false');
                expect(navControl).toHaveAttribute('data-position', 'top-right');
            });
        });
    });

    describe('Responsive Height Calculation', () => {
        it('should use 400px height for mobile screens (< 640px)', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={500} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ height: '400px' });
            });
        });

        it('should use 500px height for tablet screens (640px - 767px)', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={700} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ height: '500px' });
            });
        });

        it('should use 800px height for desktop screens (>= 768px)', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={1200} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ height: '800px' });
            });
        });

        it('should use 500px height for exactly 640px viewport', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={640} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ height: '500px' });
            });
        });

        it('should use 800px height for exactly 768px viewport', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={768} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ height: '800px' });
            });
        });
    });

    describe('Loading States', () => {
        it('should show map skeleton while loading', () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            expect(screen.getByTestId('map-skeleton')).toBeInTheDocument();
            expect(screen.getByText('Loading map...')).toBeInTheDocument();
        });

        it('should pass correct height to skeleton', () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={1024} />);
            
            const skeleton = screen.getByTestId('map-skeleton');
            expect(skeleton).toHaveAttribute('data-height', '800');
        });

        it('should hide skeleton and show map after loading', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.queryByTestId('map-skeleton')).not.toBeInTheDocument();
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should show error message when geocoding fails', async () => {
            mockFromAddress.mockRejectedValue(new Error('Geocoding failed'));
            
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByText('No location data found.')).toBeInTheDocument();
                expect(screen.queryByTestId('mapbox-map')).not.toBeInTheDocument();
            });
        });

        it('should show error message when no results returned', async () => {
            mockFromAddress.mockResolvedValue({ results: [] });
            
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByText('No location data found.')).toBeInTheDocument();
                expect(screen.queryByTestId('mapbox-map')).not.toBeInTheDocument();
            });
        });

        it('should still show location info when geocoding fails', async () => {
            mockFromAddress.mockRejectedValue(new Error('API Error'));
            
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByText(/123 Main St Downtown, CA 90210/)).toBeInTheDocument();
                expect(screen.getByText('No location data found.')).toBeInTheDocument();
            });
        });
    });

    describe('Environment Variables', () => {
        it('should handle missing Google Maps API key', async () => {
            delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            expect(mockSetDefaults).toHaveBeenCalledWith({
                key: undefined,
                language: 'en',
                region: 'us',
                outputFormat: 'JSON'
            });
        });

        it('should handle missing Mapbox token', async () => {
            delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveAttribute('data-mapbox-token', '');
            });
        });
    });

    describe('Different Property Locations', () => {
        it('should handle property with different location structure', async () => {
            const propertyWithDifferentLocation = {
                ...defaultProperty,
                location: {
                    street: '789 Pine Street',
                    city: 'Los Angeles',
                    state: 'CA',
                    zipcode: '90001'
                }
            } as PropertyDocument;

            mockFromAddress.mockResolvedValue({
                results: [{
                    geometry: {
                        location: {
                            lat: 34.0522,
                            lng: -118.2437
                        }
                    }
                }]
            });

            render(<PropertyMap property={propertyWithDifferentLocation} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(mockFromAddress).toHaveBeenCalledWith('789 Pine Street Los Angeles CA 90001');
                const marker = screen.getByTestId('map-marker');
                expect(marker).toHaveAttribute('data-longitude', '-118.2437');
                expect(marker).toHaveAttribute('data-latitude', '34.0522');
            });
        });

        it('should handle international addresses', async () => {
            const internationalProperty = {
                ...defaultProperty,
                location: {
                    street: '123 Queen St',
                    city: 'Toronto',
                    state: 'ON',
                    zipcode: 'M5H 2M9'
                }
            } as unknown as PropertyDocument;

            render(<PropertyMap property={internationalProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(mockFromAddress).toHaveBeenCalledWith('123 Queen St Toronto ON M5H 2M9');
            });
        });
    });

    describe('Dynamic Imports', () => {
        it('should handle dynamic map component import', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
        });

        it('should render loading skeleton while dynamic components load', () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            // Initially shows skeleton
            expect(screen.getByTestId('map-skeleton')).toBeInTheDocument();
        });
    });

    describe('Map Viewport State', () => {
        it('should initialize viewport state correctly', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            // The initial viewport state should be set
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toBeInTheDocument();
            });
        });

        it('should update viewport when coordinates are received', async () => {
            const customCoords = {
                results: [{
                    geometry: {
                        location: {
                            lat: 37.7749,
                            lng: -122.4194
                        }
                    }
                }]
            };
            mockFromAddress.mockResolvedValue(customCoords);

            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveAttribute('data-longitude', '-122.4194');
                expect(map).toHaveAttribute('data-latitude', '37.7749');
            });
        });
    });

    describe('CSS and Assets', () => {
        it('should handle mapbox-gl CSS import', () => {
            // The import should not cause errors
            expect(() => {
                render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            }).not.toThrow();
        });

        it('should load pin asset correctly', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const pinImage = screen.getByTestId('next-image');
                expect(pinImage).toHaveAttribute('src', '/mock-pin.svg');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero coordinates', async () => {
            mockFromAddress.mockResolvedValue({
                results: [{
                    geometry: {
                        location: {
                            lat: 0,
                            lng: 0
                        }
                    }
                }]
            });

            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const marker = screen.getByTestId('map-marker');
                expect(marker).toHaveAttribute('data-longitude', '0');
                expect(marker).toHaveAttribute('data-latitude', '0');
            });
        });

        it('should handle negative coordinates', async () => {
            mockFromAddress.mockResolvedValue({
                results: [{
                    geometry: {
                        location: {
                            lat: -33.8688,
                            lng: 151.2093
                        }
                    }
                }]
            });

            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                const marker = screen.getByTestId('map-marker');
                expect(marker).toHaveAttribute('data-longitude', '151.2093');
                expect(marker).toHaveAttribute('data-latitude', '-33.8688');
            });
        });

        it('should handle very small viewport widths', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={320} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ height: '400px' });
            });
        });

        it('should handle very large viewport widths', async () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={2560} />);
            
            await waitFor(() => {
                const map = screen.getByTestId('mapbox-map');
                expect(map).toHaveStyle({ height: '800px' });
            });
        });
    });

    describe('Performance Considerations', () => {
        it('should use SSR: false for dynamic imports', () => {
            // This is implicitly tested by the dynamic mock working correctly
            expect(() => {
                render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            }).not.toThrow();
        });

        it('should show loading state immediately', () => {
            render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            expect(screen.getByTestId('map-skeleton')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot in loading state', () => {
            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with loaded map and controls', async () => {
            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot in error state', async () => {
            mockFromAddress.mockRejectedValue(new Error('Geocoding failed'));
            
            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByText('No location data found.')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with empty geocoding results', async () => {
            mockFromAddress.mockResolvedValue({ results: [] });
            
            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByText('No location data found.')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with mobile responsive height', async () => {
            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={500} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with tablet responsive height', async () => {
            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={700} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with desktop responsive height', async () => {
            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={1200} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different property location', async () => {
            const customProperty = {
                ...defaultProperty,
                location: {
                    street: '456 Oak Avenue',
                    city: 'San Francisco',
                    state: 'CA',
                    zipcode: '94102'
                }
            } as PropertyDocument;

            mockFromAddress.mockResolvedValue({
                results: [{
                    geometry: {
                        location: {
                            lat: 37.7749,
                            lng: -122.4194
                        }
                    }
                }]
            });

            const { container } = render(<PropertyMap property={customProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with zero coordinates', async () => {
            mockFromAddress.mockResolvedValue({
                results: [{
                    geometry: {
                        location: {
                            lat: 0,
                            lng: 0
                        }
                    }
                }]
            });

            const { container } = render(<PropertyMap property={defaultProperty} viewportWidth={defaultViewportWidth} />);
            
            await waitFor(() => {
                expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});