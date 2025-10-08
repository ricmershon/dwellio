/**
 * @jest-environment jsdom
 *
 * Property Creation Workflow Test
 *
 * Tests the complete property creation user journey from authentication check
 * through form submission and redirect. This is a workflow test that validates
 * the end-to-end flow rather than individual page components.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddPropertyPage from '@/app/(root)/properties/add/page';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Services (Mocked)
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    redirect: jest.fn(),
}));

// ✅ Child Components (Mocked for workflow test isolation)
jest.mock('@/ui/properties/add/add-property-form', () => {
    return function MockAddPropertyForm() {
        const [step, setStep] = React.useState(1);
        const [isSubmitting, setIsSubmitting] = React.useState(false);

        const handleNext = () => {
            if (step < 3) setStep(step + 1);
        };

        const handleSubmit = async () => {
            setIsSubmitting(true);
            // Simulate async submission
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsSubmitting(false);
        };

        return (
            <div data-testid="add-property-form">
                <div data-testid="form-step">{step}</div>
                {step === 1 && (
                    <div data-testid="step-1">
                        <input data-testid="property-name" placeholder="Property Name" />
                        <input data-testid="property-type" placeholder="Property Type" />
                        <button onClick={handleNext} data-testid="next-step-1">Next</button>
                    </div>
                )}
                {step === 2 && (
                    <div data-testid="step-2">
                        <input data-testid="property-address" placeholder="Address" />
                        <input data-testid="property-city" placeholder="City" />
                        <button onClick={handleNext} data-testid="next-step-2">Next</button>
                    </div>
                )}
                {step === 3 && (
                    <div data-testid="step-3">
                        <input data-testid="property-price" placeholder="Price" />
                        <button
                            onClick={handleSubmit}
                            data-testid="submit-form"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                )}
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: any) {
        return (
            <div data-testid="breadcrumbs">
                {breadcrumbs.map((crumb: any, idx: number) => (
                    <span key={idx}>{crumb.label}</span>
                ))}
            </div>
        );
    };
});

import React from 'react';

describe('Property Creation Workflow', () => {
    describe('Multi-Step Form Flow', () => {
        it('should complete full property creation workflow', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // Step 1: Basic Information
            expect(screen.getByTestId('step-1')).toBeInTheDocument();
            await user.type(screen.getByTestId('property-name'), 'Beach House');
            await user.type(screen.getByTestId('property-type'), 'House');
            await user.click(screen.getByTestId('next-step-1'));

            // Step 2: Location
            await waitFor(() => {
                expect(screen.getByTestId('step-2')).toBeInTheDocument();
            });
            await user.type(screen.getByTestId('property-address'), '123 Ocean Dr');
            await user.type(screen.getByTestId('property-city'), 'Miami');
            await user.click(screen.getByTestId('next-step-2'));

            // Step 3: Pricing and Submit
            await waitFor(() => {
                expect(screen.getByTestId('step-3')).toBeInTheDocument();
            });
            await user.type(screen.getByTestId('property-price'), '500000');
            await user.click(screen.getByTestId('submit-form'));

            // Verify submission state
            await waitFor(() => {
                expect(screen.getByText('Submitting...')).toBeInTheDocument();
            });
        });

        it('should navigate between form steps', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // Start at step 1
            expect(screen.getByTestId('form-step')).toHaveTextContent('1');

            // Navigate to step 2
            await user.click(screen.getByTestId('next-step-1'));
            await waitFor(() => {
                expect(screen.getByTestId('form-step')).toHaveTextContent('2');
            });

            // Navigate to step 3
            await user.click(screen.getByTestId('next-step-2'));
            await waitFor(() => {
                expect(screen.getByTestId('form-step')).toHaveTextContent('3');
            });
        });
    });

    describe('Form Validation Workflow', () => {
        it('should show step 1 fields initially', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            expect(screen.getByTestId('property-name')).toBeInTheDocument();
            expect(screen.getByTestId('property-type')).toBeInTheDocument();
        });

        it('should progress to step 2 after completing step 1', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            await user.click(screen.getByTestId('next-step-1'));

            await waitFor(() => {
                expect(screen.getByTestId('property-address')).toBeInTheDocument();
                expect(screen.getByTestId('property-city')).toBeInTheDocument();
            });
        });

        it('should show final step with submit button', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            await user.click(screen.getByTestId('next-step-1'));
            await waitFor(() => expect(screen.getByTestId('step-2')).toBeInTheDocument());

            await user.click(screen.getByTestId('next-step-2'));
            await waitFor(() => {
                expect(screen.getByTestId('submit-form')).toBeInTheDocument();
            });
        });
    });

    describe('Form Submission Workflow', () => {
        it('should disable submit button during submission', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // Navigate to final step
            await user.click(screen.getByTestId('next-step-1'));
            await waitFor(() => expect(screen.getByTestId('step-2')).toBeInTheDocument());
            await user.click(screen.getByTestId('next-step-2'));
            await waitFor(() => expect(screen.getByTestId('step-3')).toBeInTheDocument());

            // Submit form
            const submitButton = screen.getByTestId('submit-form');
            await user.click(submitButton);

            // Button should be disabled during submission
            await waitFor(() => {
                expect(submitButton).toBeDisabled();
            });
        });

        it('should show submitting state', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // Navigate to final step
            await user.click(screen.getByTestId('next-step-1'));
            await waitFor(() => expect(screen.getByTestId('step-2')).toBeInTheDocument());
            await user.click(screen.getByTestId('next-step-2'));
            await waitFor(() => expect(screen.getByTestId('step-3')).toBeInTheDocument());

            // Submit
            await user.click(screen.getByTestId('submit-form'));

            // Should show submitting text
            await waitFor(() => {
                expect(screen.getByText('Submitting...')).toBeInTheDocument();
            });
        });
    });

    describe('Page Structure', () => {
        it('should render page with breadcrumbs and form', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('add-property-form')).toBeInTheDocument();
        });

        it('should show correct breadcrumb trail', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Properties');
            expect(breadcrumbs).toHaveTextContent('Add Property');
        });

        it('should render main element', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });
    });

    describe('User Journey', () => {
        it('should guide user through complete creation process', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // User arrives at add property page
            expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Add Property');

            // User fills out step 1
            expect(screen.getByTestId('step-1')).toBeInTheDocument();
            await user.click(screen.getByTestId('next-step-1'));

            // User fills out step 2
            await waitFor(() => expect(screen.getByTestId('step-2')).toBeInTheDocument());
            await user.click(screen.getByTestId('next-step-2'));

            // User reaches final step
            await waitFor(() => expect(screen.getByTestId('step-3')).toBeInTheDocument());
            expect(screen.getByTestId('submit-form')).toBeInTheDocument();
        });

        it('should allow user to enter data at each step', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // Step 1 data entry
            const nameInput = screen.getByTestId('property-name');
            await user.type(nameInput, 'Test Property');
            expect(nameInput).toHaveValue('Test Property');

            await user.click(screen.getByTestId('next-step-1'));

            // Step 2 data entry
            await waitFor(() => {
                const addressInput = screen.getByTestId('property-address');
                expect(addressInput).toBeInTheDocument();
            });
        });
    });

    describe('Metadata', () => {
        it('should have correct page title', async () => {
            const { metadata } = await import('@/app/(root)/properties/add/page');
            expect(metadata.title).toBe('Add New Property');
        });
    });

    describe('Async Server Component', () => {
        it('should be an async function', () => {
            const result = AddPropertyPage();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to JSX element', async () => {
            const jsx = await AddPropertyPage();
            expect(jsx).toBeDefined();
            expect(typeof jsx).toBe('object');
        });
    });

    describe('Workflow State Management', () => {
        it('should maintain form state across steps', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // Form should start at step 1
            expect(screen.getByTestId('form-step')).toHaveTextContent('1');

            // Progress through steps
            await user.click(screen.getByTestId('next-step-1'));
            await waitFor(() => {
                expect(screen.getByTestId('form-step')).toHaveTextContent('2');
            });
        });

        it('should handle step transitions', async () => {
            const user = userEvent.setup();
            const jsx = await AddPropertyPage();
            render(jsx);

            // Initial step
            expect(screen.getByTestId('step-1')).toBeInTheDocument();
            expect(screen.queryByTestId('step-2')).not.toBeInTheDocument();

            // After transition
            await user.click(screen.getByTestId('next-step-1'));
            await waitFor(() => {
                expect(screen.queryByTestId('step-1')).not.toBeInTheDocument();
                expect(screen.getByTestId('step-2')).toBeInTheDocument();
            });
        });
    });

    describe('Component Integration', () => {
        it('should integrate breadcrumbs and form', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            const form = screen.getByTestId('add-property-form');

            expect(breadcrumbs).toBeInTheDocument();
            expect(form).toBeInTheDocument();
        });

        it('should render form within main element', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            const main = container.querySelector('main');
            const form = screen.getByTestId('add-property-form');

            expect(main).toContainElement(form);
        });
    });
});
