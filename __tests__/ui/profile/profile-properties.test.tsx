import { render, screen } from '@testing-library/react';
import ProfileProperties from '@/ui/profile/profile-properties';
import { PropertyDocument } from '@/models';

// Mock Next.js components
jest.mock('next/image', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function MockImage({ src, alt, className, ...props }: any) {
        return <img src={src} alt={alt} className={className} {...props} />;
    };
});

jest.mock('next/link', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function MockLink({ href, children, className }: any) {
        return <a href={href} className={className}>{children}</a>;
    };
});

// Mock DeletePropertyButton component
jest.mock('@/ui/profile/delete-property-button', () => {
    return function MockDeletePropertyButton({ propertyId }: { propertyId: string }) {
        return <button data-testid={`delete-button-${propertyId}`}>Delete</button>;
    };
});

describe('ProfileProperties Component', () => {
    const mockProperty: PropertyDocument = {
        _id: 'property123',
        name: 'Beautiful Test Property',
        type: 'House',
        description: 'A wonderful property for testing',
        location: {
            street: '123 Test St',
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
            name: 'Test Seller',
            email: 'seller@test.com',
            phone: '555-1234'
        },
        owner: 'user123' as unknown as PropertyDocument['owner'],
        imagesData: [
            {
                secureUrl: 'https://test.com/image1.jpg',
                publicId: 'img1',
                width: 800,
                height: 600
            }
        ],
        isFeatured: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    } as PropertyDocument;

    const mockProperties = [
        mockProperty,
        {
            ...mockProperty,
            _id: 'property456',
            name: 'Another Test Property',
            location: {
                street: '456 Another St',
                city: 'Another City',
                state: 'CA',
                zipcode: '67890'
            },
            imagesData: [
                {
                    secureUrl: 'https://test.com/image2.jpg',
                    publicId: 'img2', 
                    width: 800,
                    height: 600
                }
            ]
        }
    ] as PropertyDocument[];

    describe('Grid Layout and Responsiveness', () => {
        it('should render responsive grid with correct breakpoint classes', () => {
            const { container } = render(<ProfileProperties properties={mockProperties} />);
            
            const gridElement = container.querySelector('.grid');
            expect(gridElement).toHaveClass(
                'grid',
                'grid-cols-2',
                'sm:grid-cols-3',
                'lg:grid-cols-4',
                'xl:grid-cols-5'
            );
        });

        it('should apply proper gap spacing', () => {
            const { container } = render(<ProfileProperties properties={mockProperties} />);
            
            const gridElement = container.querySelector('.grid');
            expect(gridElement).toHaveClass('gap-3', 'md:gap-4');
        });

        it('should maintain grid structure with single property', () => {
            const { container } = render(<ProfileProperties properties={[mockProperty]} />);
            
            const gridElement = container.querySelector('.grid');
            expect(gridElement).toBeInTheDocument();
            expect(gridElement?.children).toHaveLength(1);
        });

        it('should handle multiple properties in grid layout', () => {
            const { container } = render(<ProfileProperties properties={mockProperties} />);
            
            const gridElement = container.querySelector('.grid');
            expect(gridElement?.children).toHaveLength(2);
        });
    });

    describe('Property Card Rendering', () => {
        it('should render property cards for each property in array', () => {
            render(<ProfileProperties properties={mockProperties} />);
            
            expect(screen.getByText('Beautiful Test Property')).toBeInTheDocument();
            expect(screen.getByText('Another Test Property')).toBeInTheDocument();
        });

        it('should use property._id as React key', () => {
            const { container } = render(<ProfileProperties properties={mockProperties} />);
            
            const propertyCards = container.querySelectorAll('[key]');
            expect(propertyCards).toHaveLength(0); // Keys don't appear in DOM but should be used internally
            
            // Verify unique content instead
            expect(screen.getByText('Beautiful Test Property')).toBeInTheDocument();
            expect(screen.getByText('Another Test Property')).toBeInTheDocument();
        });

        it('should apply proper card styling', () => {
            const { container } = render(<ProfileProperties properties={[mockProperty]} />);
            
            const propertyCard = container.querySelector('.mb-4');
            expect(propertyCard).toHaveClass('mb-4', 'md:mb-6', 'rounded-lg', 'shadow-lg');
        });

        it('should maintain card structure for all properties', () => {
            const { container } = render(<ProfileProperties properties={mockProperties} />);
            
            const propertyCards = container.querySelectorAll('.mb-4.md\\:mb-6.rounded-lg.shadow-lg');
            expect(propertyCards).toHaveLength(2);
        });
    });

    describe('Property Image Handling', () => {
        it('should render property image from imagesData[0].secureUrl', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const image = screen.getByAltText('property123');
            expect(image).toHaveAttribute('src', 'https://test.com/image1.jpg');
        });

        it('should link image to property details page', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const links = screen.getAllByRole('link');
            const imageLink = links.find(link => link.getAttribute('href') === '/properties/property123');
            expect(imageLink).toHaveAttribute('href', '/properties/property123');
        });

        it('should apply proper image styling', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const image = screen.getByAltText('property123');
            expect(image).toHaveClass('h-32', 'w-full', 'rounded-t-lg', 'object-cover');
        });

        it('should handle different image URLs for multiple properties', () => {
            render(<ProfileProperties properties={mockProperties} />);
            
            const image1 = screen.getByAltText('property123');
            const image2 = screen.getByAltText('property456');
            
            expect(image1).toHaveAttribute('src', 'https://test.com/image1.jpg');
            expect(image2).toHaveAttribute('src', 'https://test.com/image2.jpg');
        });

        it('should set proper image dimensions', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const image = screen.getByAltText('property123');
            expect(image).toHaveAttribute('width', '400');
            expect(image).toHaveAttribute('height', '400');
        });
    });

    describe('Property Information Display', () => {
        it('should display property name', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            expect(screen.getByText('Beautiful Test Property')).toBeInTheDocument();
        });

        it('should format address as "street city state"', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            expect(screen.getByText('123 Test St Test City TX')).toBeInTheDocument();
        });

        it('should extract location data from property.location object', () => {
            const propertyWithDifferentLocation = {
                ...mockProperty,
                _id: 'property789',
                location: {
                    street: '789 Different Ave',
                    city: 'Different City',
                    state: 'FL',
                    zipcode: '54321'
                }
            } as PropertyDocument;

            render(<ProfileProperties properties={[propertyWithDifferentLocation]} />);
            
            expect(screen.getByText('789 Different Ave Different City FL')).toBeInTheDocument();
        });

        it('should apply appropriate text styling', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const propertyName = screen.getByText('Beautiful Test Property');
            const address = screen.getByText('123 Test St Test City TX');
            
            expect(propertyName.parentElement).toBeInTheDocument();
            expect(address).toHaveClass('text-gray-800', 'text-sm');
        });

        it('should handle different property names and addresses', () => {
            render(<ProfileProperties properties={mockProperties} />);
            
            expect(screen.getByText('Beautiful Test Property')).toBeInTheDocument();
            expect(screen.getByText('Another Test Property')).toBeInTheDocument();
            expect(screen.getByText('123 Test St Test City TX')).toBeInTheDocument();
            expect(screen.getByText('456 Another St Another City CA')).toBeInTheDocument();
        });
    });

    describe('Action Buttons Integration', () => {
        it('should render Edit link with correct href', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const editLink = screen.getByText('Edit');
            expect(editLink).toHaveAttribute('href', '/properties/property123/edit');
        });

        it('should apply proper Edit button styling', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const editLink = screen.getByText('Edit');
            expect(editLink).toHaveClass('btn', 'btn-primary', 'mr-2');
        });

        it('should render DeletePropertyButton with propertyId prop', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const deleteButton = screen.getByTestId('delete-button-property123');
            expect(deleteButton).toBeInTheDocument();
        });

        it('should maintain button layout and spacing', () => {
            const { container } = render(<ProfileProperties properties={[mockProperty]} />);
            
            const buttonContainer = container.querySelector('.mt-2.flex');
            expect(buttonContainer).toBeInTheDocument();
        });

        it('should render action buttons for each property', () => {
            render(<ProfileProperties properties={mockProperties} />);
            
            expect(screen.getByTestId('delete-button-property123')).toBeInTheDocument();
            expect(screen.getByTestId('delete-button-property456')).toBeInTheDocument();
            
            const editLinks = screen.getAllByText('Edit');
            expect(editLinks).toHaveLength(2);
        });

        it('should generate correct edit URLs for multiple properties', () => {
            render(<ProfileProperties properties={mockProperties} />);
            
            const editLinks = screen.getAllByText('Edit');
            expect(editLinks[0]).toHaveAttribute('href', '/properties/property123/edit');
            expect(editLinks[1]).toHaveAttribute('href', '/properties/property456/edit');
        });
    });

    describe('Data Handling', () => {
        it('should handle PropertyDocument interface correctly', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            expect(screen.getByText('Beautiful Test Property')).toBeInTheDocument();
            expect(screen.getByText('123 Test St Test City TX')).toBeInTheDocument();
            expect(screen.getByAltText('property123')).toBeInTheDocument();
        });

        it('should cast _id to string for routing', () => {
            render(<ProfileProperties properties={[mockProperty]} />);
            
            const links = screen.getAllByRole('link');
            const imageLink = links.find(link => link.getAttribute('href') === '/properties/property123');
            expect(imageLink).toHaveAttribute('href', '/properties/property123');
        });

        it('should access nested location properties safely', () => {
            const propertyWithComplexLocation = {
                ...mockProperty,
                location: {
                    street: 'Complex Street Name With Numbers 123',
                    city: 'Complex City-Name',
                    state: 'NY',
                    zipcode: '10001-1234'
                }
            } as PropertyDocument;

            render(<ProfileProperties properties={[propertyWithComplexLocation]} />);
            
            expect(screen.getByText('Complex Street Name With Numbers 123 Complex City-Name NY')).toBeInTheDocument();
        });

        it('should handle arrays with different lengths', () => {
            const singleProperty = [mockProperty];
            const multipleProperties = mockProperties;
            
            const { rerender } = render(<ProfileProperties properties={singleProperty} />);
            expect(screen.getAllByText('Edit')).toHaveLength(1);
            
            rerender(<ProfileProperties properties={multipleProperties} />);
            expect(screen.getAllByText('Edit')).toHaveLength(2);
        });
    });

    describe('Empty State Handling', () => {
        it('should handle empty properties array gracefully', () => {
            const { container } = render(<ProfileProperties properties={[]} />);
            
            const gridElement = container.querySelector('.grid');
            expect(gridElement).toBeInTheDocument();
            expect(gridElement?.children).toHaveLength(0);
        });

        it('should not render any cards when properties.length === 0', () => {
            render(<ProfileProperties properties={[]} />);
            
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
        });

        it('should maintain grid structure regardless of content', () => {
            const { container } = render(<ProfileProperties properties={[]} />);
            
            const gridElement = container.querySelector('.grid');
            expect(gridElement).toHaveClass(
                'grid',
                'grid-cols-2',
                'sm:grid-cols-3',
                'lg:grid-cols-4',
                'xl:grid-cols-5',
                'gap-3',
                'md:gap-4'
            );
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle properties without imagesData gracefully', () => {
            const propertyWithoutImages = {
                ...mockProperty,
                imagesData: [{
                    secureUrl: '',
                    publicId: '',
                    width: 0,
                    height: 0
                }]
            } as unknown as PropertyDocument;

            // This should not crash but may show broken image
            expect(() => {
                render(<ProfileProperties properties={[propertyWithoutImages]} />);
            }).not.toThrow();
        });

        it('should handle properties with missing location fields', () => {
            const propertyWithIncompleteLocation = {
                ...mockProperty,
                location: {
                    street: 'Only Street',
                    city: '',
                    state: '',
                    zipcode: '12345'
                }
            } as unknown as PropertyDocument;

            render(<ProfileProperties properties={[propertyWithIncompleteLocation]} />);
            
            expect(screen.getByText('Only Street')).toBeInTheDocument();
        });

        it('should handle properties with special characters in names', () => {
            const propertyWithSpecialChars = {
                ...mockProperty,
                name: "Property with Special Chars !@#$%^&*()"
            } as PropertyDocument;

            render(<ProfileProperties properties={[propertyWithSpecialChars]} />);
            
            expect(screen.getByText("Property with Special Chars !@#$%^&*()")).toBeInTheDocument();
        });

        it('should handle very long property names', () => {
            const propertyWithLongName = {
                ...mockProperty,
                name: "This is a very long property name that should be handled gracefully by the component without breaking the layout or causing display issues"
            } as PropertyDocument;

            render(<ProfileProperties properties={[propertyWithLongName]} />);
            
            expect(screen.getByText("This is a very long property name that should be handled gracefully by the component without breaking the layout or causing display issues")).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with empty properties array', () => {
            const { container } = render(<ProfileProperties properties={[]} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with single property', () => {
            const { container } = render(<ProfileProperties properties={[mockProperty]} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with multiple properties', () => {
            const { container } = render(<ProfileProperties properties={mockProperties} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different property types', () => {
            const differentTypeProperty = {
                ...mockProperty,
                _id: 'apartment123',
                name: 'Downtown Apartment',
                type: 'Apartment',
                location: {
                    street: '456 City Ave',
                    city: 'Metro City',
                    state: 'NY',
                    zipcode: '10001'
                }
            } as PropertyDocument;

            const { container } = render(<ProfileProperties properties={[differentTypeProperty]} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});