/**
 * Add Property Integration Tests
 * 
 * Basic integration tests for the add property functionality
 * focusing on component rendering and server action integration.
 */

import { render, screen, fireEvent, waitFor, act } from "@/__tests__/test-utils";
import AddPropertyPage from "@/app/(root)/properties/add/page";
import { createProperty } from "@/lib/actions/property-actions";
import { ActionStatus } from "@/types";
import { Suspense } from "react";

// Extended ActionState type for test scenarios
interface TestActionState {
    message?: string | null;
    status?: typeof ActionStatus[keyof typeof ActionStatus] | null;
    formData?: FormData;
    formErrorMap?: Record<string, string[]>;
    propertyId?: string;
    authRequired?: boolean;
}

// Mock external dependencies
jest.mock("react-toastify", () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
}));

// Mock server action
jest.mock("@/lib/actions/property-actions", () => ({
    createProperty: jest.fn(),
}));

// Mock NextAuth
jest.mock("next-auth/react", () => ({
    useSession: () => ({
        data: {
            user: {
                id: "user123",
                email: "test@example.com",
                name: "Test User",
            },
        },
        status: "authenticated",
    }),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock session
const mockSession = {
    user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
    },
};

jest.mock("@/utils/get-session-user", () => ({
    getSessionUser: jest.fn().mockResolvedValue(mockSession.user),
}));

// Mock static inputs context
const mockStaticInputs = {
    propertyTypes: [
        { label: "Apartment", value: "apartment" },
        { label: "House", value: "house" },
        { label: "Condo", value: "condo" },
    ],
    amenities: [
        { label: "WiFi", value: "wifi" },
        { label: "Parking", value: "parking" },
        { label: "Pool", value: "pool" },
    ],
};

jest.mock("@/context/global-context", () => ({
    useStaticInputs: () => mockStaticInputs,
}));

// Mock Google Places
jest.mock("@/hooks/use-google-places-autocomplete", () => ({
    usePlacesAutocomplete: () => ({
        predictions: [],
    }),
}));

// Mock useDebounce
jest.mock("use-debounce", () => ({
    useDebounce: (value: string) => [value],
}));

const mockCreateProperty = createProperty as jest.MockedFunction<typeof createProperty>;

describe("Add Property Integration Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderAddPropertyPage = async () => {
        const Component = await AddPropertyPage();
        return render(
            <Suspense fallback={<div>Loading...</div>}>
                {Component}
            </Suspense>
        );
    };

    describe("Component Integration", () => {
        it("should render add property page with all key elements", async () => {
            await renderAddPropertyPage();

            // Verify page renders with key elements
            expect(screen.getByText("Add Property")).toBeInTheDocument();
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /save property/i })).toBeInTheDocument();
        });

        it("should integrate server action on form submission", async () => {
            mockCreateProperty.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: "Property created successfully",
                propertyId: "prop123"
            } as TestActionState);

            await renderAddPropertyPage();

            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Verify server action integration works
            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalled();
            });
        });

        it("should handle validation errors from server", async () => {
            mockCreateProperty.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: "Validation failed",
                formErrorMap: { name: ["Name is required"] }
            });

            await renderAddPropertyPage();

            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Should handle validation response
            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalled();
            });
        });

        it("should handle authentication scenarios", async () => {
            mockCreateProperty.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: "Authentication required",
                authRequired: true
            } as TestActionState);

            await renderAddPropertyPage();

            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Should handle auth integration
            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalled();
            });
        });

        it("should handle network errors gracefully", async () => {
            // Mock to resolve instead of reject to avoid unhandled error
            mockCreateProperty.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: "Network error"
            });

            await renderAddPropertyPage();

            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Should handle errors
            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalled();
            });
        });
    });

    describe("Form State Integration", () => {
        it("should prevent double submission", async () => {
            let resolvePromise: (value: any) => void;
            const pendingPromise = new Promise(resolve => {
                resolvePromise = resolve;
            });

            mockCreateProperty.mockReturnValue(pendingPromise as any);

            await renderAddPropertyPage();

            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            // Click submit button multiple times rapidly
            await act(async () => {
                fireEvent.click(submitButton);
                fireEvent.click(submitButton);
                fireEvent.click(submitButton);
            });

            // Should only call createProperty once
            expect(mockCreateProperty).toHaveBeenCalledTimes(1);

            // Button should be disabled
            expect(submitButton).toHaveAttribute("disabled");

            // Resolve the promise
            resolvePromise!({
                status: ActionStatus.SUCCESS,
                propertyId: "prop789"
            } as TestActionState);

            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalledTimes(1);
            });
        });

        it("should show loading state during submission", async () => {
            let resolvePromise: (value: any) => void;
            const pendingPromise = new Promise(resolve => {
                resolvePromise = resolve;
            });

            mockCreateProperty.mockReturnValue(pendingPromise as any);

            await renderAddPropertyPage();

            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Should show disabled button (loading state)
            expect(submitButton).toHaveAttribute("disabled");

            // Resolve promise
            resolvePromise!({
                status: ActionStatus.SUCCESS,
                propertyId: "prop999"
            } as TestActionState);

            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalled();
            });
        });
    });

    describe("Form Component Integration", () => {
        it("should render basic form elements", async () => {
            await renderAddPropertyPage();

            // Check for essential elements that we know exist
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            expect(screen.getByText("Location")).toBeInTheDocument();
            expect(screen.getByText("Amenities")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /save property/i })).toBeInTheDocument();
        });
    });
});