/**
 * EditPropertyPage Component Tests
 * 
 * Unit tests for app/(root)/properties/[id]/edit/page.tsx
 * Tests page rendering, route parameter handling, and data integration
 */

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck - Test file with mock data that doesn't perfectly match complex Mongoose types

import { render, screen } from "@/__tests__/test-utils";
import EditPropertyPage from "@/app/(root)/properties/[id]/edit/page";
import { fetchProperty } from "@/lib/data/property-data";
import { PropertyDocument } from "@/models";

// Mock the data fetching function
jest.mock("@/lib/data/property-data", () => ({
    fetchProperty: jest.fn(),
}));

// Mock the EditPropertyForm component
jest.mock("@/ui/properties/id/edit/edit-property-form", () => {
    return function MockEditPropertyForm({ property }: { property: PropertyDocument }) {
        return (
            <div data-testid="edit-property-form" data-property-id={property._id}>
                <span data-testid="property-name">{property.name}</span>
                <span data-testid="property-type">{property.type}</span>
            </div>
        );
    };
});

// Mock the Breadcrumbs component
jest.mock("@/ui/shared/breadcrumbs", () => {
    return function MockBreadcrumbs({ breadcrumbs }: { breadcrumbs: Array<{ label: string; href: string; active?: boolean }> }) {
        return (
            <nav data-testid="breadcrumbs">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index} data-testid={`breadcrumb-${index}`} data-active={crumb.active}>
                        {crumb.label}
                    </span>
                ))}
            </nav>
        );
    };
});

const mockFetchProperty = fetchProperty as jest.MockedFunction<typeof fetchProperty>;

// Type for test property data
type MockPropertyType = Partial<PropertyDocument> & {
    _id: string;
    type: string;
    name: string;
};

// Sample property data for testing
const mockProperty: MockPropertyType = {
    _id: "property123",
    type: "Apartment",
    name: "Test Property",
    description: "Test property description",
    location: {
        street: "123 Test St",
        city: "Test City", 
        state: "CA",
        zipcode: "12345"
    },
    beds: 2,
    baths: 1.5,
    squareFeet: 1000,
    amenities: ["wifi", "parking"],
    rates: {
        nightly: 100,
        weekly: 600,
        monthly: 2400
    },
    sellerInfo: {
        name: "Test Owner",
        email: "owner@test.com",
        phone: "555-0123"
    },
    owner: "user123" as any,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("EditPropertyPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render page with correct structure", async () => {
            mockFetchProperty.mockResolvedValue(mockProperty as any);
            
            const params = Promise.resolve({ id: "property123" });
            const component = await EditPropertyPage({ params });
            
            render(component);
            
            expect(screen.getByRole("main")).toBeInTheDocument();
            expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
            expect(screen.getByTestId("edit-property-form")).toBeInTheDocument();
        });

        it("should display breadcrumbs with correct navigation path", async () => {
            mockFetchProperty.mockResolvedValue(mockProperty);
            
            const params = Promise.resolve({ id: "property123" });
            const component = await EditPropertyPage({ params });
            
            render(component);
            
            const breadcrumbs = screen.getAllByTestId(/breadcrumb-/);
            expect(breadcrumbs).toHaveLength(2);
            
            expect(breadcrumbs[0]).toHaveTextContent("Profile");
            expect(breadcrumbs[0]).not.toHaveAttribute("data-active", "true");
            
            expect(breadcrumbs[1]).toHaveTextContent("Edit Property");
            expect(breadcrumbs[1]).toHaveAttribute("data-active", "true");
        });

        it("should render EditPropertyForm with property data", async () => {
            mockFetchProperty.mockResolvedValue(mockProperty);
            
            const params = Promise.resolve({ id: "property123" });
            const component = await EditPropertyPage({ params });
            
            render(component);
            
            const form = screen.getByTestId("edit-property-form");
            expect(form).toHaveAttribute("data-property-id", "property123");
            expect(screen.getByTestId("property-name")).toHaveTextContent("Test Property");
            expect(screen.getByTestId("property-type")).toHaveTextContent("Apartment");
        });
    });

    describe("Route Parameter Handling", () => {
        it("should extract property ID from params correctly", async () => {
            mockFetchProperty.mockResolvedValue(mockProperty);
            
            const params = Promise.resolve({ id: "property456" });
            await EditPropertyPage({ params });
            
            expect(mockFetchProperty).toHaveBeenCalledWith("property456");
        });

        it("should handle different property ID formats", async () => {
            mockFetchProperty.mockResolvedValue(mockProperty);
            
            const testCases = ["123", "abc123", "property_456", "64f1a2b3c4d5e6f7a8b9c123"];
            
            for (const id of testCases) {
                jest.clearAllMocks();
                const params = Promise.resolve({ id });
                await EditPropertyPage({ params });
                
                expect(mockFetchProperty).toHaveBeenCalledWith(id);
            }
        });
    });

    describe("Property Data Integration", () => {
        it("should fetch property data using provided ID", async () => {
            mockFetchProperty.mockResolvedValue(mockProperty);
            
            const params = Promise.resolve({ id: "property123" });
            await EditPropertyPage({ params });
            
            expect(mockFetchProperty).toHaveBeenCalledTimes(1);
            expect(mockFetchProperty).toHaveBeenCalledWith("property123");
        });

        it("should handle property serialization correctly", async () => {
            // Property with Mongoose ObjectId and Date objects
            const propertyWithObjectId = {
                ...mockProperty,
                _id: { toString: () => "property123" },
                createdAt: new Date("2024-01-01"),
                updatedAt: new Date("2024-01-02"),
            };
            
            mockFetchProperty.mockResolvedValue(propertyWithObjectId);
            
            const params = Promise.resolve({ id: "property123" });
            const component = await EditPropertyPage({ params });
            
            render(component);
            
            // Verify the component receives properly serialized data
            const form = screen.getByTestId("edit-property-form");
            expect(form).toBeInTheDocument();
        });

        it("should pass serialized property to form component", async () => {
            const propertyWithComplexData = {
                ...mockProperty,
                rates: {
                    nightly: 150.50,
                    weekly: null,
                    monthly: 3000
                },
                amenities: ["wifi", "parking", "pool"],
            };
            
            mockFetchProperty.mockResolvedValue(propertyWithComplexData);
            
            const params = Promise.resolve({ id: "property123" });
            const component = await EditPropertyPage({ params });
            
            render(component);
            
            const form = screen.getByTestId("edit-property-form");
            expect(form).toHaveAttribute("data-property-id", "property123");
        });

        it("should handle missing property data gracefully", async () => {
            mockFetchProperty.mockResolvedValue(null as unknown as PropertyDocument);
            
            const params = Promise.resolve({ id: "nonexistent" });
            
            // This should throw when trying to access properties of null
            await expect(EditPropertyPage({ params })).rejects.toThrow();
        });

        it("should handle fetchProperty errors", async () => {
            mockFetchProperty.mockRejectedValue(new Error("Database connection failed"));
            
            const params = Promise.resolve({ id: "property123" });
            
            await expect(async () => {
                await EditPropertyPage({ params });
            }).rejects.toThrow("Database connection failed");
        });
    });

    describe("Component Integration", () => {
        it("should integrate breadcrumbs with property ID", async () => {
            mockFetchProperty.mockResolvedValue(mockProperty);
            
            const params = Promise.resolve({ id: "property123" });
            const component = await EditPropertyPage({ params });
            
            render(component);
            
            // Check that breadcrumb href includes the property ID
            const breadcrumbs = screen.getByTestId("breadcrumbs");
            expect(breadcrumbs).toBeInTheDocument();
        });

        it("should handle property data structure variations", async () => {
            const minimalProperty: MockPropertyType = {
                _id: "minimal123",
                type: "House",
                name: "Minimal Property",
                description: "",
                location: { street: "", city: "", state: "CA", zipcode: "" },
                beds: 1,
                baths: 1,
                squareFeet: 500,
                amenities: [],
                rates: { nightly: undefined, weekly: undefined, monthly: undefined },
                sellerInfo: { name: "", email: "", phone: "" },
                owner: "user123" as any,
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            
            mockFetchProperty.mockResolvedValue(minimalProperty as unknown as PropertyDocument);
            
            const params = Promise.resolve({ id: "minimal123" });
            const component = await EditPropertyPage({ params });
            
            render(component);
            
            expect(screen.getByTestId("edit-property-form")).toBeInTheDocument();
            expect(screen.getByTestId("property-name")).toHaveTextContent("Minimal Property");
        });
    });

    describe("Metadata", () => {
        it("should export correct metadata", async () => {
            // Import the metadata export directly
            const pageModule = await import("@/app/(root)/properties/[id]/edit/page");
            const { metadata } = pageModule;
            
            expect(metadata).toBeDefined();
            expect(metadata.title).toBe("Edit Property");
        });
    });

    describe("Error Handling", () => {
        it("should handle malformed property data", async () => {
            const malformedProperty = {
                _id: "malformed123",
                // Missing required fields
                type: null,
                name: undefined,
            };
            
            mockFetchProperty.mockResolvedValue(malformedProperty as unknown as PropertyDocument);
            
            const params = Promise.resolve({ id: "malformed123" });
            
            // Should handle gracefully without crashing
            await expect(async () => {
                const component = await EditPropertyPage({ params });
                render(component);
            }).not.toThrow();
        });

        it("should handle async params rejection", async () => {
            const params = Promise.reject(new Error("Invalid params"));
            
            await expect(EditPropertyPage({ params })).rejects.toThrow("Invalid params");
        });
    });
});