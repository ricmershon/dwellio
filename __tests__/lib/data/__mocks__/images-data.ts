// Mock for @/lib/data/images-data (application module)
import { PropertyImageData } from '@/types';

export const mockPropertyImageData: PropertyImageData[] = [
    {
        secureUrl: 'https://res.cloudinary.com/test/image/upload/v1234567890/test1.jpg',
        publicId: 'test1',
        width: 1200,
        height: 800,
    },
    {
        secureUrl: 'https://res.cloudinary.com/test/image/upload/v1234567890/test2.jpg',
        publicId: 'test2',
        width: 1200,
        height: 800,
    },
    {
        secureUrl: 'https://res.cloudinary.com/test/image/upload/v1234567890/test3.jpg',
        publicId: 'test3',
        width: 1200,
        height: 800,
    },
];

export const uploadImages = jest.fn().mockResolvedValue(mockPropertyImageData);
export const destroyImages = jest.fn().mockResolvedValue(true);