// Helper utilities for creating FormData in tests
export const createFormDataFromObject = (data) => {
    const formData = new FormData();

    const appendToFormData = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
            const formKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
                // Nested object
                appendToFormData(value, formKey);
            } else if (Array.isArray(value)) {
                // Array values
                value.forEach(item => formData.append(formKey, item));
            } else if (value !== undefined && value !== null) {
                // Primitive values
                formData.append(formKey, value.toString());
            }
        }
    };

    appendToFormData(data);
    return formData;
};