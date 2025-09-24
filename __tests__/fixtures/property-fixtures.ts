import { Types } from "mongoose";
import { PropertyDocument } from "@/models/property-model";
import { PropertyImageData } from "@/types";

export const mockPropertyImageData: PropertyImageData[] = [
    {
        secureUrl: "https://res.cloudinary.com/test/image/upload/v1234567890/property1_main.jpg",
        publicId: "property1_main",
        width: 1200,
        height: 800,
    },
    {
        secureUrl: "https://res.cloudinary.com/test/image/upload/v1234567890/property1_bedroom.jpg",
        publicId: "property1_bedroom",
        width: 1200,
        height: 800,
    },
    {
        secureUrl: "https://res.cloudinary.com/test/image/upload/v1234567890/property1_kitchen.jpg",
        publicId: "property1_kitchen",
        width: 1200,
        height: 800,
    },
    {
        secureUrl: "https://res.cloudinary.com/test/image/upload/v1234567890/property1_bathroom.jpg",
        publicId: "property1_bathroom",
        width: 1200,
        height: 800,
    },
];

export const mockUserId = new Types.ObjectId("507f1f77bcf86cd799439011");
export const mockPropertyId = new Types.ObjectId("507f1f77bcf86cd799439012");

export const basePropertyData = {
    name: "Charming Downtown Apartment with Modern Amenities",
    type: "Apartment" as const,
    description: "A beautiful, fully furnished apartment in the heart of downtown with stunning city views and all modern amenities you need for a comfortable stay.",
    location: {
        street: "123 Main Street Apt 4B",
        city: "San Francisco",
        state: "CA" as const,
        zipcode: "94102",
    },
    beds: 2,
    baths: 1,
    squareFeet: 850,
    amenities: [
        "WiFi",
        "Air Conditioning",
        "Kitchen",
        "Parking",
        "Pet Friendly",
        "Swimming Pool",
        "Gym",
    ],
    rates: {
        nightly: 250,
        weekly: 1500,
        monthly: 5000,
    },
    sellerInfo: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "555-0123",
    },
    imagesData: mockPropertyImageData,
    isFeatured: false,
};

export const mockPropertyDocument: PropertyDocument = {
    ...basePropertyData,
    _id: mockPropertyId,
    owner: mockUserId,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
} as PropertyDocument;

export const propertyVariations = {
    house: {
        ...basePropertyData,
        _id: new Types.ObjectId("507f1f77bcf86cd799439013"),
        name: "Spacious Family House with Garden",
        type: "House" as const,
        description: "A beautiful family home with a large garden, perfect for families with children. Features modern appliances and a quiet neighborhood setting.",
        location: {
            street: "456 Oak Avenue",
            city: "Austin",
            state: "TX" as const,
            zipcode: "73301",
        },
        beds: 4,
        baths: 3,
        squareFeet: 2200,
        rates: {
            nightly: 350,
            weekly: 2100,
            monthly: 7500,
        },
        amenities: [
            "WiFi",
            "Air Conditioning",
            "Kitchen",
            "Parking",
            "Pet Friendly",
            "Garden",
            "Fireplace",
            "Washer/Dryer",
        ],
        isFeatured: true,
    },

    studio: {
        ...basePropertyData,
        _id: new Types.ObjectId("507f1f77bcf86cd799439014"),
        name: "Cozy Studio in Arts District",
        type: "Studio" as const,
        description: "A modern studio apartment in the vibrant arts district, perfect for solo travelers or couples seeking an urban experience.",
        location: {
            street: "789 Creative Lane Unit 2A",
            city: "Portland",
            state: "OR" as const,
            zipcode: "97209",
        },
        beds: 1,
        baths: 1,
        squareFeet: 450,
        rates: {
            nightly: 200,
            weekly: 1200,
        },
        amenities: [
            "WiFi",
            "Air Conditioning",
            "Kitchen",
            "Parking",
            "24/7 Security",
        ],
        isFeatured: false,
    },

    cabin: {
        ...basePropertyData,
        _id: new Types.ObjectId("507f1f77bcf86cd799439015"),
        name: "Mountain Cabin Retreat with Lake View",
        type: "Cabin" as const,
        description: "Escape to this rustic mountain cabin with breathtaking lake views. Perfect for a peaceful getaway surrounded by nature.",
        location: {
            street: "101 Pine Ridge Trail",
            city: "Lake Tahoe",
            state: "CA" as const,
            zipcode: "96150",
        },
        beds: 3,
        baths: 2,
        squareFeet: 1200,
        rates: {
            nightly: 400,
            weekly: 2400,
            monthly: 8000,
        },
        amenities: [
            "WiFi",
            "Fireplace",
            "Kitchen",
            "Parking",
            "Pet Friendly",
            "Hot Tub",
            "Hiking Trails",
            "Lake Access",
        ],
        isFeatured: true,
    },
} as const;

export const mockFormData = new FormData();
mockFormData.append("name", basePropertyData.name);
mockFormData.append("type", basePropertyData.type);
mockFormData.append("description", basePropertyData.description!);
mockFormData.append("street", basePropertyData.location.street);
mockFormData.append("city", basePropertyData.location.city);
mockFormData.append("state", basePropertyData.location.state);
mockFormData.append("zipcode", basePropertyData.location.zipcode);
mockFormData.append("beds", basePropertyData.beds.toString());
mockFormData.append("baths", basePropertyData.baths.toString());
mockFormData.append("squareFeet", basePropertyData.squareFeet.toString());
basePropertyData.amenities.forEach(amenity => mockFormData.append("amenities", amenity));
mockFormData.append("nightly", basePropertyData.rates.nightly!.toString());
mockFormData.append("weekly", basePropertyData.rates.weekly!.toString());
mockFormData.append("monthly", basePropertyData.rates.monthly!.toString());
mockFormData.append("sellerName", basePropertyData.sellerInfo.name);
mockFormData.append("sellerEmail", basePropertyData.sellerInfo.email);
mockFormData.append("sellerPhone", basePropertyData.sellerInfo.phone);

// Mock Files for testing image uploads
export const createMockFile = (name: string, type: string = "image/jpeg"): File => {
    const blob = new Blob(["mock image content"], { type });
    return new File([blob], name, { type });
};

export const mockImageFiles = [
    createMockFile("image1.jpg"),
    createMockFile("image2.jpg"),
    createMockFile("image3.jpg"),
    createMockFile("image4.jpg"),
];

// Add mock image files to form data
mockImageFiles.forEach(file => mockFormData.append("imagesData", file));

export const propertiesListMock = [
    mockPropertyDocument,
    propertyVariations.house,
    propertyVariations.studio,
    propertyVariations.cabin,
];

export const emptyPropertyFormData = {
    name: "",
    type: "",
    description: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    beds: "",
    baths: "",
    squareFeet: "",
    amenities: [],
    nightly: "",
    weekly: "",
    monthly: "",
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    imagesData: [],
};

export const invalidPropertyFormData = {
    name: "Short", // Too short
    type: "InvalidType",
    description: "Too short", // Too short
    street: "1 St", // Too short
    city: "A", // Too short
    state: "ZZ", // Invalid state
    zipcode: "123", // Invalid zip
    beds: "0", // Too low
    baths: "0", // Too low
    squareFeet: "100", // Too low
    amenities: ["WiFi"], // Too few
    nightly: "50", // Too low
    weekly: "100", // Too low
    monthly: "500", // Too low
    sellerName: "A", // Too short
    sellerEmail: "invalid-email",
    sellerPhone: "",
    imagesData: [createMockFile("single.jpg")], // Too few
};

export const partialPropertyFormData = {
    name: "Valid Property Name for Testing",
    type: "Apartment",
    description: "This is a valid description that meets the minimum length requirement for testing purposes.",
    street: "123 Valid Street Address",
    city: "Valid City",
    state: "CA",
    zipcode: "90210",
    beds: "2",
    baths: "1",
    squareFeet: "800",
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Pet Friendly"],
    nightly: "200",
    sellerName: "Valid Seller Name",
    sellerEmail: "valid@example.com",
    sellerPhone: "555-0123",
    imagesData: mockImageFiles.slice(0, 3), // Minimum required
};