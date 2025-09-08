/**
 * PropertyInfo Component Tests
 *
 * Tests for ui/properties/shared/form/property-info.tsx
 * Covers component structure, form fields, validation, and integration
 */

import { render, screen } from "@/__tests__/test-utils";
import PropertyInfo from "@/ui/properties/shared/form/property-info";
import { ActionState, ActionStatus } from "@/types";
import { PropertyDocument } from "@/models";

// Mock the global context
const mockUseStaticInputs = jest.fn();
jest.mock("@/context/global-context", () => ({
    useStaticInputs: () => mockUseStaticInputs(),
}));

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

// Mock DwellioSelect component
jest.mock("@/ui/shared/select", () => {
    return function MockDwellioSelect({
        options,
        placeholder,
        name,
        id,
        defaultValue,
        ...props
    }: any) {
        return (
            <select
                data-testid="dwellio-select"
                name={name}
                id={id}
                data-placeholder={placeholder}
                data-default-value={defaultValue ? JSON.stringify(defaultValue) : "undefined"}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options?.map((option: any, index: number) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    };
});

describe("PropertyInfo Component", () => {
    const mockPropertyTypes = [
        { label: "Apartment", value: "apartment" },
        { label: "House", value: "house" },
        { label: "Condo", value: "condo" },
    ];

    const defaultActionState: ActionState = {};

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseStaticInputs.mockReturnValue({
            propertyTypes: mockPropertyTypes,
        });
    });

    describe("Component Structure", () => {
        it("should render with proper heading", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const heading = screen.getByText("Property Information");
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe("H2");
        });

        it("should render responsive layout container", () => {
            const { container } = render(
                <PropertyInfo actionState={defaultActionState} />,
            );

            const mainContainer = container.firstChild as HTMLElement;
            expect(mainContainer).toHaveClass("mb-4");

            const flexContainer = container.querySelector(".flex.flex-wrap");
            expect(flexContainer).toBeInTheDocument();
            expect(flexContainer).toHaveClass("mb-2");
        });

        it("should have accessible form structure", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            // Check that all form fields have proper labels
            expect(screen.getByLabelText("Name")).toBeInTheDocument();
            expect(screen.getByTestId("dwellio-select")).toBeInTheDocument();
            expect(screen.getByLabelText("Description")).toBeInTheDocument();
        });

        it("should apply responsive classes to field containers", () => {
            const { container } = render(
                <PropertyInfo actionState={defaultActionState} />,
            );

            const nameContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/2.mb-2.sm\\:mb-0.sm\\:pr-2",
            );
            const typeContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/2.sm\\:pl-2",
            );

            expect(nameContainer).toBeInTheDocument();
            expect(typeContainer).toBeInTheDocument();
        });
    });

    describe("Property Name Field", () => {
        it("should render name input with correct attributes", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const nameInput = screen.getByLabelText("Name");
            expect(nameInput).toBeInTheDocument();
            expect(nameInput).toHaveAttribute("type", "text");
            expect(nameInput).toHaveAttribute("id", "name");
            expect(nameInput).toHaveAttribute("name", "name");
            expect(nameInput).toHaveAttribute(
                "placeholder",
                "e.g., Beautiful Apartment in Miami",
            );
            expect(nameInput).toHaveAttribute("aria-describedby", "name-error");
        });

        it("should populate default value from actionState.formData", () => {
            const formData = new FormData();
            formData.set("name", "Test Property Name");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<PropertyInfo actionState={actionState} />);

            const nameInput = screen.getByDisplayValue("Test Property Name");
            expect(nameInput).toBeInTheDocument();
        });

        it("should populate default value from existing property", () => {
            const property = {
                name: "Existing Property Name",
                type: "apartment",
                description: "Test description",
            } as unknown as PropertyDocument;

            render(
                <PropertyInfo
                    actionState={defaultActionState}
                    property={property}
                />,
            );

            const nameInput = screen.getByDisplayValue("Existing Property Name");
            expect(nameInput).toBeInTheDocument();
        });

        it("should prioritize actionState.formData over property data", () => {
            const formData = new FormData();
            formData.set("name", "FormData Property Name");

            const actionState: ActionState = {
                formData: formData,
            };

            const property = {
                name: "Property Name",
                type: "apartment",
                description: "Test description",
            } as unknown as PropertyDocument;

            render(
                <PropertyInfo actionState={actionState} property={property} />,
            );

            const nameInput = screen.getByDisplayValue("FormData Property Name");
            expect(nameInput).toBeInTheDocument();
        });

        it("should have proper styling classes", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const nameInput = screen.getByLabelText("Name");
            expect(nameInput).toHaveClass(
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

    describe("Property Type Field", () => {
        it("should render property type select with correct props", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const typeSelect = screen.getByTestId("dwellio-select");
            expect(typeSelect).toBeInTheDocument();
            expect(typeSelect).toHaveAttribute("name", "type");
            expect(typeSelect).toHaveAttribute("id", "type");
            expect(typeSelect).toHaveAttribute(
                "aria-describedby",
                "type-error",
            );
            expect(typeSelect).toHaveAttribute("aria-labelledby", "type");
            expect(typeSelect).toHaveAttribute(
                "data-placeholder",
                "Select a property type",
            );
        });

        it("should pass property types from global context", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const typeSelect = screen.getByTestId("dwellio-select");
            
            // Check that options are rendered
            expect(screen.getByText("Apartment")).toBeInTheDocument();
            expect(screen.getByText("House")).toBeInTheDocument();
            expect(screen.getByText("Condo")).toBeInTheDocument();
        });

        it("should set default value from existing property", () => {
            const property = {
                name: "Test Property",
                type: "apartment",
                description: "Test description",
            } as unknown as PropertyDocument;

            render(
                <PropertyInfo
                    actionState={defaultActionState}
                    property={property}
                />,
            );

            const typeSelect = screen.getByTestId("dwellio-select");
            expect(typeSelect).toHaveAttribute(
                "data-default-value",
                JSON.stringify({ label: "apartment", value: "apartment" }),
            );
        });

        it("should handle missing property gracefully", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const typeSelect = screen.getByTestId("dwellio-select");
            expect(typeSelect).toHaveAttribute("data-default-value", "undefined");
        });

        it("should use staticInputs from context", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            expect(mockUseStaticInputs).toHaveBeenCalled();
        });
    });

    describe("Description Field", () => {
        it("should render description textarea with correct attributes", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const descriptionTextarea = screen.getByLabelText("Description");
            expect(descriptionTextarea).toBeInTheDocument();
            expect(descriptionTextarea.tagName).toBe("TEXTAREA");
            expect(descriptionTextarea).toHaveAttribute("name", "description");
            expect(descriptionTextarea).toHaveAttribute("id", "description");
            expect(descriptionTextarea).toHaveAttribute(
                "placeholder",
                "Add a description of your property",
            );
            expect(descriptionTextarea).toHaveAttribute("rows", "4");
            expect(descriptionTextarea).toHaveAttribute(
                "aria-describedby",
                "description-error",
            );
        });

        it("should populate default value from actionState.formData", () => {
            const formData = new FormData();
            formData.set("description", "Test Description from FormData");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<PropertyInfo actionState={actionState} />);

            const descriptionTextarea = screen.getByDisplayValue(
                "Test Description from FormData",
            );
            expect(descriptionTextarea).toBeInTheDocument();
        });

        it("should populate default value from existing property", () => {
            const property = {
                name: "Test Property",
                type: "apartment",
                description: "Existing Property Description",
            } as unknown as PropertyDocument;

            render(
                <PropertyInfo
                    actionState={defaultActionState}
                    property={property}
                />,
            );

            const descriptionTextarea = screen.getByDisplayValue(
                "Existing Property Description",
            );
            expect(descriptionTextarea).toBeInTheDocument();
        });

        it("should have proper styling classes", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const descriptionTextarea = screen.getByLabelText("Description");
            expect(descriptionTextarea).toHaveClass(
                "block",
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

    describe("Error Handling", () => {
        it("should render FormErrors for name field when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    name: ["Name is required", "Name must be at least 3 characters"],
                },
            };

            render(<PropertyInfo actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "name-error");

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0]).toHaveTextContent("Name is required");
            expect(errorMessages[1]).toHaveTextContent(
                "Name must be at least 3 characters",
            );
        });

        it("should render FormErrors for type field when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    type: ["Property type is required"],
                },
            };

            render(<PropertyInfo actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "type");

            const errorMessage = screen.getByTestId("error-message");
            expect(errorMessage).toHaveTextContent("Property type is required");
        });

        it("should render FormErrors for description field when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    description: ["Description is required"],
                },
            };

            render(<PropertyInfo actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "description-error");

            const errorMessage = screen.getByTestId("error-message");
            expect(errorMessage).toHaveTextContent("Description is required");
        });

        it("should not render FormErrors when no errors exist", () => {
            render(<PropertyInfo actionState={defaultActionState} />);

            const formErrors = screen.queryByTestId("form-errors");
            expect(formErrors).not.toBeInTheDocument();
        });

        it("should handle multiple field errors simultaneously", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    name: ["Name is required"],
                    type: ["Type is required"],
                    description: ["Description is required"],
                },
            };

            render(<PropertyInfo actionState={actionState} />);

            const formErrors = screen.getAllByTestId("form-errors");
            expect(formErrors).toHaveLength(3);

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(3);
        });
    });

    describe("Integration with ActionState", () => {
        it("should handle complex actionState with formData and errors", () => {
            const formData = new FormData();
            formData.set("name", "Property with Errors");
            formData.set("description", "Description with issues");

            const actionState: ActionState = {
                status: ActionStatus.ERROR,
                formData: formData,
                formErrorMap: {
                    name: ["Name contains invalid characters"],
                    type: ["Please select a valid property type"],
                },
            };

            render(<PropertyInfo actionState={actionState} />);

            // Check that formData values are populated
            expect(
                screen.getByDisplayValue("Property with Errors"),
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("Description with issues"),
            ).toBeInTheDocument();

            // Check that errors are displayed
            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0]).toHaveTextContent(
                "Name contains invalid characters",
            );
            expect(errorMessages[1]).toHaveTextContent(
                "Please select a valid property type",
            );
        });

        it("should handle empty actionState gracefully", () => {
            render(<PropertyInfo actionState={{}} />);

            const nameInput = screen.getByLabelText("Name");
            const descriptionTextarea = screen.getByLabelText("Description");

            expect(nameInput).toHaveValue("");
            expect(descriptionTextarea).toHaveValue("");
            expect(screen.queryByTestId("form-errors")).not.toBeInTheDocument();
        });
    });

    describe("Component Props Integration", () => {
        it("should handle both actionState and property props", () => {
            const formData = new FormData();
            formData.set("name", "FormData Name");

            const actionState: ActionState = {
                formData: formData,
            };

            const property = {
                name: "Property Name",
                type: "house",
                description: "Property Description",
            } as unknown as PropertyDocument;

            render(
                <PropertyInfo actionState={actionState} property={property} />,
            );

            // FormData should take precedence for name
            expect(screen.getByDisplayValue("FormData Name")).toBeInTheDocument();

            // Property should provide fallback for description (no FormData)
            expect(
                screen.getByDisplayValue("Property Description"),
            ).toBeInTheDocument();

            // Property should provide default value for type select
            const typeSelect = screen.getByTestId("dwellio-select");
            expect(typeSelect).toHaveAttribute(
                "data-default-value",
                JSON.stringify({ label: "house", value: "house" }),
            );
        });

        it("should work with only actionState prop", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    name: ["Name error"],
                },
            };

            render(<PropertyInfo actionState={actionState} />);

            expect(screen.getByLabelText("Name")).toHaveValue("");
            expect(screen.getByTestId("error-message")).toHaveTextContent(
                "Name error",
            );
        });

        it("should work with only property prop", () => {
            const property = {
                name: "Property Only Name",
                type: "condo",
                description: "Property Only Description",
            } as unknown as PropertyDocument;

            render(
                <PropertyInfo
                    actionState={defaultActionState}
                    property={property}
                />,
            );

            expect(
                screen.getByDisplayValue("Property Only Name"),
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("Property Only Description"),
            ).toBeInTheDocument();

            const typeSelect = screen.getByTestId("dwellio-select");
            expect(typeSelect).toHaveAttribute(
                "data-default-value",
                JSON.stringify({ label: "condo", value: "condo" }),
            );
        });
    });

    describe("Static Inputs Context Integration", () => {
        it("should handle empty property types from context", () => {
            mockUseStaticInputs.mockReturnValue({
                propertyTypes: [],
            });

            render(<PropertyInfo actionState={defaultActionState} />);

            const typeSelect = screen.getByTestId("dwellio-select");
            expect(typeSelect).toBeInTheDocument();

            // Should only have the placeholder option
            const options = screen.getAllByRole("option");
            expect(options).toHaveLength(1);
            expect(options[0]).toHaveTextContent("Select a property type");
        });

        it("should handle context provider errors gracefully", () => {
            mockUseStaticInputs.mockReturnValue({});

            expect(() => {
                render(<PropertyInfo actionState={defaultActionState} />);
            }).not.toThrow();

            const typeSelect = screen.getByTestId("dwellio-select");
            expect(typeSelect).toBeInTheDocument();
        });
    });
});