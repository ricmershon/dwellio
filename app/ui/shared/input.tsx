interface InputProps {
    inputType?: 'input' | 'textarea',
    id: string;
    type?: string;
    name: string;
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
    isInGroup?: boolean | false;
    [x: string]: unknown;
}

// TODO: Add error element
const Input = ({ inputType, id, type, name, label, placeholder, defaultValue, required, isInGroup, ...restProps }: InputProps) => {
    const inputElement = inputType === 'input' ? (
        <input
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
            type={type}
            id={id}
            name={name}
            placeholder={placeholder}
            defaultValue={defaultValue}
            required={required}
            {...restProps}
        />
    ) : (
        <textarea
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
            id={id}
            name={name}
            placeholder={placeholder}
            defaultValue={defaultValue}
            required={required}
            rows={4}
            {...restProps}
        />
    );

    return (
        <div className={`${isInGroup ? 'mb-2' : 'mb-4'}`}>
            {label && (
                <label
                    className="mb-2 block font-medium text-gray-700"
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            {inputElement}
        </div>
    )
}

export default Input;
