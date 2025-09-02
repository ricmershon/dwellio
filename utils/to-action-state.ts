import { ActionState } from "@/types/types";

/**
 * Creates a clean ActionState object with validated properties
 * @param actionState - Input ActionState to process
 * @returns Clean ActionState object with all valid properties
 */
export const toActionState = (actionState: ActionState): ActionState => {
    // Input validation
    if (!actionState) {
        console.warn('toActionState: actionState parameter is null or undefined');
        return {};
    }
    
    if (typeof actionState !== 'object') {
        console.warn('toActionState: actionState parameter is not an object');
        return {};
    }
    
    try {
        // Destructure with default handling for missing properties
        const { 
            status, 
            message, 
            isFavorite, 
            isRead, 
            formData, 
            formErrorMap 
        } = actionState;
        
        // Build the result object, only including defined properties
        const result: ActionState = {};
        
        // Validate and include status
        if (status !== undefined && status !== null) {
            if (typeof status === 'string') {
                result.status = status;
            } else {
                console.warn('toActionState: status property is not a string');
            }
        }
        
        // Validate and include message  
        if (message !== undefined && message !== null) {
            if (typeof message === 'string') {
                result.message = message;
            } else {
                console.warn('toActionState: message property is not a string');
            }
        }
        
        // Validate and include isFavorite
        if (isFavorite !== undefined && isFavorite !== null) {
            if (typeof isFavorite === 'boolean') {
                result.isFavorite = isFavorite;
            } else {
                console.warn('toActionState: isFavorite property is not a boolean');
            }
        }
        
        // Validate and include isRead
        if (isRead !== undefined && isRead !== null) {
            if (typeof isRead === 'boolean') {
                result.isRead = isRead;
            } else {
                console.warn('toActionState: isRead property is not a boolean');
            }
        }
        
        // Include formData if present (FormData objects)
        if (formData !== undefined && formData !== null) {
            result.formData = formData;
        }
        
        // Include formErrorMap if present (should be an object)
        if (formErrorMap !== undefined && formErrorMap !== null) {
            if (typeof formErrorMap === 'object') {
                result.formErrorMap = formErrorMap;
            } else {
                console.warn('toActionState: formErrorMap property is not an object');
            }
        }
        
        return result;
    } catch (error) {
        console.error('toActionState: error processing actionState:', error);
        return {};
    }
};
