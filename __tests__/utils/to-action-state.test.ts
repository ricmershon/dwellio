import { ActionState } from '@/types';
import { toActionState } from '@/utils/to-action-state';

describe('Action State Management', () => {
    describe('toActionState', () => {
        it('should create success state with data', () => {
            const input: ActionState = {
                status: 'success',
                message: 'Operation completed successfully',
                userId: 'user-123',
                formData: new FormData()
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: 'success',
                message: 'Operation completed successfully',
                userId: 'user-123',
                formData: expect.any(FormData)
            });
        });

        it('should create error state with messages', () => {
            const input: ActionState = {
                status: 'error',
                message: 'Validation failed',
                formErrorMap: {
                    name: ['Name is required'],
                    email: ['Invalid email format']
                }
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: 'error',
                message: 'Validation failed',
                formErrorMap: {
                    name: ['Name is required'],
                    email: ['Invalid email format']
                }
            });
        });

        it('should handle loading state transitions', () => {
            const input: ActionState = {
                status: 'info',
                message: 'Processing request...'
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: 'info',
                message: 'Processing request...'
            });
        });

        it('should preserve boolean flags correctly', () => {
            const input: ActionState = {
                isFavorite: true,
                isRead: false,
                isAccountLinked: true,
                shouldAutoLogin: false
            };

            const result = toActionState(input);

            expect(result).toEqual({
                isFavorite: true,
                isRead: false,
                isAccountLinked: true,
                shouldAutoLogin: false
            });
        });

        it('should handle authentication-related properties', () => {
            const input: ActionState = {
                email: 'user@example.com',
                password: 'hashedPassword123',
                canSignInWith: ['google', 'credentials'],
                isAccountLinked: false
            };

            const result = toActionState(input);

            expect(result).toEqual({
                email: 'user@example.com',
                password: 'hashedPassword123',
                canSignInWith: ['google', 'credentials'],
                isAccountLinked: false
            });
        });

        it('should exclude undefined and null properties', () => {
            const input: ActionState = {
                status: 'success',
                message: undefined,
                userId: undefined,
                isFavorite: true,
                isRead: undefined,
                formData: undefined
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: 'success',
                isFavorite: true
            });
        });

        it('should handle empty input object', () => {
            const input: ActionState = {};

            const result = toActionState(input);

            expect(result).toEqual({});
        });

        it('should validate string properties and warn on invalid types', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const input: ActionState = {
                status: 123 as any, // Invalid type
                message: true as any, // Invalid type
                userId: ['not-a-string'] as any, // Invalid type
                email: { invalid: 'object' } as any, // Invalid type
                password: 42 as any // Invalid type
            };

            const result = toActionState(input);

            expect(result).toEqual({});

            expect(consoleSpy).toHaveBeenCalledWith('toActionState: status property is not a string');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: message property is not a string');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: userId property is not a string');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: email property is not a string');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: password property is not a string');

            consoleSpy.mockRestore();
        });

        it('should validate boolean properties and warn on invalid types', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const input: ActionState = {
                isFavorite: 'true' as any, // Invalid type
                isRead: 1 as any, // Invalid type
                isAccountLinked: 'false' as any, // Invalid type
                shouldAutoLogin: 0 as any // Invalid type
            };

            const result = toActionState(input);

            expect(result).toEqual({});

            expect(consoleSpy).toHaveBeenCalledWith('toActionState: isFavorite property is not a boolean');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: isRead property is not a boolean');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: isAccountLinked property is not a boolean');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: shouldAutoLogin property is not a boolean');

            consoleSpy.mockRestore();
        });

        it('should validate object properties and warn on invalid types', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const input: ActionState = {
                formErrorMap: 'not-an-object' as any, // Invalid type
                canSignInWith: 'not-an-array' as any // Invalid type
            };

            const result = toActionState(input);

            expect(result).toEqual({});

            expect(consoleSpy).toHaveBeenCalledWith('toActionState: formErrorMap property is not an object');
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: canSignInWith property is not an array');

            consoleSpy.mockRestore();
        });

        it('should handle null actionState parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = toActionState(null as any);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: actionState parameter is null or undefined');

            consoleSpy.mockRestore();
        });

        it('should handle undefined actionState parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = toActionState(undefined as any);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: actionState parameter is null or undefined');

            consoleSpy.mockRestore();
        });

        it('should handle non-object actionState parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = toActionState('not-an-object' as any);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: actionState parameter is not an object');

            consoleSpy.mockRestore();
        });

        it('should copy arrays instead of referencing them', () => {
            const originalArray = ['google', 'facebook'];
            const input: ActionState = {
                canSignInWith: originalArray
            };

            const result = toActionState(input);

            expect(result.canSignInWith).toEqual(originalArray);
            expect(result.canSignInWith).not.toBe(originalArray); // Different reference
        });

        it('should handle processing errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Create an object that will cause an error during destructuring
            const problematicInput = {};
            Object.defineProperty(problematicInput, 'status', {
                get() {
                    throw new Error('Property access error');
                }
            });

            const result = toActionState(problematicInput as any);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith('toActionState: error processing actionState:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should handle complex nested formErrorMap objects', () => {
            const input: ActionState = {
                status: 'error',
                formErrorMap: {
                    location: {
                        street: ['Street is required'],
                        city: ['City is required']
                    },
                    rates: {
                        nightly: ['Nightly rate must be positive']
                    },
                    simpleField: ['Simple error message']
                }
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: 'error',
                formErrorMap: {
                    location: {
                        street: ['Street is required'],
                        city: ['City is required']
                    },
                    rates: {
                        nightly: ['Nightly rate must be positive']
                    },
                    simpleField: ['Simple error message']
                }
            });
        });

        it('should preserve FormData objects correctly', () => {
            const formData = new FormData();
            formData.append('name', 'Test Property');
            formData.append('description', 'Test Description');

            const input: ActionState = {
                formData: formData,
                status: 'info'
            };

            const result = toActionState(input);

            expect(result.formData).toBe(formData); // Should be the same reference
            expect(result.status).toBe('info');
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle property creation success state', () => {
            const input: ActionState = {
                status: 'success',
                message: 'Property created successfully',
                formData: new FormData()
            };

            const result = toActionState(input);

            expect(result.status).toBe('success');
            expect(result.message).toBe('Property created successfully');
            expect(result.formData).toBeInstanceOf(FormData);
        });

        it('should handle property creation validation errors', () => {
            const input: ActionState = {
                status: 'error',
                message: 'Validation failed',
                formErrorMap: {
                    name: ['Property name must be at least 10 characters long'],
                    description: ['Description must be at least 20 characters long'],
                    location: {
                        street: ['Street address is required'],
                        city: ['City is required']
                    },
                    rates: {
                        nightly: ['Nightly rate must be greater than 0']
                    },
                    images: ['At least 3 images are required']
                }
            };

            const result = toActionState(input);

            expect(result.status).toBe('error');
            expect(result.message).toBe('Validation failed');
            expect(result.formErrorMap).toEqual(input.formErrorMap);
        });

        it('should handle message toggle state changes', () => {
            const input: ActionState = {
                status: 'success',
                message: 'Message status updated',
                isRead: true
            };

            const result = toActionState(input);

            expect(result.status).toBe('success');
            expect(result.message).toBe('Message status updated');
            expect(result.isRead).toBe(true);
        });

        it('should handle property favorite toggle state', () => {
            const input: ActionState = {
                status: 'success',
                message: 'Property added to favorites',
                isFavorite: true,
                userId: 'user-123'
            };

            const result = toActionState(input);

            expect(result.status).toBe('success');
            expect(result.message).toBe('Property added to favorites');
            expect(result.isFavorite).toBe(true);
            expect(result.userId).toBe('user-123');
        });

        it('should handle authentication state transitions', () => {
            const input: ActionState = {
                status: 'success',
                message: 'Account linked successfully',
                email: 'user@example.com',
                isAccountLinked: true,
                shouldAutoLogin: true,
                canSignInWith: ['google', 'credentials']
            };

            const result = toActionState(input);

            expect(result.status).toBe('success');
            expect(result.message).toBe('Account linked successfully');
            expect(result.email).toBe('user@example.com');
            expect(result.isAccountLinked).toBe(true);
            expect(result.shouldAutoLogin).toBe(true);
            expect(result.canSignInWith).toEqual(['google', 'credentials']);
        });

        it('should handle state transitions during form submission', () => {
            // Initial state
            const pendingInput: ActionState = {
                status: 'info',
                message: 'Submitting form...'
            };

            const pendingResult = toActionState(pendingInput);
            expect(pendingResult.status).toBe('info');

            // Success state
            const successInput: ActionState = {
                status: 'success',
                message: 'Form submitted successfully'
            };

            const successResult = toActionState(successInput);
            expect(successResult.status).toBe('success');

            // Error state
            const errorInput: ActionState = {
                status: 'error',
                message: 'Form submission failed',
                formErrorMap: {
                    server: ['Internal server error']
                }
            };

            const errorResult = toActionState(errorInput);
            expect(errorResult.status).toBe('error');
            expect(errorResult.formErrorMap).toBeDefined();
        });
    });
});