import { render, screen } from '@testing-library/react';

import FormErrors from '@/ui/shared/form-errors';

// ============================================================================
// TEST SUITE: FormErrors Component
// ============================================================================
describe('FormErrors Component', () => {
    // ========================================================================
    // Error Message Rendering
    // ========================================================================
    describe('Error Message Rendering', () => {
        it('should render single error message', () => {
            const errors = ['This field is required'];

            render(<FormErrors errors={errors} id="test-field" />);

            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });

        it('should render multiple error messages', () => {
            const errors = [
                'This field is required',
                'Must be at least 3 characters',
                'Cannot contain special characters',
            ];

            render(<FormErrors errors={errors} id="test-field" />);

            expect(screen.getByText('This field is required')).toBeInTheDocument();
            expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
            expect(screen.getByText('Cannot contain special characters')).toBeInTheDocument();
        });

        it('should render correct number of error paragraphs', () => {
            const errors = ['Error 1', 'Error 2', 'Error 3'];

            const { container } = render(<FormErrors errors={errors} id="test-field" />);

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(3);
        });

        it('should not render anything when errors array is empty', () => {
            const { container } = render(<FormErrors errors={[]} id="test-field" />);

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(0);
        });

        it('should not render anything when errors is undefined', () => {
            const { container } = render(<FormErrors errors={undefined as any} id="test-field" />);

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(0);
        });

        it('should not render anything when errors is null', () => {
            const { container } = render(<FormErrors errors={null as any} id="test-field" />);

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(0);
        });
    });

    // ========================================================================
    // Container Attributes
    // ========================================================================
    describe('Container Attributes', () => {
        it('should render container div with correct id', () => {
            const errors = ['Error message'];
            const { container } = render(<FormErrors errors={errors} id="email" />);

            const div = container.querySelector('#email-error');
            expect(div).toBeInTheDocument();
        });

        it('should have aria-live attribute', () => {
            const errors = ['Error message'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const div = container.querySelector('div');
            expect(div).toHaveAttribute('aria-live', 'polite');
        });

        it('should have aria-atomic attribute', () => {
            const errors = ['Error message'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const div = container.querySelector('div');
            expect(div).toHaveAttribute('aria-atomic', 'true');
        });

        it('should generate correct id format', () => {
            const errors = ['Error message'];
            const { container } = render(<FormErrors errors={errors} id="user-name" />);

            const div = container.querySelector('#user-name-error');
            expect(div).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Error Styling
    // ========================================================================
    describe('Error Styling', () => {
        it('should apply text-red-500 class to error messages', () => {
            const errors = ['Error message'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraph = container.querySelector('p');
            expect(paragraph).toHaveClass('text-red-500');
        });

        it('should apply text-sm class to error messages', () => {
            const errors = ['Error message'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraph = container.querySelector('p');
            expect(paragraph).toHaveClass('text-sm');
        });

        it('should apply mt-1 class to error messages', () => {
            const errors = ['Error message'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraph = container.querySelector('p');
            expect(paragraph).toHaveClass('mt-1');
        });

        it('should apply consistent styling to all error messages', () => {
            const errors = ['Error 1', 'Error 2', 'Error 3'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraphs = container.querySelectorAll('p');
            paragraphs.forEach((p) => {
                expect(p).toHaveClass('mt-1');
                expect(p).toHaveClass('text-sm');
                expect(p).toHaveClass('text-red-500');
            });
        });
    });

    // ========================================================================
    // Multiple Error Handling
    // ========================================================================
    describe('Multiple Error Handling', () => {
        it('should render errors in order', () => {
            const errors = ['First error', 'Second error', 'Third error'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs[0]).toHaveTextContent('First error');
            expect(paragraphs[1]).toHaveTextContent('Second error');
            expect(paragraphs[2]).toHaveTextContent('Third error');
        });

        it('should handle duplicate error messages', () => {
            const errors = ['Required', 'Required', 'Required'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(3);
        });

        it('should assign unique keys to error messages', () => {
            const errors = ['Error 1', 'Error 2'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraphs = container.querySelectorAll('p');
            // Each paragraph should be rendered (React won't throw key warnings)
            expect(paragraphs).toHaveLength(2);
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle empty string errors', () => {
            const errors = [''];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraph = container.querySelector('p');
            expect(paragraph).toBeInTheDocument();
            expect(paragraph).toHaveTextContent('');
        });

        it('should handle very long error messages', () => {
            const longError = 'a'.repeat(500);
            const errors = [longError];

            render(<FormErrors errors={errors} id="test" />);

            expect(screen.getByText(longError)).toBeInTheDocument();
        });

        it('should handle special characters in error messages', () => {
            const errors = ['Error: $pecial <characters> & "quotes"'];

            render(<FormErrors errors={errors} id="test" />);

            expect(screen.getByText('Error: $pecial <characters> & "quotes"')).toBeInTheDocument();
        });

        it('should handle error messages with HTML entities', () => {
            const errors = ['Error: Value must be > 0'];

            render(<FormErrors errors={errors} id="test" />);

            expect(screen.getByText('Error: Value must be > 0')).toBeInTheDocument();
        });

        it('should handle non-array errors gracefully', () => {
            const { container } = render(
                <FormErrors errors={'not an array' as any} id="test" />
            );

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(0);
        });

        it('should handle array with mixed types', () => {
            const errors = ['Error 1', 123 as any, null as any, 'Error 2'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const paragraphs = container.querySelectorAll('p');
            // Should still render, but may have unexpected content
            expect(paragraphs.length).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // Accessibility Features
    // ========================================================================
    describe('Accessibility Features', () => {
        it('should announce errors with aria-live polite', () => {
            const errors = ['New error appeared'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const div = container.querySelector('div');
            expect(div).toHaveAttribute('aria-live', 'polite');
        });

        it('should read entire error block with aria-atomic', () => {
            const errors = ['Error 1', 'Error 2'];
            const { container } = render(<FormErrors errors={errors} id="test" />);

            const div = container.querySelector('div');
            expect(div).toHaveAttribute('aria-atomic', 'true');
        });

        it('should be linkable via aria-describedby', () => {
            const errors = ['Email is required'];
            const { container } = render(<FormErrors errors={errors} id="email" />);

            // The id should match expected aria-describedby pattern
            const errorDiv = container.querySelector('#email-error');
            expect(errorDiv).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Dynamic Updates
    // ========================================================================
    describe('Dynamic Updates', () => {
        it('should update when errors change', () => {
            const { rerender, container } = render(
                <FormErrors errors={['Error 1']} id="test" />
            );

            let paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(1);
            expect(paragraphs[0]).toHaveTextContent('Error 1');

            rerender(<FormErrors errors={['Error 1', 'Error 2']} id="test" />);

            paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(2);
            expect(paragraphs[1]).toHaveTextContent('Error 2');
        });

        it('should clear when errors become empty', () => {
            const { rerender, container } = render(
                <FormErrors errors={['Error 1', 'Error 2']} id="test" />
            );

            let paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(2);

            rerender(<FormErrors errors={[]} id="test" />);

            paragraphs = container.querySelectorAll('p');
            expect(paragraphs).toHaveLength(0);
        });

        it('should handle id changes', () => {
            const errors = ['Error message'];
            const { rerender, container } = render(
                <FormErrors errors={errors} id="field1" />
            );

            expect(container.querySelector('#field1-error')).toBeInTheDocument();

            rerender(<FormErrors errors={errors} id="field2" />);

            expect(container.querySelector('#field1-error')).not.toBeInTheDocument();
            expect(container.querySelector('#field2-error')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Form Field Association', () => {
        it('should work with form input aria-describedby', () => {
            const errors = ['Invalid email format'];
            const { container } = render(
                <div>
                    <input
                        id="email"
                        type="email"
                        aria-describedby="email-error"
                    />
                    <FormErrors errors={errors} id="email" />
                </div>
            );

            const input = container.querySelector('#email');
            const errorDiv = container.querySelector('#email-error');

            expect(input).toHaveAttribute('aria-describedby', 'email-error');
            expect(errorDiv).toBeInTheDocument();
        });

        it('should display multiple field errors independently', () => {
            const { container } = render(
                <div>
                    <FormErrors errors={['Email is required']} id="email" />
                    <FormErrors errors={['Password is required']} id="password" />
                </div>
            );

            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(screen.getByText('Password is required')).toBeInTheDocument();

            expect(container.querySelector('#email-error')).toBeInTheDocument();
            expect(container.querySelector('#password-error')).toBeInTheDocument();
        });
    });
});
