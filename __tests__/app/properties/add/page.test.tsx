/**
 * Add Property Page Tests
 *
 * Tests for app/(root)/properties/add/page.tsx
 * Covers page structure, metadata, and component integration
 */

import { render, screen } from "@/__tests__/test-utils";
import AddPropertyPage from "@/app/(root)/properties/add/page";
import { metadata } from "@/app/(root)/properties/add/page";
import { Suspense } from "react";

// Mock the AddPropertyForm component
jest.mock("@/ui/properties/add/add-property-form", () => {
    return function MockAddPropertyForm() {
        return <div data-testid="add-property-form">Add Property Form</div>;
    };
});

// Mock the Breadcrumbs component
jest.mock("@/ui/shared/breadcrumbs", () => {
    return function MockBreadcrumbs({
        breadcrumbs,
    }: {
        breadcrumbs: Array<{ label: string; href: string; active?: boolean }>;
    }) {
        return (
            <nav data-testid="breadcrumbs">
                {breadcrumbs.map((breadcrumb, index) => (
                    <span
                        key={index}
                        data-active={breadcrumb.active}
                        data-href={breadcrumb.href}
                    >
                        {breadcrumb.label}
                    </span>
                ))}
            </nav>
        );
    };
});

describe("Add Property Page", () => {
    // Helper function to render async component
    const renderAsyncComponent = async () => {
        const Component = await AddPropertyPage();
        return render(
            <Suspense fallback={<div>Loading...</div>}>{Component}</Suspense>,
        );
    };

    describe("Page Structure & Metadata", () => {
        it("should have correct metadata title", () => {
            expect(metadata.title).toBe("Add New Property");
        });

        it("should render main container element", async () => {
            await renderAsyncComponent();

            const mainElement = screen.getByRole("main");
            expect(mainElement).toBeInTheDocument();
        });

        it("should be a server component (no client-side hydration issues)", async () => {
            // Test that the component can be rendered without client-side hooks
            const Component = await AddPropertyPage();
            const { container } = render(Component);

            expect(container.firstChild).toBeInTheDocument();
            expect(container.querySelector("main")).toBeInTheDocument();
        });

        it("should render without errors", async () => {
            const Component = await AddPropertyPage();
            expect(() => render(Component)).not.toThrow();
        });
    });

    describe("Breadcrumbs Integration", () => {
        it("should render breadcrumbs component", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const breadcrumbs = screen.getByTestId("breadcrumbs");
            expect(breadcrumbs).toBeInTheDocument();
        });

        it('should have properties link pointing to "/properties"', async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const propertiesLink = screen.getByText("Properties");
            expect(propertiesLink).toBeInTheDocument();
            expect(propertiesLink).toHaveAttribute("data-href", "/properties");
        });

        it('should show "Add Property" as active breadcrumb', async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const addPropertyBreadcrumb = screen.getByText("Add Property");
            expect(addPropertyBreadcrumb).toBeInTheDocument();
            expect(addPropertyBreadcrumb).toHaveAttribute(
                "data-active",
                "true",
            );
            expect(addPropertyBreadcrumb).toHaveAttribute(
                "data-href",
                "/properties/add",
            );
        });

        it("should provide proper navigation context", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            // Check that both breadcrumb items are present
            expect(screen.getByText("Properties")).toBeInTheDocument();
            expect(screen.getByText("Add Property")).toBeInTheDocument();

            // Verify the breadcrumb structure
            const breadcrumbs = screen.getByTestId("breadcrumbs");
            expect(breadcrumbs.children).toHaveLength(2);
        });
    });

    describe("Form Component Integration", () => {
        it("should render AddPropertyForm component", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const addPropertyForm = screen.getByTestId("add-property-form");
            expect(addPropertyForm).toBeInTheDocument();
        });

        it("should have form properly nested within main element", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const mainElement = screen.getByRole("main");
            const addPropertyForm = screen.getByTestId("add-property-form");

            expect(mainElement).toContainElement(addPropertyForm);
        });

        it("should render components in correct order", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const mainElement = screen.getByRole("main");
            const children = Array.from(mainElement.children);

            // Breadcrumbs should come first
            expect(children[0]).toHaveAttribute("data-testid", "breadcrumbs");
            // Form should come second
            expect(children[1]).toHaveAttribute(
                "data-testid",
                "add-property-form",
            );
        });
    });

    describe("Page Layout & Accessibility", () => {
        it("should use semantic main element", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const mainElement = screen.getByRole("main");
            expect(mainElement.tagName).toBe("MAIN");
        });

        it("should be accessible to screen readers", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            // Main landmark should be accessible
            const mainLandmark = screen.getByRole("main");
            expect(mainLandmark).toBeInTheDocument();

            // Navigation should be accessible
            const navigation = screen.getByTestId("breadcrumbs");
            expect(navigation.tagName).toBe("NAV");
        });

        it("should have proper document structure", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            const mainElement = screen.getByRole("main");

            // Should contain both navigation and form
            expect(mainElement).toContainElement(
                screen.getByTestId("breadcrumbs"),
            );
            expect(mainElement).toContainElement(
                screen.getByTestId("add-property-form"),
            );
        });
    });

    describe("Component Props & Data Flow", () => {
        it("should pass correct breadcrumbs data", async () => {
            const Component = await AddPropertyPage();
            render(Component);

            // Verify breadcrumb props are passed correctly
            const propertiesLink = screen.getByText("Properties");
            const addPropertyLink = screen.getByText("Add Property");

            expect(propertiesLink).toHaveAttribute("data-href", "/properties");
            expect(propertiesLink).not.toHaveAttribute("data-active");

            expect(addPropertyLink).toHaveAttribute(
                "data-href",
                "/properties/add",
            );
            expect(addPropertyLink).toHaveAttribute("data-active", "true");
        });
    });

    describe("Server Component Behavior", () => {
        it("should render synchronously without async issues", async () => {
            // Server components should render immediately after awaiting
            const Component = await AddPropertyPage();
            const { container } = render(Component);

            expect(container.firstChild).toBeInTheDocument();
            expect(screen.getByRole("main")).toBeInTheDocument();
            expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
            expect(screen.getByTestId("add-property-form")).toBeInTheDocument();
        });

        it("should not have client-side state or effects", async () => {
            // Server components should not use hooks or client-side features
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const Component = await AddPropertyPage();
            render(Component);

            // Should not log any hook-related errors
            expect(consoleSpy).not.toHaveBeenCalledWith(
                expect.stringContaining("hook"),
            );

            consoleSpy.mockRestore();
        });
    });
});
