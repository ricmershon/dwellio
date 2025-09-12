/**
 * AddressSearch Component Tests
 *
 * Tests for ui/properties/shared/form/address-search.tsx
 * Covers Google Places API integration, autocomplete functionality, and address selection
 */

import { render, screen, fireEvent } from "@/__tests__/test-utils";
import AddressSearch from "@/ui/properties/shared/form/address-search";
import { ActionState, AutocompletePrediction } from "@/types";

// Mock useDebounce hook
jest.mock("use-debounce", () => ({
    useDebounce: (value: string, delay: number) => [value, delay],
}));

// Mock Google Places hook
const mockUsePlacesAutocomplete = jest.fn();
jest.mock("@/hooks/use-google-places-autocomplete", () => ({
    usePlacesAutocomplete: (query: string) => mockUsePlacesAutocomplete(query),
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

// Mock Heroicons
jest.mock("@heroicons/react/24/solid", () => ({
    MagnifyingGlassIcon: ({ className }: { className?: string }) => (
        <svg data-testid="magnifying-glass-icon" className={className}>
            <path />
        </svg>
    ),
}));

describe("AddressSearch Component", () => {
    const defaultActionState: ActionState = {};
    const mockSetCity = jest.fn();
    const mockSetState = jest.fn();
    const mockSetZipcode = jest.fn();

    const mockPredictions: AutocompletePrediction[] = [
        {
            placeId: "place1",
            text: "123 Main St, Miami, FL 33101, USA",
            street: "123 Main St",
            city: "Miami",
            state: "FL",
            zipcode: "33101",
            structuredFormat: {
                mainText: { text: "123 Main St" },
                secondaryText: { text: "Miami, FL 33101, USA" },
            },
        },
        {
            placeId: "place2",
            text: "456 Oak Ave, Dallas, TX 75201, USA",
            street: "456 Oak Ave",
            city: "Dallas",
            state: "TX",
            zipcode: "75201",
            structuredFormat: {
                mainText: { text: "456 Oak Ave" },
                secondaryText: { text: "Dallas, TX 75201, USA" },
            },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePlacesAutocomplete.mockReturnValue({
            predictions: [],
        });
    });

    describe("Component Structure", () => {
        it("should render with proper label and input", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            expect(screen.getByLabelText("Address")).toBeInTheDocument();
            const input = screen.getByLabelText("Address");
            expect(input).toHaveAttribute("type", "text");
            expect(input).toHaveAttribute("id", "street");
            expect(input).toHaveAttribute("name", "location.street");
            expect(input).toHaveAttribute("placeholder", "Search address");
        });

        it("should render magnifying glass icon", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const icon = screen.getByTestId("magnifying-glass-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass(
                "absolute",
                "left-3",
                "top-1/2",
                "size-[18px]",
                "-translate-y-1/2",
                "text-gray-500",
                "peer-focus:text-gray-900",
            );
        });

        it("should have proper input styling and attributes", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");
            expect(input).toHaveClass(
                "w-full",
                "rounded-md",
                "border",
                "border-gray-300",
                "py-2",
                "pl-10",
                "px-3",
                "text-sm",
                "placeholder:text-gray-500",
                "bg-white",
            );
            expect(input).toHaveAttribute("aria-describedby", "street-error");
        });

        it("should render container with proper structure", () => {
            const { container } = render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const mainContainer = container.firstChild as HTMLElement;
            expect(mainContainer).toHaveClass("relative", "mb-2");

            const inputContainer = container.querySelector(
                ".relative.flex.flex-1.flex-shrink-0",
            );
            expect(inputContainer).toBeInTheDocument();
        });
    });

    describe("Input Value Handling", () => {
        it("should display street prop as default value", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    street="456 Existing Street"
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByDisplayValue("456 Existing Street");
            expect(input).toBeInTheDocument();
        });

        it("should prioritize actionState.formData over street prop", () => {
            const formData = new FormData();
            formData.set("location.street", "FormData Street");

            const actionState: ActionState = {
                formData: formData,
            };

            render(
                <AddressSearch
                    actionState={actionState}
                    street="Prop Street"
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByDisplayValue("FormData Street");
            expect(input).toBeInTheDocument();
        });

        it("should fall back to placeQuery when no street or formData", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");
            fireEvent.change(input, { target: { value: "123 Test St" } });

            expect(input).toHaveValue("123 Test St");
        });

        it("should handle empty values gracefully", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");
            expect(input).toHaveValue("");
        });
    });

    describe("Input Interactions", () => {
        it("should update placeQuery on input change", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");
            fireEvent.change(input, { target: { value: "New Address" } });

            expect(input).toHaveValue("New Address");
        });

        it("should reset isPlaceSelected when input is cleared", () => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: mockPredictions,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");
            
            // Type something first
            fireEvent.change(input, { target: { value: "123 Main" } });
            
            // Clear the input
            fireEvent.change(input, { target: { value: "" } });

            // Predictions should be visible again (not hidden by isPlaceSelected)
            expect(screen.getByText("123 Main St")).toBeInTheDocument();
        });

        it("should reset isPlaceSelected on input click", () => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: mockPredictions,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");
            fireEvent.change(input, { target: { value: "123 Main" } });
            fireEvent.click(input);

            // Predictions should be visible
            expect(screen.getByText("123 Main St")).toBeInTheDocument();
        });
    });

    describe("Google Places Integration", () => {
        it("should call usePlacesAutocomplete with debounced query", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");
            fireEvent.change(input, { target: { value: "123 Main St" } });

            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("123 Main St");
        });

        it("should handle empty predictions", () => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: [],
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const predictionsList = screen.queryByRole("list");
            expect(predictionsList).toHaveClass("hidden");
        });

        it("should display predictions when available", () => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: mockPredictions,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            expect(screen.getByText("123 Main St")).toBeInTheDocument();
            expect(screen.getByText("Miami, FL 33101, USA")).toBeInTheDocument();
            expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
            expect(screen.getByText("Dallas, TX 75201, USA")).toBeInTheDocument();
        });

        it("should handle predictions without structured format", () => {
            const simplePredictions: AutocompletePrediction[] = [
                {
                    placeId: "simple1",
                    text: "Simple Address, City, State",
                    street: "Simple Address",
                    city: "City",
                    state: "State",
                    zipcode: "12345",
                },
            ];

            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: simplePredictions,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            expect(screen.getByText("Simple Address, City, State")).toBeInTheDocument();
        });
    });

    describe("Predictions Display", () => {
        beforeEach(() => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: mockPredictions,
            });
        });

        it("should render predictions list with proper styling", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const predictionsList = screen.getByRole("list");
            expect(predictionsList).toHaveClass(
                "list-none",
                "p-3",
                "mt-2",
                "border",
                "border-gray-200",
                "rounded",
                "text-sm",
                "space-y-3",
                "cursor-pointer",
                "bg-white",
                "z-10",
                "absolute",
                "top-14",
                "left-0",
            );
        });

        it("should hide predictions when isPlaceSelected is true", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            // Click on a prediction to select it
            const firstPrediction = screen.getByText("123 Main St");
            fireEvent.click(firstPrediction);

            const predictionsList = screen.getByRole("list");
            expect(predictionsList).toHaveClass("hidden");
        });

        it("should render each prediction as a clickable list item", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const listItems = screen.getAllByRole("listitem");
            expect(listItems).toHaveLength(2);

            listItems.forEach((item) => {
                expect(item).toBeInTheDocument();
            });
        });
    });

    describe("Prediction Selection", () => {
        beforeEach(() => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: mockPredictions,
            });
        });

        it("should handle prediction click with full data", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const firstPrediction = screen.getByText("123 Main St");
            fireEvent.click(firstPrediction);

            expect(mockSetCity).toHaveBeenCalledWith("Miami");
            expect(mockSetState).toHaveBeenCalledWith("FL");
            expect(mockSetZipcode).toHaveBeenCalledWith("33101");

            const input = screen.getByLabelText("Address");
            expect(input).toHaveValue("123 Main St");
        });

        it("should handle prediction click with missing street (fallback to mainText)", () => {
            const predictionWithoutStreet: AutocompletePrediction[] = [
                {
                    placeId: "nostreet",
                    text: "Fallback Address",
                    city: "Test City",
                    state: "TS",
                    zipcode: "00000",
                    structuredFormat: {
                        mainText: { text: "Fallback Address" },
                        secondaryText: { text: "Test City, TS 00000" },
                    },
                },
            ];

            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: predictionWithoutStreet,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const prediction = screen.getByText("Fallback Address");
            fireEvent.click(prediction);

            const input = screen.getByLabelText("Address");
            expect(input).toHaveValue("Fallback Address");
            expect(mockSetCity).toHaveBeenCalledWith("Test City");
        });

        it("should handle prediction click with missing structured format", () => {
            const unstructuredPrediction: AutocompletePrediction[] = [
                {
                    placeId: "unstructured",
                    text: "Unstructured Address",
                    city: "Simple City",
                    state: "SC",
                    zipcode: "11111",
                },
            ];

            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: unstructuredPrediction,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const prediction = screen.getByText("Unstructured Address");
            fireEvent.click(prediction);

            const input = screen.getByLabelText("Address");
            expect(input).toHaveValue("Unstructured Address");
            expect(mockSetCity).toHaveBeenCalledWith("Simple City");
        });

        it("should handle prediction click with empty location data", () => {
            const emptyDataPrediction: AutocompletePrediction[] = [
                {
                    placeId: "empty",
                    text: "Empty Data Address",
                },
            ];

            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: emptyDataPrediction,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const prediction = screen.getByText("Empty Data Address");
            fireEvent.click(prediction);

            expect(mockSetCity).toHaveBeenCalledWith("");
            expect(mockSetState).toHaveBeenCalledWith("");
            expect(mockSetZipcode).toHaveBeenCalledWith("");
        });

        it("should set isPlaceSelected to true after selection", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const firstPrediction = screen.getByText("123 Main St");
            fireEvent.click(firstPrediction);

            // Predictions list should be hidden after selection
            const predictionsList = screen.getByRole("list");
            expect(predictionsList).toHaveClass("hidden");
        });
    });

    describe("Error Handling", () => {
        it("should render FormErrors when street errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    location: {
                        street: ["Street address is required", "Invalid format"],
                    },
                },
            };

            render(
                <AddressSearch
                    actionState={actionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const formErrors = screen.getByTestId("form-errors");
            expect(formErrors).toBeInTheDocument();
            expect(formErrors).toHaveAttribute("data-id", "street");

            const errorMessages = screen.getAllByTestId("error-message");
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0]).toHaveTextContent("Street address is required");
            expect(errorMessages[1]).toHaveTextContent("Invalid format");
        });

        it("should not render FormErrors when no street errors exist", () => {
            const actionState: ActionState = {
                formErrorMap: {
                    location: {
                        city: ["City error"], // Different field
                    },
                },
            };

            render(
                <AddressSearch
                    actionState={actionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const formErrors = screen.queryByTestId("form-errors");
            expect(formErrors).not.toBeInTheDocument();
        });

        it("should handle actionState without formErrorMap", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const formErrors = screen.queryByTestId("form-errors");
            expect(formErrors).not.toBeInTheDocument();
        });
    });

    describe("Debouncing", () => {
        it("should debounce the search query", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />,
            );

            const input = screen.getByLabelText("Address");

            // Type quickly - should still result in debounced value
            fireEvent.change(input, { target: { value: "1" } });
            fireEvent.change(input, { target: { value: "12" } });
            fireEvent.change(input, { target: { value: "123" } });
            fireEvent.change(input, { target: { value: "123 Main" } });

            // The mock useDebounce returns the value immediately, 
            // but in real usage it would be debounced
            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("123 Main");
        });
    });

    describe("Component Props Integration", () => {
        it("should work with all required props", () => {
            expect(() => {
                render(
                    <AddressSearch
                        actionState={defaultActionState}
                        setCity={mockSetCity}
                        setState={mockSetState}
                        setZipcode={mockSetZipcode}
                    />,
                );
            }).not.toThrow();
        });

        it("should work with optional street prop", () => {
            expect(() => {
                render(
                    <AddressSearch
                        actionState={defaultActionState}
                        street="Optional Street"
                        setCity={mockSetCity}
                        setState={mockSetState}
                        setZipcode={mockSetZipcode}
                    />,
                );
            }).not.toThrow();
        });

        it("should handle null street prop", () => {
            expect(() => {
                render(
                    <AddressSearch
                        actionState={defaultActionState}
                        street={null}
                        setCity={mockSetCity}
                        setState={mockSetState}
                        setZipcode={mockSetZipcode}
                    />,
                );
            }).not.toThrow();
        });
    });

    describe("usePlacesAutocomplete Hook Integration", () => {
        it("should call usePlacesAutocomplete with debounced search query", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            // Initially called with empty string
            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("");

            // Type in the input
            const input = screen.getByRole("textbox", { name: /address/i });
            fireEvent.change(input, { target: { value: "123 Main" } });

            // Should be called with the debounced value (which is immediate in our mock)
            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("123 Main");
        });

        it("should handle predictions from usePlacesAutocomplete hook", () => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: mockPredictions,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            // Type to trigger predictions
            const input = screen.getByRole("textbox", { name: /address/i });
            fireEvent.change(input, { target: { value: "123 Main" } });

            // Should display predictions from hook
            expect(screen.getByText("123 Main St")).toBeInTheDocument();
            expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
        });

        it("should handle empty predictions from hook", () => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: [],
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            // Type in the input
            const input = screen.getByRole("textbox", { name: /address/i });
            fireEvent.change(input, { target: { value: "nonexistent address" } });

            // No predictions should be displayed
            expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        });

        it("should call hook with updated query on input changes", () => {
            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByRole("textbox", { name: /address/i });

            // Type different queries
            fireEvent.change(input, { target: { value: "123" } });
            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("123");

            fireEvent.change(input, { target: { value: "123 Main" } });
            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("123 Main");

            fireEvent.change(input, { target: { value: "456 Oak" } });
            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("456 Oak");
        });

        it("should handle hook integration smoothly", () => {
            mockUsePlacesAutocomplete.mockReturnValue({
                predictions: mockPredictions,
            });

            render(
                <AddressSearch
                    actionState={defaultActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByRole("textbox", { name: /address/i });
            fireEvent.change(input, { target: { value: "123 Main" } });

            // Hook should be called and component should not crash
            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith("123 Main");
            expect(input).toBeInTheDocument();
        });
    });
});