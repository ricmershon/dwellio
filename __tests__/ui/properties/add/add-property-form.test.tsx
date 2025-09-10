/**
 * AddPropertyForm Tests
 *
 * Tests for ui/properties/add/add-property-form.tsx
 * Covers form state management, error handling, structure, and integration
 */

import { render, screen, fireEvent, act } from "@/__tests__/test-utils";
import { toast } from "react-toastify";
import AddPropertyForm from "@/ui/properties/add/add-property-form";
import { ActionStatus } from "@/types";

// Mock react-toastify
jest.mock("react-toastify", () => ({
    toast: {
        error: jest.fn(),
    },
}));

// Mock the createProperty server action
jest.mock("@/lib/actions/property-actions", () => ({
    createProperty: jest.fn(),
}));

import { createProperty } from "@/lib/actions/property-actions";
const mockCreateProperty = createProperty as jest.MockedFunction<
    typeof createProperty
>;

// Mock all form components
jest.mock("@/ui/properties/shared/form/property-info", () => {
    return function MockPropertyInfo({
        actionState,
    }: {
        actionState: unknown;
    }) {
        return (
            <div
                data-testid="property-info"
                data-action-state={JSON.stringify(actionState)}
            >
                Property Info Component
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/location", () => {
    return function MockLocation({ actionState }: { actionState: unknown }) {
        return (
            <div
                data-testid="location"
                data-action-state={JSON.stringify(actionState)}
            >
                Location Component
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/specs", () => {
    return function MockSpecs({ actionState }: { actionState: unknown }) {
        return (
            <div
                data-testid="specs"
                data-action-state={JSON.stringify(actionState)}
            >
                Specs Component
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/amenities", () => {
    return function MockAmenities({ actionState }: { actionState: unknown }) {
        return (
            <div
                data-testid="amenities"
                data-action-state={JSON.stringify(actionState)}
            >
                Amenities Component
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/rates", () => {
    return function MockRates({ actionState }: { actionState: unknown }) {
        return (
            <div
                data-testid="rates"
                data-action-state={JSON.stringify(actionState)}
            >
                Rates Component
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/host-info", () => {
    return function MockHostInfo({ actionState }: { actionState: unknown }) {
        return (
            <div
                data-testid="host-info"
                data-action-state={JSON.stringify(actionState)}
            >
                Host Info Component
            </div>
        );
    };
});

jest.mock("@/ui/properties/shared/form/image-picker", () => {
    return function MockImagePicker({ actionState }: { actionState: unknown }) {
        return (
            <div
                data-testid="image-picker"
                data-action-state={JSON.stringify(actionState)}
            >
                Image Picker Component
            </div>
        );
    };
});

jest.mock("@/ui/shared/input-errors", () => {
    return function MockInputErrors() {
        return <div data-testid="input-errors">Input Errors Component</div>;
    };
});

jest.mock("@/ui/properties/shared/form/buttons", () => {
    return function MockPropertyFormButtons({
        cancelButtonHref,
        isPending,
        primaryButtonText,
    }: {
        cancelButtonHref: string;
        isPending: boolean;
        primaryButtonText: string;
    }) {
        return (
            <div data-testid="form-buttons">
                <button
                    data-testid="cancel-button"
                    data-href={cancelButtonHref}
                >
                    Cancel
                </button>
                <button
                    data-testid="submit-button"
                    data-pending={isPending}
                    type="submit"
                >
                    {primaryButtonText}
                </button>
            </div>
        );
    };
});

// Mock useActionState hook
jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useActionState: jest.fn(),
    useEffect: jest.requireActual("react").useEffect,
}));

// Get the mock from React
import { useActionState } from "react";
const useActionStateMock = useActionState as jest.MockedFunction<
    typeof useActionState
>;

describe("AddPropertyForm", () => {
    const mockFormAction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Default useActionState mock
        useActionStateMock.mockReturnValue([
            {}, // actionState
            mockFormAction, // formAction
            false, // isPending
        ]);
    });

    describe("Form State Management", () => {
        it("should initialize useActionState with createProperty action", () => {
            render(<AddPropertyForm />);

            expect(useActionStateMock).toHaveBeenCalledWith(
                mockCreateProperty,
                {},
            );
        });

        it("should initialize with empty actionState", () => {
            useActionStateMock.mockReturnValue([{}, mockFormAction, false]);

            render(<AddPropertyForm />);

            // Verify components receive empty actionState
            const propertyInfo = screen.getByTestId("property-info");
            expect(propertyInfo).toHaveAttribute("data-action-state", "{}");
        });

        it("should handle actionState updates", () => {
            const actionState = {
                status: ActionStatus.SUCCESS,
                message: "Property created successfully",
            };

            useActionStateMock.mockReturnValue([
                actionState,
                mockFormAction,
                false,
            ]);

            render(<AddPropertyForm />);

            // Verify components receive updated actionState
            const propertyInfo = screen.getByTestId("property-info");
            expect(propertyInfo).toHaveAttribute(
                "data-action-state",
                JSON.stringify(actionState),
            );
        });

        it("should handle isPending state updates", () => {
            useActionStateMock.mockReturnValue([{}, mockFormAction, true]);

            render(<AddPropertyForm />);

            const submitButton = screen.getByTestId("submit-button");
            expect(submitButton).toHaveAttribute("data-pending", "true");
        });
    });

    describe("Error Handling & Feedback", () => {
        it("should display toast error when actionState has ERROR status", async () => {
            const errorState = {
                status: ActionStatus.ERROR,
                message: "Validation failed",
            };

            useActionStateMock.mockReturnValue([
                errorState,
                mockFormAction,
                false,
            ]);

            await act(async () => {
                render(<AddPropertyForm />);
            });

            expect(toast.error).toHaveBeenCalledWith("Validation failed");
        });

        it("should not display toast for non-error statuses", async () => {
            const successState = {
                status: ActionStatus.SUCCESS,
                message: "Property created successfully",
            };

            useActionStateMock.mockReturnValue([
                successState,
                mockFormAction,
                false,
            ]);

            await act(async () => {
                render(<AddPropertyForm />);
            });

            expect(toast.error).not.toHaveBeenCalled();
        });

        it("should render InputErrors when actionState has keys", () => {
            const actionStateWithErrors = {
                formErrorMap: {
                    name: ["Name is required"],
                },
            };

            useActionStateMock.mockReturnValue([
                actionStateWithErrors,
                mockFormAction,
                false,
            ]);

            render(<AddPropertyForm />);

            const inputErrors = screen.getByTestId("input-errors");
            expect(inputErrors).toBeInTheDocument();
        });

        it("should not render InputErrors when actionState is empty", () => {
            useActionStateMock.mockReturnValue([{}, mockFormAction, false]);

            render(<AddPropertyForm />);

            const inputErrors = screen.queryByTestId("input-errors");
            expect(inputErrors).not.toBeInTheDocument();
        });

        it("should trigger useEffect when actionState changes", async () => {
            const { rerender } = render(<AddPropertyForm />);

            // Initially no error
            expect(toast.error).not.toHaveBeenCalled();

            // Update with error state
            const errorState = {
                status: ActionStatus.ERROR,
                message: "New error",
            };

            useActionStateMock.mockReturnValue([
                errorState,
                mockFormAction,
                false,
            ]);

            await act(async () => {
                rerender(<AddPropertyForm />);
            });

            expect(toast.error).toHaveBeenCalledWith("New error");
        });
    });

    describe("Form Structure & Layout", () => {
        it("should render HTML form element", () => {
            const { container } = render(<AddPropertyForm />);

            const form = container.querySelector("form");
            expect(form).toBeInTheDocument();
            expect(form?.tagName).toBe("FORM");
        });

        it("should have correct form action attribute", () => {
            const { container } = render(<AddPropertyForm />);

            const form = container.querySelector("form");
            expect(form).toHaveAttribute("action");
        });

        it("should apply correct styling classes", () => {
            const { container } = render(<AddPropertyForm />);

            const formContainer = container.querySelector("form")
                ?.firstChild as HTMLElement;
            expect(formContainer).toHaveClass(
                "p-4",
                "md:p-6",
                "border",
                "border-gray-200",
                "rounded-md",
            );
        });

        it("should be responsive with mobile/desktop padding", () => {
            const { container } = render(<AddPropertyForm />);

            const formContainer = container.querySelector("form")
                ?.firstChild as HTMLElement;
            expect(formContainer).toHaveClass("p-4", "md:p-6");
        });
    });

    describe("Form Sections Integration", () => {
        it("should render PropertyInfo section with actionState", () => {
            const actionState = { test: "data" };
            useActionStateMock.mockReturnValue([
                actionState,
                mockFormAction,
                false,
            ]);

            render(<AddPropertyForm />);

            const propertyInfo = screen.getByTestId("property-info");
            expect(propertyInfo).toBeInTheDocument();
            expect(propertyInfo).toHaveAttribute(
                "data-action-state",
                JSON.stringify(actionState),
            );
        });

        it("should render Location section with actionState", () => {
            const actionState = { test: "data" };
            useActionStateMock.mockReturnValue([
                actionState,
                mockFormAction,
                false,
            ]);

            render(<AddPropertyForm />);

            const location = screen.getByTestId("location");
            expect(location).toBeInTheDocument();
            expect(location).toHaveAttribute(
                "data-action-state",
                JSON.stringify(actionState),
            );
        });

        it("should render all form sections in correct order", () => {
            const { container } = render(<AddPropertyForm />);

            const formContainer = container.querySelector("form")
                ?.firstChild as HTMLElement;
            const children = Array.from(formContainer.children);

            expect(children[0]).toHaveAttribute("data-testid", "property-info");
            expect(children[1]).toHaveAttribute("data-testid", "location");
            expect(children[2]).toHaveAttribute("data-testid", "specs");
            expect(children[3]).toHaveAttribute("data-testid", "amenities");
            expect(children[4]).toHaveAttribute("data-testid", "rates");
            expect(children[5]).toHaveAttribute("data-testid", "host-info");
            expect(children[6]).toHaveAttribute("data-testid", "image-picker");
        });

        it("should pass correct props to PropertyFormButtons", () => {
            useActionStateMock.mockReturnValue([{}, mockFormAction, true]);

            render(<AddPropertyForm />);

            const cancelButton = screen.getByTestId("cancel-button");
            const submitButton = screen.getByTestId("submit-button");

            expect(cancelButton).toHaveAttribute("data-href", "/properties");
            expect(submitButton).toHaveAttribute("data-pending", "true");
            expect(submitButton).toHaveTextContent("Save Property");
        });
    });

    describe("Form Submission", () => {
        it("should use correct form action from useActionState", () => {
            const { container } = render(<AddPropertyForm />);

            const form = container.querySelector("form");

            // Form should have action attribute (React sets this internally)
            expect(form).toHaveAttribute("action");
        });

        it("should submit form with proper structure", async () => {
            const { container } = render(<AddPropertyForm />);

            const form = container.querySelector("form");
            const submitButton = screen.getByTestId("submit-button");

            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Form should be submittable
            expect(form).toBeInTheDocument();
            expect(submitButton).toHaveAttribute("type", "submit");
        });

        it("should handle form submission with isPending state", () => {
            useActionStateMock.mockReturnValue([{}, mockFormAction, true]);

            render(<AddPropertyForm />);

            const submitButton = screen.getByTestId("submit-button");
            expect(submitButton).toHaveAttribute("data-pending", "true");
        });

        it("should prevent multiple submissions when pending", () => {
            useActionStateMock.mockReturnValue([{}, mockFormAction, true]);

            render(<AddPropertyForm />);

            const submitButton = screen.getByTestId("submit-button");
            expect(submitButton).toHaveAttribute("data-pending", "true");
        });
    });

    describe("Component Props Integration", () => {
        it("should pass actionState to all form components", () => {
            const actionState = {
                formData: new FormData(),
                formErrorMap: { name: ["Required"] },
            };

            useActionStateMock.mockReturnValue([
                actionState,
                mockFormAction,
                false,
            ]);

            render(<AddPropertyForm />);

            // Check that all components receive the actionState
            const components = [
                "property-info",
                "location",
                "specs",
                "amenities",
                "rates",
                "host-info",
                "image-picker",
            ];

            components.forEach((componentId) => {
                const component = screen.getByTestId(componentId);
                expect(component).toHaveAttribute(
                    "data-action-state",
                    JSON.stringify(actionState),
                );
            });
        });

        it("should pass correct button props", () => {
            useActionStateMock.mockReturnValue([{}, mockFormAction, false]);

            render(<AddPropertyForm />);

            const cancelButton = screen.getByTestId("cancel-button");
            const submitButton = screen.getByTestId("submit-button");

            expect(cancelButton).toHaveAttribute("data-href", "/properties");
            expect(submitButton).toHaveAttribute("data-pending", "false");
            expect(submitButton).toHaveTextContent("Save Property");
        });
    });

    describe("Error State Rendering", () => {
        it("should conditionally render InputErrors based on actionState", () => {
            // Empty actionState - no errors
            useActionStateMock.mockReturnValue([{}, mockFormAction, false]);

            const { rerender } = render(<AddPropertyForm />);

            expect(
                screen.queryByTestId("input-errors"),
            ).not.toBeInTheDocument();

            // ActionState with errors
            const actionStateWithErrors = {
                formErrorMap: { name: ["Required"] },
            };
            useActionStateMock.mockReturnValue([
                actionStateWithErrors,
                mockFormAction,
                false,
            ]);

            rerender(<AddPropertyForm />);

            expect(screen.getByTestId("input-errors")).toBeInTheDocument();
        });

        it("should handle actionState with various properties", () => {
            const complexActionState = {
                status: ActionStatus.ERROR,
                message: "Validation failed",
                formData: new FormData(),
                formErrorMap: {
                    name: ["Name is required"],
                    email: ["Invalid email format"],
                },
            };

            useActionStateMock.mockReturnValue([
                complexActionState,
                mockFormAction,
                false,
            ]);

            render(<AddPropertyForm />);

            // Should render InputErrors because actionState has keys
            expect(screen.getByTestId("input-errors")).toBeInTheDocument();

            // All components should receive the complex state
            const propertyInfo = screen.getByTestId("property-info");
            expect(propertyInfo).toHaveAttribute(
                "data-action-state",
                JSON.stringify(complexActionState),
            );
        });
    });

    describe("Client Component Behavior", () => {
        it("should use client-side hooks properly", () => {
            render(<AddPropertyForm />);

            // Should call useActionState
            expect(useActionStateMock).toHaveBeenCalled();

            // Should not throw errors about hook usage
            expect(() => render(<AddPropertyForm />)).not.toThrow();
        });

        it("should handle dynamic state updates", async () => {
            const { rerender } = render(<AddPropertyForm />);

            // Initial state
            expect(
                screen.queryByTestId("input-errors"),
            ).not.toBeInTheDocument();

            // Update with error state
            const errorState = { formErrorMap: { name: ["Required"] } };
            useActionStateMock.mockReturnValue([
                errorState,
                mockFormAction,
                false,
            ]);

            rerender(<AddPropertyForm />);

            expect(screen.getByTestId("input-errors")).toBeInTheDocument();
        });
    });
});
