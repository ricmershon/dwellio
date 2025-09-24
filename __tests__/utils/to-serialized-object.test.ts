import { toSerializedObject } from '@/utils/to-serialized-object';
import { PropertyDocument, MessageDocument } from '@/models';

describe('Data Serialization Utilities', () => {
    describe('toSerializedObject', () => {
        describe('Basic Functionality', () => {
            it('should serialize a simple object correctly', () => {
                const simpleObject = {
                    id: 'test-123',
                    name: 'Test Property',
                    type: 'Apartment'
                };

                const result = toSerializedObject(simpleObject as any);

                expect(result).toEqual({
                    id: 'test-123',
                    name: 'Test Property',
                    type: 'Apartment'
                });
                expect(typeof result).toBe('object');
            });

            it('should serialize an array of objects correctly', () => {
                const objectArray = [
                    { id: '1', name: 'Property 1' },
                    { id: '2', name: 'Property 2' }
                ];

                const result = toSerializedObject(objectArray as any);

                expect(result).toEqual([
                    { id: '1', name: 'Property 1' },
                    { id: '2', name: 'Property 2' }
                ]);
                expect(Array.isArray(result)).toBe(true);
            });

            it('should handle objects with Date properties', () => {
                const objectWithDate = {
                    id: 'test-123',
                    name: 'Test Property',
                    createdAt: new Date('2024-01-15T12:00:00.000Z'),
                    updatedAt: new Date('2024-01-16T12:00:00.000Z')
                };

                const result = toSerializedObject(objectWithDate as any);

                expect(result).toEqual({
                    id: 'test-123',
                    name: 'Test Property',
                    createdAt: '2024-01-15T12:00:00.000Z',
                    updatedAt: '2024-01-16T12:00:00.000Z'
                });
            });

            it('should handle nested objects correctly', () => {
                const nestedObject = {
                    id: 'test-123',
                    name: 'Test Property',
                    location: {
                        street: '123 Main St',
                        city: 'Test City',
                        coordinates: {
                            lat: 40.7128,
                            lng: -74.0060
                        }
                    },
                    rates: {
                        nightly: 100,
                        weekly: 650,
                        monthly: 2500
                    }
                };

                const result = toSerializedObject(nestedObject as any);

                expect(result).toEqual(nestedObject);
                expect(result.location.coordinates.lat).toBe(40.7128);
                expect(result.rates.monthly).toBe(2500);
            });
        });

        describe('Input Validation', () => {
            it('should return empty object for null input', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                // Set development environment for warning logs
                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                const result = toSerializedObject(null as any);

                expect(result).toEqual({});
                expect(consoleSpy).toHaveBeenCalledWith('toSerializedObject: object parameter is null or undefined');

                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });

            it('should return empty object for undefined input', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                const result = toSerializedObject(undefined as any);

                expect(result).toEqual({});
                expect(consoleSpy).toHaveBeenCalledWith('toSerializedObject: object parameter is null or undefined');

                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });

            it('should return empty object for non-object input', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                expect(toSerializedObject('string' as any)).toEqual({});
                expect(toSerializedObject(123 as any)).toEqual({});
                expect(toSerializedObject(true as any)).toEqual({});

                expect(consoleSpy).toHaveBeenCalledWith('toSerializedObject: object parameter is not an object or array');

                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });

            it('should not log warnings in production environment', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'production';

                const result = toSerializedObject(null as any);

                expect(result).toEqual({});
                expect(consoleSpy).not.toHaveBeenCalled();

                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });
        });

        describe('Error Handling', () => {
            it('should handle circular reference errors', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                // Create circular reference
                const circularObject: any = {
                    id: 'test-123',
                    name: 'Test Property'
                };
                circularObject.self = circularObject;

                const result = toSerializedObject(circularObject);

                expect(result).toEqual({});
                expect(consoleSpy).toHaveBeenCalledWith(
                    'toSerializedObject: circular reference detected in object'
                );

                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });

            it('should handle JSON.stringify errors', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                // Create object that will fail JSON.stringify
                const problematicObject = {
                    id: 'test-123',
                    badFunction: () => 'this will cause issues'
                };

                // Mock JSON.stringify to throw
                const originalStringify = JSON.stringify;
                JSON.stringify = jest.fn().mockImplementation(() => {
                    throw new Error('Stringify failed');
                });

                const result = toSerializedObject(problematicObject as any);

                expect(result).toEqual({});
                expect(consoleSpy).toHaveBeenCalledWith(
                    'toSerializedObject: serialization error:',
                    'Stringify failed'
                );

                JSON.stringify = originalStringify;
                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });

            it('should handle JSON.parse errors', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                // Mock JSON.parse to throw syntax error
                const originalParse = JSON.parse;
                JSON.parse = jest.fn().mockImplementation(() => {
                    const error = new Error('Unexpected token');
                    error.name = 'SyntaxError';
                    throw error;
                });

                const testObject = { id: 'test-123' };
                const result = toSerializedObject(testObject as PropertyDocument);

                expect(result).toEqual({});
                expect(consoleSpy).toHaveBeenCalledWith(
                    'toSerializedObject: JSON.parse failed:',
                    'Unexpected token'
                );

                JSON.parse = originalParse;
                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });

            it('should return empty array for failed array serialization', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                const testArray = [{ id: '1' }, { id: '2' }];

                // Mock JSON.stringify to fail
                const originalStringify = JSON.stringify;
                JSON.stringify = jest.fn().mockImplementation(() => {
                    throw new Error('Stringify failed');
                });

                const result = toSerializedObject(testArray as PropertyDocument[]);

                expect(result).toEqual([]);
                expect(Array.isArray(result)).toBe(true);

                JSON.stringify = originalStringify;
                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });

            it('should handle non-string stringify results', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                // Mock JSON.stringify to return non-string
                const originalStringify = JSON.stringify;
                JSON.stringify = jest.fn().mockReturnValue(null as any);

                const testObject = { id: 'test-123' };
                const result = toSerializedObject(testObject as PropertyDocument);

                expect(result).toEqual({});
                expect(consoleSpy).toHaveBeenCalledWith(
                    'toSerializedObject: JSON.stringify returned non-string result'
                );

                JSON.stringify = originalStringify;
                consoleSpy.mockRestore();
            });

            it('should handle unexpected error types', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const originalEnv = process.env.NODE_ENV;
                (process.env as any).NODE_ENV = 'development';

                // Mock JSON.stringify to throw non-Error object
                const originalStringify = JSON.stringify;
                JSON.stringify = jest.fn().mockImplementation(() => {
                    throw 'String error';
                });

                const testObject = { id: 'test-123' };
                const result = toSerializedObject(testObject as PropertyDocument);

                expect(result).toEqual({});
                expect(consoleSpy).toHaveBeenCalledWith(
                    'toSerializedObject: unexpected error during serialization:',
                    'String error'
                );

                JSON.stringify = originalStringify;
                (process.env as any).NODE_ENV = originalEnv;
                consoleSpy.mockRestore();
            });
        });

        describe('MongoDB Document Scenarios', () => {
            it('should handle PropertyDocument with MongoDB ObjectId-like structure', () => {
                const propertyDoc = {
                    _id: '507f1f77bcf86cd799439011',
                    name: 'Test Property',
                    type: 'Apartment',
                    location: {
                        street: '123 Main St',
                        city: 'Test City',
                        state: 'CA'
                    },
                    rates: {
                        nightly: 100,
                        weekly: 650
                    },
                    createdAt: new Date('2024-01-15T12:00:00.000Z'),
                    updatedAt: new Date('2024-01-16T12:00:00.000Z')
                };

                const result = toSerializedObject(propertyDoc as any);

                expect(result).toEqual({
                    _id: '507f1f77bcf86cd799439011',
                    name: 'Test Property',
                    type: 'Apartment',
                    location: {
                        street: '123 Main St',
                        city: 'Test City',
                        state: 'CA'
                    },
                    rates: {
                        nightly: 100,
                        weekly: 650
                    },
                    createdAt: '2024-01-15T12:00:00.000Z',
                    updatedAt: '2024-01-16T12:00:00.000Z'
                });
            });

            it('should handle MessageDocument structure', () => {
                const messageDoc = {
                    _id: '507f1f77bcf86cd799439012',
                    body: 'This is a test message',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '555-0123',
                    read: false,
                    createdAt: new Date('2024-01-15T12:00:00.000Z'),
                    sender: 'sender-id',
                    recipient: 'recipient-id',
                    property: {
                        _id: 'property-id',
                        name: 'Test Property'
                    }
                };

                const result = toSerializedObject(messageDoc as any);

                expect(result).toEqual({
                    _id: '507f1f77bcf86cd799439012',
                    body: 'This is a test message',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '555-0123',
                    read: false,
                    createdAt: '2024-01-15T12:00:00.000Z',
                    sender: 'sender-id',
                    recipient: 'recipient-id',
                    property: {
                        _id: 'property-id',
                        name: 'Test Property'
                    }
                });
            });

            it('should handle array of PropertyDocuments', () => {
                const propertyArray = [
                    {
                        _id: '507f1f77bcf86cd799439011',
                        name: 'Property 1',
                        createdAt: new Date('2024-01-15T12:00:00.000Z')
                    },
                    {
                        _id: '507f1f77bcf86cd799439012',
                        name: 'Property 2',
                        createdAt: new Date('2024-01-16T12:00:00.000Z')
                    }
                ];

                const result = toSerializedObject(propertyArray as any);

                expect(result).toEqual([
                    {
                        _id: '507f1f77bcf86cd799439011',
                        name: 'Property 1',
                        createdAt: '2024-01-15T12:00:00.000Z'
                    },
                    {
                        _id: '507f1f77bcf86cd799439012',
                        name: 'Property 2',
                        createdAt: '2024-01-16T12:00:00.000Z'
                    }
                ]);
                expect(Array.isArray(result)).toBe(true);
            });
        });

        describe('Real-world Usage Scenarios', () => {
            it('should handle complex property document with all fields', () => {
                const complexProperty = {
                    _id: '507f1f77bcf86cd799439011',
                    name: 'Luxury Downtown Apartment',
                    type: 'Apartment',
                    description: 'Beautiful apartment in the heart of downtown',
                    location: {
                        street: '123 Main Street',
                        city: 'San Francisco',
                        state: 'CA',
                        zip: '94105'
                    },
                    rates: {
                        nightly: 250,
                        weekly: 1500,
                        monthly: 5500
                    },
                    amenities: ['WiFi', 'Kitchen', 'Parking', 'Pool'],
                    images: [
                        {
                            secureUrl: 'https://example.com/image1.jpg',
                            publicId: 'image1',
                            width: 800,
                            height: 600
                        }
                    ],
                    owner: 'owner-id-123',
                    isBookmarked: false,
                    createdAt: new Date('2024-01-15T12:00:00.000Z'),
                    updatedAt: new Date('2024-01-16T12:00:00.000Z')
                };

                const result = toSerializedObject(complexProperty as any);

                expect(result.name).toBe('Luxury Downtown Apartment');
                expect(result.location.city).toBe('San Francisco');
                expect(result.rates.monthly).toBe(5500);
                expect(result.amenities).toEqual(['WiFi', 'Kitchen', 'Parking', 'Pool']);
                expect(result.createdAt).toBe('2024-01-15T12:00:00.000Z');
                expect(result.images[0].secureUrl).toBe('https://example.com/image1.jpg');
            });

            it('should handle message thread serialization', () => {
                const messageThread = [
                    {
                        _id: 'msg-1',
                        body: 'Initial inquiry',
                        createdAt: new Date('2024-01-15T12:00:00.000Z'),
                        read: false
                    },
                    {
                        _id: 'msg-2',
                        body: 'Response to inquiry',
                        createdAt: new Date('2024-01-15T13:00:00.000Z'),
                        read: true
                    }
                ];

                const result = toSerializedObject(messageThread as any);

                expect(Array.isArray(result)).toBe(true);
                expect(result).toHaveLength(2);
                expect(result[0].createdAt).toBe('2024-01-15T12:00:00.000Z');
                expect(result[1].createdAt).toBe('2024-01-15T13:00:00.000Z');
            });

            it('should preserve data types correctly after serialization', () => {
                const mixedDataTypes = {
                    stringField: 'test string',
                    numberField: 42,
                    booleanField: true,
                    nullField: null,
                    arrayField: [1, 2, 3, 'four'],
                    objectField: {
                        nested: 'value',
                        count: 5
                    },
                    dateField: new Date('2024-01-15T12:00:00.000Z')
                };

                const result = toSerializedObject(mixedDataTypes as any);

                expect(typeof result.stringField).toBe('string');
                expect(typeof result.numberField).toBe('number');
                expect(typeof result.booleanField).toBe('boolean');
                expect(result.nullField).toBe(null);
                expect(Array.isArray(result.arrayField)).toBe(true);
                expect(typeof result.objectField).toBe('object');
                expect(typeof result.dateField).toBe('string'); // Dates become strings
                expect(result.dateField).toBe('2024-01-15T12:00:00.000Z');
            });
        });

        describe('Performance and Edge Cases', () => {
            it('should handle empty object', () => {
                const result = toSerializedObject({} as any);
                expect(result).toEqual({});
            });

            it('should handle empty array', () => {
                const result = toSerializedObject([] as any);
                expect(result).toEqual([]);
                expect(Array.isArray(result)).toBe(true);
            });

            it('should handle deeply nested objects', () => {
                const deepObject = {
                    level1: {
                        level2: {
                            level3: {
                                level4: {
                                    level5: {
                                        value: 'deep value',
                                        date: new Date('2024-01-15T12:00:00.000Z')
                                    }
                                }
                            }
                        }
                    }
                };

                const result = toSerializedObject(deepObject as any);

                expect(result.level1.level2.level3.level4.level5.value).toBe('deep value');
                expect(result.level1.level2.level3.level4.level5.date).toBe('2024-01-15T12:00:00.000Z');
            });

            it('should handle large arrays efficiently', () => {
                const largeArray = Array.from({ length: 1000 }, (_, i) => ({
                    id: `item-${i}`,
                    value: i * 2,
                    date: new Date(2024, 0, 15, 12, i % 60, 0)
                }));

                const result = toSerializedObject(largeArray as any);

                expect(Array.isArray(result)).toBe(true);
                expect(result).toHaveLength(1000);
                expect(result[0].id).toBe('item-0');
                expect(result[999].id).toBe('item-999');
                expect(typeof result[500].date).toBe('string');
            });
        });
    });
});