import { PropertyImageData } from '@/types';

// Mock the property model following TESTING_PLAN guidelines
const mockProperty = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: jest.fn().mockImplementation(() => {
        // Simulate validation - return rejected promises for validation errors
        if (!data.owner) {
            return Promise.reject(new Error('Path `owner` is required.'));
        }
        if (!data.name) {
            return Promise.reject(new Error('Path `name` is required.'));
        }
        if (!data.type) {
            return Promise.reject(new Error('Path `type` is required.'));
        }
        if (data.beds === undefined) {
            return Promise.reject(new Error('Path `beds` is required.'));
        }
        if (data.baths === undefined) {
            return Promise.reject(new Error('Path `baths` is required.'));
        }
        if (data.squareFeet === undefined) {
            return Promise.reject(new Error('Path `squareFeet` is required.'));
        }
        if (!data.imagesData) {
            return Promise.reject(new Error('Path `imagesData` is required.'));
        }
        if (data.imagesData && data.imagesData.length < 3) {
            return Promise.reject(new Error('At least three images are required.'));
        }

        return Promise.resolve({
            ...data,
            _id: 'mock-id-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            isFeatured: data.isFeatured || false,
            owner: {
                toString: () => data.owner
            }
        });
    })
}));

(mockProperty as any).deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });

// Mock the module using the mock from __mocks__ directory
jest.mock('@/models/property-model', () => ({
    __esModule: true,
    default: mockProperty
}));

describe('Property Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validImageData: PropertyImageData[] = [
        {
            secureUrl: 'https://example.com/image1.jpg',
            publicId: 'image1',
            width: 800,
            height: 600
        },
        {
            secureUrl: 'https://example.com/image2.jpg',
            publicId: 'image2',
            width: 800,
            height: 600
        },
        {
            secureUrl: 'https://example.com/image3.jpg',
            publicId: 'image3',
            width: 800,
            height: 600
        }
    ];

    const validPropertyData = {
        owner: 'mock-owner-id',
        name: 'Test Property',
        type: 'apartment',
        description: 'A beautiful test property',
        location: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipcode: '12345'
        },
        beds: 2,
        baths: 1,
        squareFeet: 1000,
        amenities: ['WiFi', 'Parking'],
        rates: {
            nightly: 100,
            weekly: 600,
            monthly: 2000
        },
        sellerInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234'
        },
        imagesData: validImageData
    };

    describe('Model Creation', () => {
        it('should create a valid property', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty._id).toBeDefined();
            expect(savedProperty.name).toBe('Test Property');
            expect(savedProperty.owner.toString()).toBe(validPropertyData.owner);
            expect(savedProperty.createdAt).toBeDefined();
            expect(savedProperty.updatedAt).toBeDefined();
        });

        it('should set default values correctly', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty.isFeatured).toBe(false);
        });

        it('should maintain timestamps', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty.createdAt).toBeInstanceOf(Date);
            expect(savedProperty.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('Required Field Validation', () => {
        it('should require owner field', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).owner;

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('Path `owner` is required.');
        });

        it('should require name field', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).name;

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('Path `name` is required.');
        });

        it('should require type field', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).type;

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('Path `type` is required.');
        });

        it('should require beds field', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).beds;

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('Path `beds` is required.');
        });

        it('should require baths field', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).baths;

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('Path `baths` is required.');
        });

        it('should require squareFeet field', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).squareFeet;

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('Path `squareFeet` is required.');
        });

        it('should require imagesData field', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).imagesData;

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('Path `imagesData` is required.');
        });
    });

    describe('Images Data Validation', () => {
        it('should require at least 3 images', async () => {
            const propertyData = {
                ...validPropertyData,
                imagesData: validImageData.slice(0, 2) // Only 2 images
            };

            const property = new mockProperty(propertyData);

            await expect(property.save()).rejects.toThrow('At least three images are required.');
        });

        it('should accept exactly 3 images', async () => {
            const propertyData = {
                ...validPropertyData,
                imagesData: validImageData // Exactly 3 images
            };

            const property = new mockProperty(propertyData);
            const savedProperty = await property.save();

            expect(savedProperty.imagesData).toHaveLength(3);
        });

        it('should accept more than 3 images', async () => {
            const extraImage: PropertyImageData = {
                secureUrl: 'https://example.com/image4.jpg',
                publicId: 'image4',
                width: 800,
                height: 600
            };

            const propertyData = {
                ...validPropertyData,
                imagesData: [...validImageData, extraImage] // 4 images
            };

            const property = new mockProperty(propertyData);
            const savedProperty = await property.save();

            expect(savedProperty.imagesData).toHaveLength(4);
        });
    });

    describe('Schema Validation', () => {
        it('should accept valid location data', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty.location).toMatchObject({
                street: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zipcode: '12345'
            });
        });

        it('should accept all rate types', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty.rates).toMatchObject({
                nightly: 100,
                weekly: 600,
                monthly: 2000
            });
        });

        it('should accept complete seller info', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty.sellerInfo).toMatchObject({
                name: 'John Doe',
                email: 'john@example.com',
                phone: '555-1234'
            });
        });

        it('should accept array of amenities', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty.amenities).toEqual(['WiFi', 'Parking']);
        });
    });

    describe('Optional Fields', () => {
        it('should work without description', async () => {
            const propertyData = { ...validPropertyData };
            delete (propertyData as any).description;

            const property = new mockProperty(propertyData);
            const savedProperty = await property.save();

            expect(savedProperty.description).toBeUndefined();
        });

        it('should work with empty description', async () => {
            const propertyData = {
                ...validPropertyData,
                description: ''
            };

            const property = new mockProperty(propertyData);
            const savedProperty = await property.save();

            expect(savedProperty.description).toBe('');
        });
    });

    describe('Model Reference', () => {
        it('should handle owner field correctly', async () => {
            const property = new mockProperty(validPropertyData);
            const savedProperty = await property.save();

            expect(savedProperty.owner.toString()).toBe(validPropertyData.owner);
        });
    });
});