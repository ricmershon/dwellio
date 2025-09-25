// Mock for @/models/property-model.ts
import { PropertyImageData } from '@/types';

interface MockPropertyData {
    owner?: string;
    name?: string;
    type?: string;
    description?: string;
    location?: {
        street?: string;
        city?: string;
        state?: string;
        zipcode?: string;
    };
    beds?: number;
    baths?: number;
    squareFeet?: number;
    amenities?: string[];
    rates?: {
        nightly?: number;
        weekly?: number;
        monthly?: number;
    };
    sellerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    imagesData?: PropertyImageData[];
    isFeatured?: boolean;
}

class MockProperty {
    private data: MockPropertyData;

    constructor(data: MockPropertyData) {
        this.data = data;
    }

    async save() {
        // Simulate validation - return rejected promises for validation errors
        if (!this.data.owner) {
            return Promise.reject(new Error('Path `owner` is required.'));
        }
        if (!this.data.name) {
            return Promise.reject(new Error('Path `name` is required.'));
        }
        if (!this.data.type) {
            return Promise.reject(new Error('Path `type` is required.'));
        }
        if (this.data.beds === undefined) {
            return Promise.reject(new Error('Path `beds` is required.'));
        }
        if (this.data.baths === undefined) {
            return Promise.reject(new Error('Path `baths` is required.'));
        }
        if (this.data.squareFeet === undefined) {
            return Promise.reject(new Error('Path `squareFeet` is required.'));
        }
        if (!this.data.imagesData) {
            return Promise.reject(new Error('Path `imagesData` is required.'));
        }
        if (this.data.imagesData && this.data.imagesData.length < 3) {
            return Promise.reject(new Error('At least three images are required.'));
        }

        return Promise.resolve({
            ...this.data,
            _id: 'mock-id-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            isFeatured: this.data.isFeatured || false,
            owner: {
                toString: () => this.data.owner
            }
        });
    }

    static deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
    static findById = jest.fn();
    static find = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
    static countDocuments = jest.fn();
}

export default MockProperty;
export { MockProperty as Property };
export interface PropertyDocument {
    _id: string;
    owner: any;
    name: string;
    type: string;
    description?: string;
    location?: {
        street?: string;
        city?: string;
        state?: string;
        zipcode?: string;
    };
    beds: number;
    baths: number;
    squareFeet: number;
    amenities?: string[];
    rates?: {
        nightly?: number;
        weekly?: number;
        monthly?: number;
    };
    sellerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    imagesData: PropertyImageData[];
    isFeatured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}