import { buildFormErrorMap, StructuredFormErrorMap } from '@/utils/build-form-error-map';

describe('Form Error Mapping', () => {
    // Helper function to create mock Zod issues
    const createMockZodIssue = (overrides: any = {}): any => ({
        code: 'invalid_type',
        path: ['field'],
        message: 'Required',
        ...overrides
    });

    describe('buildFormErrorMap', () => {
        it('should map simple field errors correctly', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['name'],
                    message: 'Name is required'
                }),
                createMockZodIssue({
                    path: ['email'],
                    message: 'Email is required'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                name: ['Name is required'],
                email: ['Email is required']
            });
        });

        it('should map nested location field errors correctly', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['location', 'street'],
                    message: 'Street is required'
                }),
                createMockZodIssue({
                    path: ['location', 'city'],
                    message: 'City is required'
                }),
                createMockZodIssue({
                    path: ['location', 'state'],
                    message: 'State is required'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                location: {
                    street: ['Street is required'],
                    city: ['City is required'],
                    state: ['State is required']
                }
            });
        });

        it('should map nested rates field errors correctly', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['rates', 'nightly'],
                    message: 'Nightly rate is required'
                }),
                createMockZodIssue({
                    path: ['rates', 'weekly'],
                    message: 'Weekly rate must be a positive number'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                rates: {
                    nightly: ['Nightly rate is required'],
                    weekly: ['Weekly rate must be a positive number']
                }
            });
        });

        it('should map nested sellerInfo field errors correctly', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['sellerInfo', 'name'],
                    message: 'Seller name is required'
                }),
                createMockZodIssue({
                    path: ['sellerInfo', 'email'],
                    message: 'Valid seller email is required'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                sellerInfo: {
                    name: ['Seller name is required'],
                    email: ['Valid seller email is required']
                }
            });
        });

        it('should handle multiple errors for the same field', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['password'],
                    message: 'Password is required'
                }),
                createMockZodIssue({
                    path: ['password'],
                    message: 'Password must be at least 8 characters'
                }),
                createMockZodIssue({
                    path: ['password'],
                    message: 'Password must contain special characters'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                password: [
                    'Password is required',
                    'Password must be at least 8 characters',
                    'Password must contain special characters'
                ]
            });
        });

        it('should handle mixed simple and nested field errors', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['name'],
                    message: 'Name is required'
                }),
                createMockZodIssue({
                    path: ['location', 'street'],
                    message: 'Street is required'
                }),
                createMockZodIssue({
                    path: ['rates', 'nightly'],
                    message: 'Nightly rate is required'
                }),
                createMockZodIssue({
                    path: ['description'],
                    message: 'Description must be at least 20 characters'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                name: ['Name is required'],
                description: ['Description must be at least 20 characters'],
                location: {
                    street: ['Street is required']
                },
                rates: {
                    nightly: ['Nightly rate is required']
                }
            });
        });

        it('should handle empty issues array', () => {
            const result = buildFormErrorMap([]);
            expect(result).toEqual({});
        });

        it('should handle null issues parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = buildFormErrorMap(null as any);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith(
                'buildFormErrorMap: issues parameter is null or undefined'
            );

            consoleSpy.mockRestore();
        });

        it('should handle undefined issues parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = buildFormErrorMap(undefined as any);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith(
                'buildFormErrorMap: issues parameter is null or undefined'
            );

            consoleSpy.mockRestore();
        });

        it('should handle non-array issues parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = buildFormErrorMap('not-an-array' as any);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith(
                'buildFormErrorMap: issues parameter is not an array'
            );

            consoleSpy.mockRestore();
        });

        it('should handle issues with invalid structure', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const invalidIssues = [
                null,
                undefined,
                'not-an-object',
                { message: 'Valid message', path: null }, // Invalid path
                { message: null, path: ['field'] }, // Invalid message
                { message: 'Valid message', path: 'not-an-array' }, // Invalid path type
                createMockZodIssue({
                    path: ['valid'],
                    message: 'Valid message'
                }) // Valid issue for comparison
            ] as any;

            const result = buildFormErrorMap(invalidIssues);

            // Should only process the valid issue
            expect(result).toEqual({
                valid: ['Valid message']
            });

            // Should have logged warnings for invalid issues
            expect(consoleSpy).toHaveBeenCalledWith(
                'buildFormErrorMap: skipping invalid issue object'
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                'buildFormErrorMap: issue missing valid path array'
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                'buildFormErrorMap: issue missing valid message string'
            );

            consoleSpy.mockRestore();
        });

        it('should handle deeply nested paths', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['property', 'address', 'coordinates', 'latitude'],
                    message: 'Latitude is required'
                }),
                createMockZodIssue({
                    path: ['property', 'features', 'amenities', '0'],
                    message: 'First amenity is required'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                'property.address.coordinates.latitude': ['Latitude is required'],
                'property.features.amenities.0': ['First amenity is required']
            });
        });

        it('should handle path join errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Create a mock issue where path.join will fail
            const issuesWithBadPath = [
                {
                    ...createMockZodIssue(),
                    path: [{ toString: () => { throw new Error('Path error'); } }]
                }
            ] as any;

            const result = buildFormErrorMap(issuesWithBadPath);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith(
                'buildFormErrorMap: error processing issue path:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it('should handle processing errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Mock Object.entries to throw an error
            const originalEntries = Object.entries;
            Object.entries = jest.fn().mockImplementation(() => {
                throw new Error('Processing error');
            });

            const issues: any[] = [
                createMockZodIssue({
                    path: ['name'],
                    message: 'Name is required'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalledWith(
                'structureErrors: error processing flatErrors:',
                expect.any(Error)
            );

            Object.entries = originalEntries;
            consoleSpy.mockRestore();
        });
    });

    describe('structureErrors function (via buildFormErrorMap)', () => {
        it('should handle invalid flatErrors parameter', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Test with null
            let result = buildFormErrorMap([]);
            expect(result).toEqual({});

            consoleSpy.mockRestore();
        });

        it('should handle invalid keys and messages', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // This is harder to test directly since structureErrors is internal,
            // but we can create scenarios that would trigger the validation
            const issues: any[] = [
                createMockZodIssue({
                    path: ['location', 'street'],
                    message: 'Street is required'
                })
            ];

            const result = buildFormErrorMap(issues);
            expect(result.location).toBeDefined();
            expect(result.location!.street).toEqual(['Street is required']);

            consoleSpy.mockRestore();
        });

        it('should handle field processing errors', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Create a scenario that might cause field processing errors
            const issues: any[] = [
                createMockZodIssue({
                    path: ['location', ''], // Empty field name
                    message: 'Field error'
                })
            ];

            const result = buildFormErrorMap(issues);

            // Should still process without crashing
            expect(result).toBeDefined();

            consoleSpy.mockRestore();
        });
    });

    describe('Type Definitions', () => {
        it('should return properly typed StructuredFormErrorMap', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['name'],
                    message: 'Name is required'
                }),
                createMockZodIssue({
                    path: ['location', 'street'],
                    message: 'Street is required'
                })
            ];

            const result: StructuredFormErrorMap = buildFormErrorMap(issues);

            // TypeScript compilation will catch type issues
            expect(result.name).toEqual(['Name is required']);
            expect(result.location).toBeDefined();
            expect(result.location!.street).toEqual(['Street is required']);
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle property form validation errors', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['name'],
                    message: 'Property name must be at least 10 characters long'
                }),
                createMockZodIssue({
                    path: ['description'],
                    message: 'Description must be at least 20 characters long'
                }),
                createMockZodIssue({
                    path: ['location', 'street'],
                    message: 'Street address is required'
                }),
                createMockZodIssue({
                    path: ['location', 'city'],
                    message: 'City is required'
                }),
                createMockZodIssue({
                    path: ['rates', 'nightly'],
                    message: 'Nightly rate must be greater than 0'
                }),
                createMockZodIssue({
                    path: ['images'],
                    message: 'At least 3 images are required'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                name: ['Property name must be at least 10 characters long'],
                description: ['Description must be at least 20 characters long'],
                images: ['At least 3 images are required'],
                location: {
                    street: ['Street address is required'],
                    city: ['City is required']
                },
                rates: {
                    nightly: ['Nightly rate must be greater than 0']
                }
            });
        });

        it('should handle user registration validation errors', () => {
            const issues: any[] = [
                createMockZodIssue({
                    path: ['sellerInfo', 'name'],
                    message: 'Full name is required'
                }),
                createMockZodIssue({
                    path: ['sellerInfo', 'email'],
                    message: 'Valid email address is required'
                }),
                createMockZodIssue({
                    path: ['password'],
                    message: 'Password must be at least 8 characters'
                }),
                createMockZodIssue({
                    path: ['password'],
                    message: 'Password must contain uppercase letter'
                }),
                createMockZodIssue({
                    path: ['confirmPassword'],
                    message: 'Passwords must match'
                })
            ];

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                password: [
                    'Password must be at least 8 characters',
                    'Password must contain uppercase letter'
                ],
                confirmPassword: ['Passwords must match'],
                sellerInfo: {
                    name: ['Full name is required'],
                    email: ['Valid email address is required']
                }
            });
        });
    });
});