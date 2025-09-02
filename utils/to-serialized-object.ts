import { MessageDocument, PropertyDocument } from "@/models";

/**
 * Converts MongoDB documents to plain JavaScript objects by removing
 * MongoDB-specific properties and ensuring JSON serialization compatibility
 * @param object - MongoDB document(s) to serialize
 * @returns Serialized plain object(s) - returns empty object/array on failure for backward compatibility
 */
export const toSerializedObject = (object: PropertyDocument | PropertyDocument[] | MessageDocument) => {
    // Input validation - provide fallbacks to maintain backward compatibility
    if (object === null || object === undefined) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('toSerializedObject: object parameter is null or undefined');
        }
        return {};
    }
    
    // Validate input is an object or array
    if (typeof object !== 'object') {
        if (process.env.NODE_ENV === 'development') {
            console.warn('toSerializedObject: object parameter is not an object or array');
        }
        return {};
    }
    
    try {
        // First stringify to handle MongoDB objects, dates, etc.
        const stringified = JSON.stringify(object);
        
        // Validate stringification was successful
        if (typeof stringified !== 'string') {
            console.error('toSerializedObject: JSON.stringify returned non-string result');
            return Array.isArray(object) ? [] : {};
        }
        
        // Parse back to get plain JavaScript object
        const parsed = JSON.parse(stringified);
        
        return parsed;
    } catch (error) {
        // Handle different types of errors - log only in development
        if (process.env.NODE_ENV === 'development') {
            if (error instanceof Error) {
                if (error.message.includes('circular')) {
                    console.error('toSerializedObject: circular reference detected in object');
                } else if (error.name === 'SyntaxError') {
                    console.error('toSerializedObject: JSON.parse failed:', error.message);
                } else {
                    console.error('toSerializedObject: serialization error:', error.message);
                }
            } else {
                console.error('toSerializedObject: unexpected error during serialization:', error);
            }
        }
        // Return appropriate fallback based on input type to maintain backward compatibility
        return Array.isArray(object) ? [] : {};
    }
};