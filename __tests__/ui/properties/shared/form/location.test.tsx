/**
 * Location Component Tests
 *
 * Tests for ui/properties/shared/form/location.tsx
 * Covers state management, AddressSearch integration, form fields, and validation
 */

import { render, screen, fireEvent } from "@/__tests__/test-utils";
import Location from "@/ui/properties/shared/form/location";
import { ActionState, ActionStatus } from "@/types";
import { PropertyDocument } from "@/models";

// Mock FormErrors component
jest.mock("@/ui/shared/form-errors", () => {
    return function MockFormErrors({
        errors,
        id,
    }: {
        errors: string[];
        id: string;
    }) {
        return (
            <div data-testid="form-errors" data-id={id}>
                {errors.map((error, index) => (
                    <span key={index} data-testid="error-message">
                        {error}
                    </span>
                ))}
            </div>
        );
    };
});

// Mock AddressSearch component
jest.mock("@/ui/properties/shared/form/address-search", () => {
    return function MockAddressSearch({
        actionState,
        street,
        setCity,
        setState,
        setZipcode,
    }: {
        actionState: ActionState;
        street?: string;
        setCity: (city: string) => void;
        setState: (state: string) => void;
        setZipcode: (zipcode: string) => void;
    }) {
        return (
            <div data-testid="address-search">
                <input
                    data-testid="street-input"
                    defaultValue={street || ""}
                    onChange={(e) => {
                        // Simulate address selection that updates other fields
                        if (e.target.value === "123 Main St") {
                            setCity("Miami");
                            setState("FL");
                            setZipcode("33101");
                        }
                    }}
                />
                <span data-testid="action-state-data">
                    {JSON.stringify(actionState)}
                </span>
            </div>
        );
    };
});

describe("Location Component", () => {
    const defaultActionState: ActionState = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Component Structure", () => {
        it("should render with proper heading", () => {
            render(<Location actionState={defaultActionState} />);

            const heading = screen.getByText("Location");
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe("H2");
            expect(heading).toHaveClass("block", "text-gray-700", "font-bold", "mb-1");
        });

        it("should render AddressSearch component", () => {
            render(<Location actionState={defaultActionState} />);

            const addressSearch = screen.getByTestId("address-search");
            expect(addressSearch).toBeInTheDocument();
        });

        it("should render all three location input fields", () => {
            render(<Location actionState={defaultActionState} />);

            expect(screen.getByLabelText("City")).toBeInTheDocument();
            expect(screen.getByLabelText("State")).toBeInTheDocument();
            expect(screen.getByLabelText("Zip Code")).toBeInTheDocument();
        });

        it("should have responsive layout structure", () => {
            const { container } = render(
                <Location actionState={defaultActionState} />,
            );

            const flexContainer = container.querySelector(".flex.flex-wrap");
            expect(flexContainer).toBeInTheDocument();
            expect(flexContainer).toHaveClass("mb-2", "sm:mb-0");

            // Check responsive field containers
            const cityContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/3.mb-2.sm\\:mb-0.sm\\:pr-2",
            );
            const stateContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/3.mb-2.sm\\:mb-0.sm\\:px-2",
            );
            const zipcodeContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/3.sm\\:pl-2",
            );

            expect(cityContainer).toBeInTheDocument();
            expect(stateContainer).toBeInTheDocument();
            expect(zipcodeContainer).toBeInTheDocument();
        });
    });

    describe("State Management", () => {
        it("should initialize with empty state values", () => {
            render(<Location actionState={defaultActionState} />);

            expect(screen.getByLabelText("City")).toHaveValue("");
            expect(screen.getByLabelText("State")).toHaveValue("");
            expect(screen.getByLabelText("Zip Code")).toHaveValue("");
        });

        it("should initialize state from property on mount", () => {
            const property = {
                location: {
                    street: "123 Main St",
                    city: "Miami",
                    state: "Florida",
                    zipcode: "33101",
                },
            } as unknown as PropertyDocument;

            render(
                <Location actionState={defaultActionState} property={property} />,
            );

            expect(screen.getByDisplayValue("Miami")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Florida")).toBeInTheDocument();
            expect(screen.getByDisplayValue("33101")).toBeInTheDocument();
        });

        it("should update city state when input changes", () => {
            render(<Location actionState={defaultActionState} />);

            const cityInput = screen.getByLabelText("City");
            fireEvent.change(cityInput, { target: { value: "New York" } });

            expect(cityInput).toHaveValue("New York");
        });

        it("should update state state when input changes", () => {
            render(<Location actionState={defaultActionState} />);

            const stateInput = screen.getByLabelText("State");
            fireEvent.change(stateInput, { target: { value: "NY" } });

            expect(stateInput).toHaveValue("NY");
        });

        it("should update zipcode state when input changes", () => {
            render(<Location actionState={defaultActionState} />);

            const zipcodeInput = screen.getByLabelText("Zip Code");
            fireEvent.change(zipcodeInput, { target: { value: "10001" } });

            expect(zipcodeInput).toHaveValue("10001");
        });

        it("should handle state updates from AddressSearch callbacks", () => {
            render(<Location actionState={defaultActionState} />);

            const streetInput = screen.getByTestId("street-input");
            fireEvent.change(streetInput, { target: { value: "123 Main St" } });

            // The mock AddressSearch should trigger callbacks
            expect(screen.getByDisplayValue("Miami")).toBeInTheDocument();
            expect(screen.getByDisplayValue("FL")).toBeInTheDocument();
            expect(screen.getByDisplayValue("33101")).toBeInTheDocument();
        });
    });

    describe("AddressSearch Integration", () => {
        it("should pass actionState to AddressSearch", () => {
            const actionState: ActionState = {
                status: ActionStatus.ERROR,
                message: "Location error",
            };

            render(<Location actionState={actionState} />);

            const actionStateData = screen.getByTestId("action-state-data");
            expect(actionStateData).toHaveTextContent(
                JSON.stringify(actionState),
            );
        });

        it("should pass street from property to AddressSearch", () => {
            const property = {
                location: {
                    street: "456 Oak Avenue",
                    city: "Dallas",
                    state: "Texas",
                    zipcode: "75201",
                },
            } as unknown as PropertyDocument;

            render(
                <Location actionState={defaultActionState} property={property} />,
            );

            const streetInput = screen.getByTestId("street-input");
            expect(streetInput).toHaveValue("456 Oak Avenue");
        });

        it("should pass callback functions to AddressSearch", () => {
            render(<Location actionState={defaultActionState} />);

            // The AddressSearch component should be able to call the callbacks
            // This is tested by the mock implementation triggering the callbacks
            const streetInput = screen.getByTestId("street-input");
            expect(streetInput).toBeInTheDocument();

            // Test that callbacks work by triggering them
            fireEvent.change(streetInput, { target: { value: "123 Main St" } });

            expect(screen.getByDisplayValue("Miami")).toBeInTheDocument();
            expect(screen.getByDisplayValue("FL")).toBeInTheDocument();
            expect(screen.getByDisplayValue("33101")).toBeInTheDocument();
        });

        it("should handle AddressSearch without property", () => {
            render(<Location actionState={defaultActionState} />);

            const streetInput = screen.getByTestId("street-input");
            expect(streetInput).toHaveValue("");
        });
    });

    describe("City Input Field", () => {
        it("should render city input with correct attributes", () => {
            render(<Location actionState={defaultActionState} />);

            const cityInput = screen.getByLabelText("City");
            expect(cityInput).toBeInTheDocument();
            expect(cityInput).toHaveAttribute("type", "text");
            expect(cityInput).toHaveAttribute("id", "city");
            expect(cityInput).toHaveAttribute("name", "location.city");
            expect(cityInput).toHaveAttribute("aria-describedby", "city-error");
        });

        it("should prioritize actionState.formData over local state", () => {
            const formData = new FormData();
            formData.set("location.city", "FormData City");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Location actionState={actionState} />);

            const cityInput = screen.getByDisplayValue("FormData City");
            expect(cityInput).toBeInTheDocument();
        });

        it("should use local state when no formData", () => {
            const property = {
                location: {
                    street: "123 Main St",
                    city: "Property City",
                    state: "FL",
                    zipcode: "33101",
                },
            } as unknown as PropertyDocument;

            render(
                <Location actionState={defaultActionState} property={property} />,
            );

            const cityInput = screen.getByDisplayValue("Property City");
            expect(cityInput).toBeInTheDocument();
        });

        it("should have proper styling classes", () => {
            render(<Location actionState={defaultActionState} />);

            const cityInput = screen.getByLabelText("City");
            expect(cityInput).toHaveClass(
                "w-full",
                "rounded-md",
                "border",
                "border-gray-300",
                "py-2",
                "px-3",
                "text-sm",
                "placeholder:text-gray-500",
                "bg-white",
            );
        });
    });

    describe("State Input Field", () => {
        it("should render state input with correct attributes", () => {
            render(<Location actionState={defaultActionState} />);

            const stateInput = screen.getByLabelText("State");
            expect(stateInput).toBeInTheDocument();
            expect(stateInput).toHaveAttribute("type", "text");
            expect(stateInput).toHaveAttribute("id", "state");
            expect(stateInput).toHaveAttribute("name", "location.state");
            expect(stateInput).toHaveAttribute("aria-describedby", "state-error");
        });

        it("should prioritize actionState.formData over local state", () => {
            const formData = new FormData();
            formData.set("location.state", "FormData State");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Location actionState={actionState} />);

            const stateInput = screen.getByDisplayValue("FormData State");
            expect(stateInput).toBeInTheDocument();
        });

        it("should use local state when no formData", () => {
            const property = {
                location: {
                    street: "123 Main St",
                    city: "Miami",
                    state: "Property State",
                    zipcode: "33101",
                },
            } as unknown as PropertyDocument;

            render(
                <Location actionState={defaultActionState} property={property} />,
            );

            const stateInput = screen.getByDisplayValue("Property State");
            expect(stateInput).toBeInTheDocument();
        });
    });

    describe("Zipcode Input Field", () => {
        it("should render zipcode input with correct attributes", () => {
            render(<Location actionState={defaultActionState} />);

            const zipcodeInput = screen.getByLabelText("Zip Code");
            expect(zipcodeInput).toBeInTheDocument();
            expect(zipcodeInput).toHaveAttribute("type", "text");
            expect(zipcodeInput).toHaveAttribute("id", "zipcode");
            expect(zipcodeInput).toHaveAttribute("name", "location.zipcode");
            expect(zipcodeInput).toHaveAttribute("aria-describedby", "zipcode-error");
        });

        it("should prioritize actionState.formData over local state", () => {
            const formData = new FormData();
            formData.set("location.zipcode", "FormData Zip");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Location actionState={actionState} />);

            const zipcodeInput = screen.getByDisplayValue("FormData Zip");
            expect(zipcodeInput).toBeInTheDocument();
        });

        it("should use local state when no formData", () => {
            const property = {
                location: {
                    street: "123 Main St",
                    city: "Miami",
                    state: "FL",
                    zipcode: "Property Zip",
                },
            } as unknown as PropertyDocument;

            render(
                <Location actionState={defaultActionState} property={property} />,
            );

            const zipcodeInput = screen.getByDisplayValue("Property Zip");
            expect(zipcodeInput).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should render FormErrors for city when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    location: {
                        city: ["City is required", "City must be valid"],
                    },
                },
            };

            render(<Location actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "city");

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0]).toHaveTextContent("City is required");
            expect(errorMessages[1]).toHaveTextContent("City must be valid");
        });

        it("should render FormErrors for state when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    location: {
                        state: ["State is required"],
                    },
                },
            };

            render(<Location actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "state");

            const errorMessage = screen.getByTestId("error-message");
            expect(errorMessage).toHaveTextContent("State is required");
        });

        it("should render FormErrors for zipcode when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    location: {
                        zipcode: ["Invalid zip code format"],
                    },
                },
            };

            render(<Location actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "zipcode");

            const errorMessage = screen.getByTestId("error-message");
            expect(errorMessage).toHaveTextContent("Invalid zip code format");
        });

        it("should not render FormErrors when no location errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    name: ["Name error"], // Different field
                },
            };

            render(<Location actionState={actionState} />);

            const formErrors = screen.queryByTestId("form-errors");
            expect(formErrors).not.toBeInTheDocument();
        });

        it("should handle multiple location field errors simultaneously", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    location: {
                        city: ["City is required"],
                        state: ["State is required"],
                        zipcode: ["Invalid zip code"],
                    },
                },
            };

            render(<Location actionState={actionState} />);

            const formErrors = screen.getAllByTestId("form-errors");
            expect(formErrors).toHaveLength(3);

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(3);
        });
    });

    describe("Form Data Integration", () => {
        it("should handle complex actionState with formData and property", () => {
            const formData = new FormData();
            formData.set("location.city", "FormData City");
            formData.set("location.state", "FormData State");

            const actionState: ActionState = {
                formData: formData,
                formErrorMap: {
                    location: {
                        zipcode: ["Zipcode error"],
                    },
                },
            };

            const property = {
                location: {
                    street: "Property Street",
                    city: "Property City",
                    state: "Property State",
                    zipcode: "Property Zip",
                },
            } as unknown as PropertyDocument;

            render(<Location actionState={actionState} property={property} />);

            // FormData should take precedence for city and state
            expect(screen.getByDisplayValue("FormData City")).toBeInTheDocument();
            expect(screen.getByDisplayValue("FormData State")).toBeInTheDocument();

            // Property should provide value for zipcode (no FormData)
            expect(screen.getByDisplayValue("Property Zip")).toBeInTheDocument();

            // Error should be displayed
            const errorMessage = screen.getByTestId("error-message");
            expect(errorMessage).toHaveTextContent("Zipcode error");
        });

        it("should handle empty formData gracefully", () => {
            const formData = new FormData();
            
            const actionState: ActionState = {
                formData: formData,
            };

            render(<Location actionState={actionState} />);

            expect(screen.getByLabelText("City")).toHaveValue("");
            expect(screen.getByLabelText("State")).toHaveValue("");
            expect(screen.getByLabelText("Zip Code")).toHaveValue("");
        });
    });

    describe("useEffect Behavior", () => {
        it("should populate state from property on initial render", () => {
            const property = {
                location: {
                    street: "123 Test St",
                    city: "Test City",
                    state: "Test State",
                    zipcode: "12345",
                },
            } as unknown as PropertyDocument;

            render(
                <Location actionState={defaultActionState} property={property} />,
            );

            expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Test State")).toBeInTheDocument();
            expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
        });

        it("should not populate state when property is undefined", () => {
            render(<Location actionState={defaultActionState} />);

            expect(screen.getByLabelText("City")).toHaveValue("");
            expect(screen.getByLabelText("State")).toHaveValue("");
            expect(screen.getByLabelText("Zip Code")).toHaveValue("");
        });

        it("should only run useEffect on mount (empty dependency array)", () => {
            const property = {
                location: {
                    street: "Initial Street",
                    city: "Initial City",
                    state: "Initial State",
                    zipcode: "12345",
                },
            } as unknown as PropertyDocument;

            const { rerender } = render(
                <Location actionState={defaultActionState} property={property} />,
            );

            expect(screen.getByDisplayValue("Initial City")).toBeInTheDocument();

            // Update property and rerender
            const updatedProperty = {
                location: {
                    street: "Updated Street",
                    city: "Updated City",
                    state: "Updated State",
                    zipcode: "54321",
                },
            } as unknown as PropertyDocument;

            rerender(
                <Location
                    actionState={defaultActionState}
                    property={updatedProperty}
                />,
            );

            // Should still show initial values because useEffect only runs once
            expect(screen.getByDisplayValue("Initial City")).toBeInTheDocument();
        });
    });

    describe("Component Props Integration", () => {
        it("should work with only actionState prop", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    location: {
                        city: ["City error"],
                    },
                },
            };

            render(<Location actionState={actionState} />);

            expect(screen.getByLabelText("City")).toHaveValue("");
            expect(screen.getByTestId("error-message")).toHaveTextContent(
                "City error",
            );
        });

        it("should work with both actionState and property props", () => {
            const actionState: ActionState = {
                status: ActionStatus.ERROR,
            };

            const property = {
                location: {
                    street: "Combined Street",
                    city: "Combined City",
                    state: "Combined State",
                    zipcode: "11111",
                },
            } as unknown as PropertyDocument;

            render(<Location actionState={actionState} property={property} />);

            expect(screen.getByDisplayValue("Combined City")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Combined State")).toBeInTheDocument();
            expect(screen.getByDisplayValue("11111")).toBeInTheDocument();

            // Check AddressSearch receives both props
            const streetInput = screen.getByTestId("street-input");
            expect(streetInput).toHaveValue("Combined Street");
        });
    });
});