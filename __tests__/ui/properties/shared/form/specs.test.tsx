/**
 * Specs Component Tests
 *
 * Tests for ui/properties/shared/form/specs.tsx
 * Covers bedroom, bathroom, and square footage input fields with validation
 */

import { render, screen } from "@/__tests__/test-utils";
import Specs from "@/ui/properties/shared/form/specs";
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

describe("Specs Component", () => {
    const defaultActionState: ActionState = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Component Structure", () => {
        it("should render with proper heading", () => {
            render(<Specs actionState={defaultActionState} />);

            const heading = screen.getByText("Specs");
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe("H2");
            expect(heading).toHaveClass("block", "text-gray-700", "font-bold", "mb-1");
        });

        it("should render all three spec input fields", () => {
            render(<Specs actionState={defaultActionState} />);

            expect(screen.getByLabelText("Beds")).toBeInTheDocument();
            expect(screen.getByLabelText("Baths")).toBeInTheDocument();
            expect(screen.getByLabelText("Square Feet")).toBeInTheDocument();
        });

        it("should have responsive layout structure", () => {
            const { container } = render(<Specs actionState={defaultActionState} />);

            const flexContainer = container.querySelector(".flex.flex-wrap");
            expect(flexContainer).toBeInTheDocument();

            // Check responsive field containers
            const bedsContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/3.sm\\:pr-2.mb-2.sm\\:mb-0",
            );
            const bathsContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/3.sm\\:px-2.mb-2.sm\\:mb-0",
            );
            const squareFeetContainer = container.querySelector(
                ".w-full.sm\\:w-1\\/3.sm\\:pl-2",
            );

            expect(bedsContainer).toBeInTheDocument();
            expect(bathsContainer).toBeInTheDocument();
            expect(squareFeetContainer).toBeInTheDocument();
        });

        it("should render main container with proper classes", () => {
            const { container } = render(<Specs actionState={defaultActionState} />);

            const mainContainer = container.firstChild as HTMLElement;
            expect(mainContainer).toHaveClass("mb-4");
        });
    });

    describe("Beds Input Field", () => {
        it("should render beds input with correct attributes", () => {
            render(<Specs actionState={defaultActionState} />);

            const bedsInput = screen.getByLabelText("Beds");
            expect(bedsInput).toBeInTheDocument();
            expect(bedsInput).toHaveAttribute("type", "number");
            expect(bedsInput).toHaveAttribute("id", "beds");
            expect(bedsInput).toHaveAttribute("name", "beds");
            expect(bedsInput).toHaveAttribute("aria-describedby", "beds-error");
        });

        it("should have proper styling classes", () => {
            render(<Specs actionState={defaultActionState} />);

            const bedsInput = screen.getByLabelText("Beds");
            expect(bedsInput).toHaveClass(
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

        it("should populate default value from actionState.formData", () => {
            const formData = new FormData();
            formData.set("beds", "3");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Specs actionState={actionState} />);

            const bedsInput = screen.getByDisplayValue("3");
            expect(bedsInput).toBeInTheDocument();
        });

        it("should populate default value from existing property", () => {
            const property = {
                beds: 2,
                baths: 1.5,
                squareFeet: 1200,
            } as unknown as PropertyDocument;

            render(<Specs actionState={defaultActionState} property={property} />);

            const bedsInput = screen.getByDisplayValue("2");
            expect(bedsInput).toBeInTheDocument();
        });

        it("should prioritize actionState.formData over property data", () => {
            const formData = new FormData();
            formData.set("beds", "4");

            const actionState: ActionState = {
                formData: formData,
            };

            const property = {
                beds: 2,
                baths: 1,
                squareFeet: 1000,
            } as unknown as PropertyDocument;

            render(<Specs actionState={actionState} property={property} />);

            const bedsInput = screen.getByDisplayValue("4");
            expect(bedsInput).toBeInTheDocument();
        });

        it("should handle empty values gracefully", () => {
            render(<Specs actionState={defaultActionState} />);

            const bedsInput = screen.getByLabelText("Beds");
            expect(bedsInput).toHaveValue(null);
        });
    });

    describe("Baths Input Field", () => {
        it("should render baths input with correct attributes", () => {
            render(<Specs actionState={defaultActionState} />);

            const bathsInput = screen.getByLabelText("Baths");
            expect(bathsInput).toBeInTheDocument();
            expect(bathsInput).toHaveAttribute("type", "number");
            expect(bathsInput).toHaveAttribute("id", "baths");
            expect(bathsInput).toHaveAttribute("name", "baths");
            expect(bathsInput).toHaveAttribute("aria-describedby", "bath-error");
        });

        it("should have proper styling classes", () => {
            render(<Specs actionState={defaultActionState} />);

            const bathsInput = screen.getByLabelText("Baths");
            expect(bathsInput).toHaveClass(
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

        it("should populate default value from actionState.formData", () => {
            const formData = new FormData();
            formData.set("baths", "2.5");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Specs actionState={actionState} />);

            const bathsInput = screen.getByDisplayValue("2.5");
            expect(bathsInput).toBeInTheDocument();
        });

        it("should populate default value from existing property", () => {
            const property = {
                beds: 3,
                baths: 2.5,
                squareFeet: 1500,
            } as unknown as PropertyDocument;

            render(<Specs actionState={defaultActionState} property={property} />);

            const bathsInput = screen.getByDisplayValue("2.5");
            expect(bathsInput).toBeInTheDocument();
        });

        it("should prioritize actionState.formData over property data", () => {
            const formData = new FormData();
            formData.set("baths", "3");

            const actionState: ActionState = {
                formData: formData,
            };

            const property = {
                beds: 2,
                baths: 1.5,
                squareFeet: 1000,
            } as unknown as PropertyDocument;

            render(<Specs actionState={actionState} property={property} />);

            const bathsInput = screen.getByDisplayValue("3");
            expect(bathsInput).toBeInTheDocument();
        });

        it("should support decimal values for half baths", () => {
            const property = {
                beds: 2,
                baths: 1.5,
                squareFeet: 1200,
            } as unknown as PropertyDocument;

            render(<Specs actionState={defaultActionState} property={property} />);

            const bathsInput = screen.getByDisplayValue("1.5");
            expect(bathsInput).toBeInTheDocument();
        });
    });

    describe("Square Feet Input Field", () => {
        it("should render squareFeet input with correct attributes", () => {
            render(<Specs actionState={defaultActionState} />);

            const squareFeetInput = screen.getByLabelText("Square Feet");
            expect(squareFeetInput).toBeInTheDocument();
            expect(squareFeetInput).toHaveAttribute("type", "number");
            expect(squareFeetInput).toHaveAttribute("id", "squareFeet");
            expect(squareFeetInput).toHaveAttribute("name", "squareFeet");
            expect(squareFeetInput).toHaveAttribute("aria-describedby", "squareFeet-error");
        });

        it("should have proper styling classes", () => {
            render(<Specs actionState={defaultActionState} />);

            const squareFeetInput = screen.getByLabelText("Square Feet");
            expect(squareFeetInput).toHaveClass(
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

        it("should populate default value from actionState.formData", () => {
            const formData = new FormData();
            formData.set("squareFeet", "1800");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Specs actionState={actionState} />);

            const squareFeetInput = screen.getByDisplayValue("1800");
            expect(squareFeetInput).toBeInTheDocument();
        });

        it("should populate default value from existing property", () => {
            const property = {
                beds: 3,
                baths: 2,
                squareFeet: 2000,
            } as unknown as PropertyDocument;

            render(<Specs actionState={defaultActionState} property={property} />);

            const squareFeetInput = screen.getByDisplayValue("2000");
            expect(squareFeetInput).toBeInTheDocument();
        });

        it("should prioritize actionState.formData over property data", () => {
            const formData = new FormData();
            formData.set("squareFeet", "2500");

            const actionState: ActionState = {
                formData: formData,
            };

            const property = {
                beds: 2,
                baths: 1,
                squareFeet: 1200,
            } as unknown as PropertyDocument;

            render(<Specs actionState={actionState} property={property} />);

            const squareFeetInput = screen.getByDisplayValue("2500");
            expect(squareFeetInput).toBeInTheDocument();
        });

        it("should handle large square footage values", () => {
            const property = {
                beds: 5,
                baths: 4,
                squareFeet: 5000,
            } as unknown as PropertyDocument;

            render(<Specs actionState={defaultActionState} property={property} />);

            const squareFeetInput = screen.getByDisplayValue("5000");
            expect(squareFeetInput).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should render FormErrors for beds field when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    beds: ["Beds is required", "Must be a positive number"],
                },
            };

            render(<Specs actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "beds");

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0]).toHaveTextContent("Beds is required");
            expect(errorMessages[1]).toHaveTextContent("Must be a positive number");
        });

        it("should render FormErrors for baths field when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    baths: ["Baths is required", "Invalid decimal value"],
                },
            };

            render(<Specs actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "baths");

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0]).toHaveTextContent("Baths is required");
            expect(errorMessages[1]).toHaveTextContent("Invalid decimal value");
        });

        it("should render FormErrors for squareFeet field when errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    squareFeet: ["Square feet must be positive"],
                },
            };

            render(<Specs actionState={actionState} />);

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "squareFeet");

            const errorMessage = screen.getByTestId("error-message");
            expect(errorMessage).toHaveTextContent("Square feet must be positive");
        });

        it("should not render FormErrors when no errors exist", () => {
            render(<Specs actionState={defaultActionState} />);

            const formErrors = screen.queryByTestId("form-errors");
            expect(formErrors).not.toBeInTheDocument();
        });

        it("should handle multiple field errors simultaneously", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    beds: ["Beds error"],
                    baths: ["Baths error"],
                    squareFeet: ["Square feet error"],
                },
            };

            render(<Specs actionState={actionState} />);

            const formErrors = screen.getAllByTestId("form-errors");
            expect(formErrors).toHaveLength(3);

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(3);
            expect(errorMessages[0]).toHaveTextContent("Beds error");
            expect(errorMessages[1]).toHaveTextContent("Baths error");
            expect(errorMessages[2]).toHaveTextContent("Square feet error");
        });

        it("should handle actionState without formErrorMap", () => {
            const actionState: ActionState = {
                status: ActionStatus.SUCCESS,
            };

            render(<Specs actionState={actionState} />);

            const formErrors = screen.queryByTestId("form-errors");
            expect(formErrors).not.toBeInTheDocument();
        });
    });

    describe("Integration with ActionState", () => {
        it("should handle complex actionState with formData and errors", () => {
            const formData = new FormData();
            formData.set("beds", "3");
            formData.set("baths", "2");
            formData.set("squareFeet", "1500");

            const actionState: ActionState = {
                status: ActionStatus.ERROR,
                formData: formData,
                formErrorMap: {
                    beds: ["Beds validation error"],
                    squareFeet: ["Square feet validation error"],
                },
            };

            render(<Specs actionState={actionState} />);

            // Check that formData values are populated
            expect(screen.getByDisplayValue("3")).toBeInTheDocument();
            expect(screen.getByDisplayValue("2")).toBeInTheDocument();
            expect(screen.getByDisplayValue("1500")).toBeInTheDocument();

            // Check that errors are displayed
            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0]).toHaveTextContent("Beds validation error");
            expect(errorMessages[1]).toHaveTextContent("Square feet validation error");
        });

        it("should handle empty actionState gracefully", () => {
            render(<Specs actionState={{}} />);

            const bedsInput = screen.getByLabelText("Beds");
            const bathsInput = screen.getByLabelText("Baths");
            const squareFeetInput = screen.getByLabelText("Square Feet");

            expect(bedsInput).toHaveValue(null);
            expect(bathsInput).toHaveValue(null);
            expect(squareFeetInput).toHaveValue(null);
            expect(screen.queryByTestId("form-errors")).not.toBeInTheDocument();
        });
    });

    describe("Component Props Integration", () => {
        it("should handle both actionState and property props", () => {
            const formData = new FormData();
            formData.set("beds", "4");

            const actionState: ActionState = {
                formData: formData,
            };

            const property = {
                beds: 2,
                baths: 1.5,
                squareFeet: 1200,
            } as unknown as PropertyDocument;

            render(<Specs actionState={actionState} property={property} />);

            // FormData should take precedence for beds
            expect(screen.getByDisplayValue("4")).toBeInTheDocument();

            // Property should provide fallback for baths and squareFeet (no FormData)
            expect(screen.getByDisplayValue("1.5")).toBeInTheDocument();
            expect(screen.getByDisplayValue("1200")).toBeInTheDocument();
        });

        it("should work with only actionState prop", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    beds: ["Beds error"],
                },
            };

            render(<Specs actionState={actionState} />);

            expect(screen.getByLabelText("Beds")).toHaveValue(null);
            expect(screen.getByTestId("error-message")).toHaveTextContent("Beds error");
        });

        it("should work with only property prop", () => {
            const property = {
                beds: 3,
                baths: 2.5,
                squareFeet: 1800,
            } as unknown as PropertyDocument;

            render(<Specs actionState={defaultActionState} property={property} />);

            expect(screen.getByDisplayValue("3")).toBeInTheDocument();
            expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
            expect(screen.getByDisplayValue("1800")).toBeInTheDocument();
        });

        it("should handle missing property values gracefully", () => {
            const partialProperty = {
                beds: 2,
                // Missing baths and squareFeet
            } as unknown as PropertyDocument;

            render(<Specs actionState={defaultActionState} property={partialProperty} />);

            expect(screen.getByDisplayValue("2")).toBeInTheDocument();
            expect(screen.getByLabelText("Baths")).toHaveValue(null);
            expect(screen.getByLabelText("Square Feet")).toHaveValue(null);
        });
    });

    describe("Numeric Input Behavior", () => {
        it("should accept integer values", () => {
            const formData = new FormData();
            formData.set("beds", "4");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Specs actionState={actionState} />);

            const bedsInput = screen.getByDisplayValue("4");
            expect(bedsInput).toHaveAttribute("type", "number");
        });

        it("should accept decimal values for baths", () => {
            const formData = new FormData();
            formData.set("baths", "2.5");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Specs actionState={actionState} />);

            const bathsInput = screen.getByDisplayValue("2.5");
            expect(bathsInput).toHaveAttribute("type", "number");
        });

        it("should accept large numbers for square feet", () => {
            const formData = new FormData();
            formData.set("squareFeet", "10000");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Specs actionState={actionState} />);

            const squareFeetInput = screen.getByDisplayValue("10000");
            expect(squareFeetInput).toHaveAttribute("type", "number");
        });

        it("should handle zero values", () => {
            const formData = new FormData();
            formData.set("beds", "0");
            formData.set("baths", "0");
            formData.set("squareFeet", "0");

            const actionState: ActionState = {
                formData: formData,
            };

            render(<Specs actionState={actionState} />);

            const bedsInput = screen.getByLabelText("Beds") as HTMLInputElement;
            const bathsInput = screen.getByLabelText("Baths") as HTMLInputElement;
            const squareFeetInput = screen.getByLabelText("Square Feet") as HTMLInputElement;

            expect(bedsInput.defaultValue).toBe("0");
            expect(bathsInput.defaultValue).toBe("0");
            expect(squareFeetInput.defaultValue).toBe("0");
        });
    });
});