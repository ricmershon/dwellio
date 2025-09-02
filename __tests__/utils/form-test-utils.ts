/**
 * Shared form testing utilities to reduce duplicate form validation tests
 */
import { screen } from '@testing-library/react';

/**
 * Verifies standard form structure and styling
 */
export const expectFormStructure = (container: HTMLElement) => {
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('inline-block');
};

/**
 * Verifies submit button properties
 */
export const expectSubmitButton = (buttonName: string = 'submit') => {
    const button = screen.getByRole('button', { name: new RegExp(buttonName, 'i') });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
    return button;
};

/**
 * Verifies delete button specific properties
 */
export const expectDeleteButton = () => {
    const button = expectSubmitButton('delete');
    expect(button).toHaveClass('btn', 'btn-danger');
    return button;
};

/**
 * Verifies standard form and button structure for action components
 */
export const expectActionFormStructure = (container: HTMLElement, buttonName: string) => {
    expectFormStructure(container);
    return expectSubmitButton(buttonName);
};