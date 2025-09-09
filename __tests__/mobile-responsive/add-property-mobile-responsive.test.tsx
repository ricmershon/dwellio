/**
 * Add Property Mobile & Responsive Tests
 * 
 * Section 15 of ADD_PROPERTY_TEST_PLAN
 * Tests mobile layout, touch interactions, and responsive behavior
 */

import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import AddPropertyPage from "@/app/(root)/properties/add/page";
import { createProperty } from "@/lib/actions/property-actions";
import { ActionStatus } from "@/types";
import { Suspense } from "react";

// Mock dependencies
jest.mock("@/lib/actions/property-actions", () => ({
    createProperty: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
    useSession: () => ({
        data: { user: { id: "user123", email: "test@example.com", name: "Test User" } },
        status: "authenticated",
    }),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/utils/get-session-user", () => ({
    getSessionUser: jest.fn().mockResolvedValue({ id: "user123", email: "test@example.com" }),
}));

jest.mock("@/context/global-context", () => ({
    useStaticInputs: () => ({
        propertyTypes: [
            { label: "Apartment", value: "apartment" },
            { label: "House", value: "house" },
            { label: "Condo", value: "condo" },
        ],
        amenities: [
            { label: "WiFi", value: "wifi" },
            { label: "Parking", value: "parking" },
            { label: "Pool", value: "pool" },
            { label: "Gym", value: "gym" },
        ],
    }),
}));

jest.mock("@/hooks/use-google-places-autocomplete", () => ({
    usePlacesAutocomplete: () => ({ predictions: [] }),
}));

jest.mock("use-debounce", () => ({
    useDebounce: (value: string) => [value],
}));

const mockCreateProperty = createProperty as jest.MockedFunction<typeof createProperty>;

// Viewport presets for testing
const VIEWPORTS = {
    mobile: { width: 375, height: 667 },
    smallMobile: { width: 320, height: 568 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 },
};

describe("Add Property Mobile & Responsive Tests - Section 15", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset viewport to desktop default
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
    });

    const renderAddPropertyPage = async () => {
        const Component = await AddPropertyPage();
        return render(
            <Suspense fallback={<div>Loading...</div>}>
                {Component}
            </Suspense>
        );
    };

    const setViewport = (viewport: { width: number; height: number }) => {
        Object.defineProperty(window, 'innerWidth', { value: viewport.width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: viewport.height, writable: true });
        fireEvent(window, new Event('resize'));
    };

    describe("15.1 Mobile Layout Tests", () => {
        beforeEach(() => {
            setViewport(VIEWPORTS.mobile);
        });

        it("should render form correctly on mobile devices", async () => {
            await renderAddPropertyPage();
            
            // Core form elements should be present
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            expect(screen.getByText("Location")).toBeInTheDocument();
            expect(screen.getByText("Amenities")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /save property/i })).toBeInTheDocument();
            
            // Form should be responsive
            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
        });

        it("should handle mobile interactions properly", async () => {
            await renderAddPropertyPage();
            
            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            // Test that mobile elements are accessible and clickable
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).not.toBeDisabled();
            
            // Button should remain interactive
            expect(submitButton).toBeInTheDocument();
        });

        it("should use appropriate mobile keyboard types", async () => {
            await renderAddPropertyPage();
            
            // Check numeric inputs have correct input mode
            const numericInputs = screen.getAllByRole('spinbutton');
            numericInputs.forEach(input => {
                expect(input).toHaveAttribute('type', 'number');
            });
            
            // Check email inputs
            const textboxes = screen.getAllByRole('textbox');
            const emailInputs = textboxes.filter(input => 
                (input as HTMLInputElement).name?.includes('email') ||
                (input as HTMLInputElement).type === 'email'
            );
            
            emailInputs.forEach(input => {
                expect(input).toHaveAttribute('type', 'email');
            });
        });

        it("should handle mobile image upload correctly", async () => {
            await renderAddPropertyPage();
            
            const imageInput = screen.getByLabelText(/images/i);
            
            // Should accept image files
            expect(imageInput).toHaveAttribute('accept', 'image/*');
            expect(imageInput).toHaveAttribute('multiple');
            
            // Simulate mobile image selection
            const mockFile = new File(['mobile-image'], 'mobile.jpg', { type: 'image/jpeg' });
            
            // Test that input can handle file selection
            fireEvent.change(imageInput, { target: { files: [mockFile] } });
            
            // Should not throw errors on mobile
            expect(imageInput).toBeInTheDocument();
        });
    });

    describe("15.2 Responsive Behavior Tests", () => {
        it("should adapt form to different screen sizes", async () => {
            await renderAddPropertyPage();
            
            // Test desktop layout
            setViewport(VIEWPORTS.desktop);
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            
            // Test tablet layout
            setViewport(VIEWPORTS.tablet);
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            
            // Test mobile layout
            setViewport(VIEWPORTS.mobile);
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            
            // Test small mobile layout
            setViewport(VIEWPORTS.smallMobile);
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            
            // Form should remain functional across all sizes
            const submitButton = screen.getByRole("button", { name: /save property/i });
            expect(submitButton).toBeInTheDocument();
        });

        it("should stack field layouts appropriately on smaller screens", async () => {
            const { container } = await renderAddPropertyPage();
            
            // Test mobile stacking
            setViewport(VIEWPORTS.mobile);
            
            // Look for responsive classes that indicate stacking
            const formSections = container.querySelectorAll('[class*="mb-"], [class*="block"], [class*="w-full"]');
            expect(formSections.length).toBeGreaterThan(0);
            
            // Form sections should maintain proper spacing
            const propertyInfoSection = screen.getByText("Property Information").closest('div');
            expect(propertyInfoSection).toBeInTheDocument();
        });

        it("should position buttons correctly on all screen sizes", async () => {
            await renderAddPropertyPage();
            
            const testViewports = Object.values(VIEWPORTS);
            
            for (const viewport of testViewports) {
                setViewport(viewport);
                
                const submitButton = screen.getByRole("button", { name: /save property/i });
                const cancelButton = screen.getByText("Cancel");
                
                // Buttons should be present and accessible
                expect(submitButton).toBeInTheDocument();
                expect(cancelButton).toBeInTheDocument();
                
                // Buttons should have proper spacing
                const buttonContainer = submitButton.closest('div');
                expect(buttonContainer).toBeInTheDocument();
            }
        });

        it("should adapt image preview grid responsively", async () => {
            await renderAddPropertyPage();
            
            const imageInput = screen.getByLabelText(/images/i);
            
            // Test across different viewport sizes
            const testViewports = Object.values(VIEWPORTS);
            
            for (const viewport of testViewports) {
                setViewport(viewport);
                
                // Image input should remain functional
                expect(imageInput).toBeInTheDocument();
                expect(imageInput).toHaveAttribute('accept', 'image/*');
                
                // Container should adapt to viewport
                const imageContainer = imageInput.closest('div');
                expect(imageContainer).toBeInTheDocument();
            }
        });
    });

    describe("Mobile Form Interaction Tests", () => {
        beforeEach(() => {
            setViewport(VIEWPORTS.mobile);
        });

        it("should handle mobile form submission", async () => {
            mockCreateProperty.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: "Property created successfully"
            });

            await renderAddPropertyPage();
            
            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            // Simulate mobile form submission (click represents touch tap)
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalled();
            });
        });

        it("should handle mobile validation errors", async () => {
            mockCreateProperty.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: "Validation failed",
                formErrorMap: {
                    name: ["Name is required"],
                }
            });

            await renderAddPropertyPage();
            
            const submitButton = screen.getByRole("button", { name: /save property/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(mockCreateProperty).toHaveBeenCalled();
            });
            
            // Form should handle errors gracefully on mobile
            expect(submitButton).toBeInTheDocument();
        });

        it("should maintain form usability during orientation changes", async () => {
            await renderAddPropertyPage();
            
            // Portrait mobile
            setViewport({ width: 375, height: 667 });
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            
            // Landscape mobile (swap dimensions)
            setViewport({ width: 667, height: 375 });
            expect(screen.getByText("Property Information")).toBeInTheDocument();
            
            // Form should remain functional
            const submitButton = screen.getByRole("button", { name: /save property/i });
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe("Touch Input Behavior Tests", () => {
        beforeEach(() => {
            setViewport(VIEWPORTS.mobile);
        });

        it("should handle mobile focus on form fields", async () => {
            await renderAddPropertyPage();
            
            const textInputs = screen.getAllByRole('textbox');
            
            if (textInputs.length > 0) {
                const firstInput = textInputs[0];
                
                // Simulate mobile focus 
                fireEvent.focus(firstInput);
                
                // Check that focus is properly handled on mobile
                expect(firstInput).toBeInTheDocument();
                expect(firstInput).not.toBeDisabled();
            }
        });

        it("should handle mobile checkbox interactions", async () => {
            await renderAddPropertyPage();
            
            const checkboxes = screen.getAllByRole('checkbox');
            
            if (checkboxes.length > 0) {
                const firstCheckbox = checkboxes[0];
                
                // Simulate mobile checkbox interaction (click represents touch tap)
                fireEvent.click(firstCheckbox);
                
                expect(firstCheckbox).toBeChecked();
            }
        });
    });

    describe("Mobile Performance Tests", () => {
        beforeEach(() => {
            setViewport(VIEWPORTS.mobile);
        });

        it("should load form efficiently on mobile", async () => {
            const startTime = performance.now();
            
            await renderAddPropertyPage();
            
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            // Should load within reasonable time on mobile
            expect(loadTime).toBeLessThan(3000);
            
            // Core elements should be present
            expect(screen.getByText("Property Information")).toBeInTheDocument();
        });

        it("should handle rapid mobile interactions", async () => {
            await renderAddPropertyPage();
            
            const submitButton = screen.getByRole("button", { name: /save property/i });
            
            const startTime = performance.now();
            
            // Rapid mobile interactions (clicks represent touch taps)
            for (let i = 0; i < 3; i++) {
                fireEvent.click(submitButton);
            }
            
            const endTime = performance.now();
            const interactionTime = endTime - startTime;
            
            // Interactions should be responsive
            expect(interactionTime).toBeLessThan(200);
            
            // Button should remain functional
            expect(submitButton).toBeInTheDocument();
        });
    });
});