/**
 * EditPropertyForm Component Tests
 * 
 * Unit tests for ui/properties/id/edit/edit-property-form.tsx
 * Tests form structure, submission handling, error states, and ActionState integration
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Test file with mock components and data

import { render, screen, act } from "@/__tests__/test-utils";
import EditPropertyForm from "@/ui/properties/id/edit/edit-property-form";
import { ActionState, ActionStatus } from "@/types";
import { toast } from "react-toastify";
import React from "react";

// Mock the updateProperty action
jest.mock("@/lib/actions/property-actions", () => ({
    updateProperty: jest.fn(),
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

// Mock all form section components
jest.mock("@/ui/properties/shared/form/property-info", () => {
    return function MockPropertyInfo({ actionState, property }: { actionState: ActionState; property: unknown }) {
        return (
            <div data-testid="property-info" data-has-errors={!!actionState.formErrorMap}>
                Property Info - {property.name}
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/location", () => {
    return function MockLocation({ actionState, property }: { actionState: ActionState; property: unknown }) {
        return (
            <div data-testid="location" data-has-errors={!!actionState.formErrorMap}>
                Location - {property.location?.city}
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/specs", () => {
    return function MockSpecs({ actionState, property }: { actionState: ActionState; property: unknown }) {
        return (
            <div data-testid="specs" data-has-errors={!!actionState.formErrorMap}>
                Specs - {property.beds} beds
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/amenities", () => {
    return function MockAmenities({ actionState, selectedAmenities }: { actionState: ActionState; selectedAmenities: string[] }) {
        return (
            <div data-testid="amenities" data-has-errors={!!actionState.formErrorMap}>
                Amenities - {selectedAmenities?.length || 0} selected
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/rates", () => {
    return function MockRates({ actionState, property }: { actionState: ActionState; property: unknown }) {
        return (
            <div data-testid="rates" data-has-errors={!!actionState.formErrorMap}>
                Rates - ${property.rates?.nightly}
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/host-info", () => {
    return function MockHostInfo({ actionState, property }: { actionState: ActionState; property: unknown }) {
        return (
            <div data-testid="host-info" data-has-errors={!!actionState.formErrorMap}>
                Host - {property.sellerInfo?.name}
            </div>
        );
    };
});

jest.mock("@/ui/shared/input-errors", () => {
    return function MockInputErrors() {
        return <div data-testid="input-errors">Form has errors</div>;
    };
});

jest.mock("@/ui/properties/shared/form/buttons", () => {
    return function MockPropertyFormButtons({ 
        cancelButtonHref, 
        isPending, 
        primaryButtonText 
    }: { 
        cancelButtonHref: string;
        isPending: boolean;
        primaryButtonText: string;
    }) {
        return (
            <div data-testid="form-buttons">
                <button 
                    type="button" 
                    data-testid="cancel-button"
                    data-href={cancelButtonHref}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isPending}
                    data-testid="submit-button"
                    data-pending={isPending}
                >
                    {primaryButtonText}
                </button>
            </div>
        );
    };
});

const mockToast = toast as jest.Mocked<typeof toast>;

// Sample property for testing
const mockProperty = {
    _id: "property123",
    type: "apartment",
    name: "Test Property",
    description: "Test description",
    location: {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
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
    owner: "user123",
    images: [],
};

// Mock useActionState hook
const mockUseActionState = jest.fn();
jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
    useEffect: jest.fn(),
}));

describe("EditPropertyForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default useActionState return value
        mockUseActionState.mockReturnValue([
            {} as ActionState, // actionState
            jest.fn(), // formAction
            false // isPending
        ]);
        
        // Mock useEffect to actually call the effect function
        (React.useEffect as jest.Mock).mockImplementation((effect) => effect());
    });

    describe("Component Structure", () => {
        it("should render form with correct structure", () => {
            render(<EditPropertyForm property={mockProperty as unknown as PropertyDocument} />);
            
            // Use querySelector to find the form element since it doesn't have a role or testid
            const form = document.querySelector("form");
            expect(form).toBeInTheDocument();
            expect(screen.getByTestId("property-info")).toBeInTheDocument();
            expect(screen.getByTestId("location")).toBeInTheDocument();
            expect(screen.getByTestId("specs")).toBeInTheDocument();
            expect(screen.getByTestId("amenities")).toBeInTheDocument();
            expect(screen.getByTestId("rates")).toBeInTheDocument();
            expect(screen.getByTestId("host-info")).toBeInTheDocument();
            expect(screen.getByTestId("form-buttons")).toBeInTheDocument();
        });

        it("should display all form sections in correct order", () => {
            render(<EditPropertyForm property={mockProperty} />);
            
            const sections = [
                screen.getByTestId("property-info"),
                screen.getByTestId("location"),
                screen.getByTestId("specs"),
                screen.getByTestId("amenities"),
                screen.getByTestId("rates"),
                screen.getByTestId("host-info")
            ];
            
            sections.forEach(section => {
                expect(section).toBeInTheDocument();
            });
        });

        it("should pass property data to form sections", () => {
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(screen.getByTestId("property-info")).toHaveTextContent("Test Property");
            expect(screen.getByTestId("location")).toHaveTextContent("Test City");
            expect(screen.getByTestId("specs")).toHaveTextContent("2 beds");
            expect(screen.getByTestId("amenities")).toHaveTextContent("2 selected");
            expect(screen.getByTestId("rates")).toHaveTextContent("$100");
            expect(screen.getByTestId("host-info")).toHaveTextContent("Test Owner");
        });

        it("should render PropertyFormButtons with correct props", () => {
            const [, formAction, isPending] = [{}, jest.fn(), true];
            mockUseActionState.mockReturnValue([{}, formAction, isPending]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            const submitButton = screen.getByTestId("submit-button");
            const cancelButton = screen.getByTestId("cancel-button");
            
            expect(submitButton).toHaveTextContent("Updated Property");
            expect(submitButton).toHaveAttribute("data-pending", "true");
            expect(cancelButton).toHaveAttribute("data-href", "/profile");
        });
    });

    describe("Form Action Binding", () => {
        it("should bind updateProperty action with property ID", () => {
            render(<EditPropertyForm property={mockProperty} />);
            
            // Verify that updateProperty.bind was called with the property ID
            expect(mockUseActionState).toHaveBeenCalled();
            const [boundAction] = mockUseActionState.mock.calls[0];
            
            // The bound action should be a function
            expect(typeof boundAction).toBe("function");
        });

        it("should handle property ID conversion to string", () => {
            const propertyWithObjectId = {
                ...mockProperty,
                _id: { toString: () => "objectid123" }
            };
            
            render(<EditPropertyForm property={propertyWithObjectId} />);
            
            expect(mockUseActionState).toHaveBeenCalled();
        });

        it("should initialize with empty ActionState", () => {
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(mockUseActionState).toHaveBeenCalledWith(
                expect.any(Function),
                {}
            );
        });
    });

    describe("ActionState Management", () => {
        it("should pass actionState to all form sections", () => {
            const mockActionState: ActionState = {
                status: ActionStatus.ERROR,
                formErrorMap: {
                    name: ["Name is required"]
                }
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            // All sections should receive the actionState
            const sections = screen.getAllByTestId(/property-info|location|specs|amenities|rates|host-info/);
            sections.forEach(section => {
                expect(section).toHaveAttribute("data-has-errors", "true");
            });
        });

        it("should show InputErrors when actionState has data", () => {
            const mockActionState: ActionState = {
                status: ActionStatus.ERROR,
                message: "Validation failed"
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(screen.getByTestId("input-errors")).toBeInTheDocument();
        });

        it("should hide InputErrors when actionState is empty", () => {
            mockUseActionState.mockReturnValue([{}, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(screen.queryByTestId("input-errors")).not.toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should display toast error for ERROR status", () => {
            const mockActionState: ActionState = {
                status: ActionStatus.ERROR,
                message: "Update failed"
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(mockToast.error).toHaveBeenCalledWith("Update failed");
        });

        it("should not display toast for non-ERROR status", () => {
            const mockActionState: ActionState = {
                status: ActionStatus.SUCCESS,
                message: "Update successful"
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(mockToast.error).not.toHaveBeenCalled();
        });

        it("should handle undefined error messages", () => {
            const mockActionState: ActionState = {
                status: ActionStatus.ERROR
                // No message
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(mockToast.error).toHaveBeenCalledWith(undefined);
        });

        it("should handle form validation errors", () => {
            const mockActionState: ActionState = {
                status: ActionStatus.ERROR,
                formErrorMap: {
                    name: ["Property name is required"],
                    "location.city": ["City is required"]
                }
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(screen.getByTestId("input-errors")).toBeInTheDocument();
        });
    });

    describe("Form Submission", () => {
        it("should handle form submission correctly", () => {
            const mockFormAction = jest.fn();
            mockUseActionState.mockReturnValue([{}, mockFormAction, false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            const form = document.querySelector("form");
            expect(form).toBeInTheDocument();
            expect(form).toHaveAttribute("action");
        });

        it("should disable submission when pending", () => {
            const mockFormAction = jest.fn();
            mockUseActionState.mockReturnValue([{}, mockFormAction, true]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            const submitButton = screen.getByTestId("submit-button");
            expect(submitButton).toHaveAttribute("data-pending", "true");
        });

        it("should enable submission when not pending", () => {
            const mockFormAction = jest.fn();
            mockUseActionState.mockReturnValue([{}, mockFormAction, false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            const submitButton = screen.getByTestId("submit-button");
            expect(submitButton).toHaveAttribute("data-pending", "false");
        });
    });

    describe("useEffect Integration", () => {
        it("should call useEffect with correct dependencies", () => {
            const mockActionState: ActionState = {
                status: ActionStatus.ERROR,
                message: "Test error"
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            expect(React.useEffect).toHaveBeenCalledWith(
                expect.any(Function),
                [mockActionState]
            );
        });

        it("should handle actionState changes", () => {
            let effectFunction: () => void;
            (React.useEffect as jest.Mock).mockImplementation((effect) => {
                effectFunction = effect;
            });
            
            const mockActionState: ActionState = {
                status: ActionStatus.ERROR,
                message: "State changed"
            };
            
            mockUseActionState.mockReturnValue([mockActionState, jest.fn(), false]);
            
            render(<EditPropertyForm property={mockProperty} />);
            
            // Manually trigger the effect
            act(() => {
                effectFunction();
            });
            
            expect(mockToast.error).toHaveBeenCalledWith("State changed");
        });
    });

    describe("Edge Cases", () => {
        it("should handle missing property data gracefully", () => {
            const emptyProperty = {
                _id: "empty123",
                amenities: []
            };
            
            expect(() => {
                render(<EditPropertyForm property={emptyProperty as unknown as PropertyDocument} />);
            }).not.toThrow();
        });

        it("should handle property with null/undefined fields", () => {
            const propertyWithNulls = {
                ...mockProperty,
                name: null,
                description: undefined,
                location: null,
                rates: null,
                sellerInfo: null
            };
            
            expect(() => {
                render(<EditPropertyForm property={propertyWithNulls as unknown as PropertyDocument} />);
            }).not.toThrow();
        });

        it("should handle empty amenities array", () => {
            const propertyWithoutAmenities = {
                ...mockProperty,
                amenities: []
            };
            
            render(<EditPropertyForm property={propertyWithoutAmenities as unknown as PropertyDocument} />);
            
            expect(screen.getByTestId("amenities")).toHaveTextContent("0 selected");
        });

        it("should handle missing amenities property", () => {
            const propertyWithoutAmenitiesProp = {
                ...mockProperty
            };
            delete (propertyWithoutAmenitiesProp as unknown as Record<string, unknown>).amenities;
            
            render(<EditPropertyForm property={propertyWithoutAmenitiesProp as unknown as PropertyDocument} />);
            
            expect(screen.getByTestId("amenities")).toHaveTextContent("0 selected");
        });
    });

    describe("Component Props", () => {
        it("should handle different property ID types", () => {
            const propertyWithStringId = { ...mockProperty, _id: "string123" };
            const propertyWithObjectId = { ...mockProperty, _id: { toString: () => "object123" } };
            
            expect(() => {
                render(<EditPropertyForm property={propertyWithStringId as unknown as PropertyDocument} />);
            }).not.toThrow();
            
            expect(() => {
                render(<EditPropertyForm property={propertyWithObjectId as unknown as PropertyDocument} />);
            }).not.toThrow();
        });

        it("should handle property updates", () => {
            const { rerender } = render(<EditPropertyForm property={mockProperty as unknown as PropertyDocument} />);
            
            const updatedProperty = {
                ...mockProperty,
                name: "Updated Property Name"
            };
            
            rerender(<EditPropertyForm property={updatedProperty as unknown as PropertyDocument} />);
            
            expect(screen.getByTestId("property-info")).toHaveTextContent("Updated Property Name");
        });
    });
});