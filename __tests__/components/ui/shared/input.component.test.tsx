import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from '@/ui/shared/input';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ Keep FormErrors component real (internal dependency)
// No mocking required for this component

// ============================================================================
// TEST SUITE: Input Component
// ============================================================================
describe('Input Component', () => {
    // ========================================================================
    // Input Type Rendering
    // ========================================================================
    describe('Input Type Rendering', () => {
        it('should render textarea element by default', () => {
            render(<Input id="test" />);

            const input = screen.getByRole('textbox');
            expect(input.tagName).toBe('TEXTAREA');
        });

        it('should render input element when inputType is "input"', () => {
            render(<Input inputType="input" id="test" />);

            const input = screen.getByRole('textbox');
            expect(input.tagName).toBe('INPUT');
        });

        it('should render textarea element when inputType is "textarea"', () => {
            render(<Input inputType="textarea" id="test" />);

            const textarea = screen.getByRole('textbox');
            expect(textarea.tagName).toBe('TEXTAREA');
        });

        it('should set rows attribute for textarea', () => {
            render(<Input inputType="textarea" id="test" />);

            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('rows', '4');
        });
    });

    // ========================================================================
    // Basic Attributes
    // ========================================================================
    describe('Basic Attributes', () => {
        it('should set id attribute', () => {
            render(<Input id="test-input" />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('id', 'test-input');
        });

        it('should set type attribute for input', () => {
            render(<Input inputType="input" id="test" type="email" />);

            const input = document.querySelector('#test') as HTMLInputElement;
            expect(input).toHaveAttribute('type', 'email');
        });

        it('should set name attribute', () => {
            render(<Input id="test" name="username" />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('name', 'username');
        });

        it('should set placeholder', () => {
            render(<Input id="test" placeholder="Enter your name" />);

            expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
        });

        it('should set defaultValue', () => {
            render(<Input id="test" defaultValue="Initial value" />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('Initial value');
        });

        it('should set required attribute', () => {
            render(<Input id="test" required={true} />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('required');
        });

        it('should not set required when false', () => {
            render(<Input id="test" required={false} />);

            const input = screen.getByRole('textbox');
            expect(input).not.toHaveAttribute('required');
        });
    });

    // ========================================================================
    // Label Handling
    // ========================================================================
    describe('Label Handling', () => {
        it('should render label when provided', () => {
            render(<Input id="test" label="Username" />);

            expect(screen.getByText('Username')).toBeInTheDocument();
        });

        it('should not render label when not provided', () => {
            const { container } = render(<Input id="test" />);

            const label = container.querySelector('label');
            expect(label).not.toBeInTheDocument();
        });

        it('should associate label with input via htmlFor', () => {
            render(<Input id="email-input" label="Email Address" />);

            const label = screen.getByText('Email Address');
            expect(label).toHaveAttribute('for', 'email-input');
        });

        it('should apply label styling', () => {
            render(<Input id="test" label="Test Label" />);

            const label = screen.getByText('Test Label');
            expect(label).toHaveClass('mb-1');
            expect(label).toHaveClass('block');
            expect(label).toHaveClass('text-sm');
            expect(label).toHaveClass('text-gray-700');
        });
    });

    // ========================================================================
    // Error Display
    // ========================================================================
    describe('Error Display', () => {
        it('should render FormErrors when errors provided', () => {
            const errors = ['This field is required'];

            render(<Input id="test" errors={errors} />);

            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });

        it('should not render FormErrors when no errors', () => {
            const { container } = render(<Input id="test" />);

            const errorDiv = container.querySelector('[id$="-error"]');
            expect(errorDiv).not.toBeInTheDocument();
        });

        it('should display multiple errors', () => {
            const errors = ['Required field', 'Must be valid email'];

            render(<Input id="email" errors={errors} />);

            expect(screen.getByText('Required field')).toBeInTheDocument();
            expect(screen.getByText('Must be valid email')).toBeInTheDocument();
        });

        it('should pass correct id to FormErrors', () => {
            const errors = ['Error message'];
            const { container } = render(<Input id="username" errors={errors} />);

            const errorDiv = container.querySelector('#username-error');
            expect(errorDiv).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Accessibility Attributes
    // ========================================================================
    describe('Accessibility Attributes', () => {
        it('should set aria-describedby for input', () => {
            render(<Input id="test-field" />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('aria-describedby', 'test-field-error');
        });

        it('should set aria-describedby for textarea', () => {
            render(<Input inputType="textarea" id="description" />);

            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('aria-describedby', 'description-error');
        });

        it('should link to error container via aria-describedby', () => {
            const errors = ['Invalid input'];
            render(<Input id="email" errors={errors} />);

            const input = screen.getByRole('textbox');
            const errorDiv = document.querySelector('#email-error');

            expect(input).toHaveAttribute('aria-describedby', 'email-error');
            expect(errorDiv).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Container Styling
    // ========================================================================
    describe('Container Styling', () => {
        it('should apply mb-4 by default', () => {
            const { container } = render(<Input id="test" />);

            const wrapper = container.querySelector('div');
            expect(wrapper).toHaveClass('mb-4');
        });

        it('should apply mb-2 when isInGroup is true', () => {
            const { container } = render(<Input id="test" isInGroup={true} />);

            const wrapper = container.querySelector('div');
            expect(wrapper).toHaveClass('mb-2');
            expect(wrapper).not.toHaveClass('mb-4');
        });

        it('should apply no classes when noClasses is true', () => {
            const { container } = render(<Input id="test" noClasses={true} />);

            const wrapper = container.querySelector('div');
            expect(wrapper?.className).toBe('');
        });

        it('should prioritize noClasses over isInGroup', () => {
            const { container } = render(<Input id="test" noClasses={true} isInGroup={true} />);

            const wrapper = container.querySelector('div');
            expect(wrapper?.className).toBe('');
        });
    });

    // ========================================================================
    // Input Element Styling
    // ========================================================================
    describe('Input Element Styling', () => {
        it('should apply standard input classes', () => {
            render(<Input id="test" />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('w-full');
            expect(input).toHaveClass('rounded-md');
            expect(input).toHaveClass('border');
            expect(input).toHaveClass('border-gray-300');
            expect(input).toHaveClass('py-2');
            expect(input).toHaveClass('px-3');
            expect(input).toHaveClass('text-sm');
            expect(input).toHaveClass('placeholder:text-gray-500');
        });

        it('should apply same classes to textarea', () => {
            render(<Input inputType="textarea" id="test" />);

            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveClass('w-full');
            expect(textarea).toHaveClass('rounded-md');
            expect(textarea).toHaveClass('border');
            expect(textarea).toHaveClass('border-gray-300');
            expect(textarea).toHaveClass('py-2');
            expect(textarea).toHaveClass('px-3');
            expect(textarea).toHaveClass('text-sm');
            expect(textarea).toHaveClass('placeholder:text-gray-500');
        });
    });

    // ========================================================================
    // User Interaction
    // ========================================================================
    describe('User Interaction', () => {
        it('should allow typing in input', async () => {
            const user = userEvent.setup();
            render(<Input id="test" />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            await user.type(input, 'Hello World');

            expect(input.value).toBe('Hello World');
        });

        it('should allow typing in textarea', async () => {
            const user = userEvent.setup();
            render(<Input inputType="textarea" id="test" />);

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            await user.type(textarea, 'Multi\nline\ntext');

            expect(textarea.value).toBe('Multi\nline\ntext');
        });

        it('should respect defaultValue', async () => {
            const user = userEvent.setup();
            render(<Input id="test" defaultValue="Initial" />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            await user.type(input, ' text');

            expect(input.value).toBe('Initial text');
        });

        it('should clear input value', async () => {
            const user = userEvent.setup();
            render(<Input id="test" defaultValue="To be cleared" />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            await user.clear(input);

            expect(input.value).toBe('');
        });
    });

    // ========================================================================
    // Rest Props Spreading
    // ========================================================================
    describe('Rest Props Spreading', () => {
        it('should pass through additional props to input', () => {
            render(<Input id="test" data-testid="custom-input" maxLength={10} />);

            const input = screen.getByTestId('custom-input');
            expect(input).toHaveAttribute('maxLength', '10');
        });

        it('should pass through additional props to textarea', () => {
            render(
                <Input
                    inputType="textarea"
                    id="test"
                    data-testid="custom-textarea"
                    maxLength={200}
                />
            );

            const textarea = screen.getByTestId('custom-textarea');
            expect(textarea).toHaveAttribute('maxLength', '200');
        });

        it('should handle custom className in rest props', () => {
            render(<Input id="test" className="custom-class" />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('custom-class');
        });

        it('should handle onChange handler', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(<Input id="test" onChange={handleChange} />);

            const input = screen.getByRole('textbox');
            await user.type(input, 'a');

            expect(handleChange).toHaveBeenCalled();
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle empty strings for all text props', () => {
            render(
                <Input
                    id="test"
                    name=""
                    label=""
                    placeholder=""
                    defaultValue=""
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });

        it('should handle undefined type', () => {
            render(<Input id="test" type={undefined} />);

            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
        });

        it('should handle number type input', () => {
            const { container } = render(<Input inputType="input" id="test" type="number" />);

            const input = container.querySelector('#test');
            expect(input).toHaveAttribute('type', 'number');
        });

        it('should handle password type input', () => {
            const { container } = render(<Input inputType="input" id="test" type="password" />);

            const input = container.querySelector('#test');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('should handle empty errors array', () => {
            const { container } = render(<Input id="test" errors={[]} />);

            const errorMessages = container.querySelectorAll('p');
            expect(errorMessages).toHaveLength(0);
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Form Field', () => {
        it('should render complete form field with all features', () => {
            const errors = ['Invalid email'];

            render(
                <Input
                    inputType="input"
                    id="email"
                    type="email"
                    name="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    defaultValue="test@example.com"
                    required={true}
                    errors={errors}
                />
            );

            expect(screen.getByText('Email Address')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
            expect(screen.getByText('Invalid email')).toBeInTheDocument();

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('test@example.com');
            expect(input).toHaveAttribute('required');
            expect(input).toHaveAttribute('aria-describedby', 'email-error');
        });

        it('should render complete textarea field', () => {
            render(
                <Input
                    inputType="textarea"
                    id="description"
                    name="description"
                    label="Description"
                    placeholder="Enter description"
                    required={true}
                />
            );

            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();

            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('rows', '4');
            expect(textarea).toHaveAttribute('required');
        });

        it('should handle form field in group', () => {
            const { container } = render(
                <div>
                    <Input id="city" label="City" isInGroup={true} />
                    <Input id="state" label="State" isInGroup={true} />
                    <Input id="zip" label="ZIP" isInGroup={false} />
                </div>
            );

            // Find the direct wrapper divs for each input (not nested)
            const cityWrapper = container.querySelector('#city')?.parentElement;
            const stateWrapper = container.querySelector('#state')?.parentElement;
            const zipWrapper = container.querySelector('#zip')?.parentElement;

            expect(cityWrapper).toHaveClass('mb-2'); // city (in group)
            expect(stateWrapper).toHaveClass('mb-2'); // state (in group)
            expect(zipWrapper).toHaveClass('mb-4'); // zip (not in group)
        });
    });

    // ========================================================================
    // Dynamic Updates
    // ========================================================================
    describe('Dynamic Updates', () => {
        it('should update errors dynamically', () => {
            const { rerender } = render(<Input id="test" />);

            expect(screen.queryByText('Error 1')).not.toBeInTheDocument();

            rerender(<Input id="test" errors={['Error 1']} />);

            expect(screen.getByText('Error 1')).toBeInTheDocument();
        });

        it('should switch between input and textarea', () => {
            const { rerender } = render(<Input inputType="input" id="test" />);

            let input = screen.getByRole('textbox');
            expect(input.tagName).toBe('INPUT');

            rerender(<Input inputType="textarea" id="test" />);

            input = screen.getByRole('textbox');
            expect(input.tagName).toBe('TEXTAREA');
        });
    });
});
