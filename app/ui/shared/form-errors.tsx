import { FormErrorsType } from "@/app/lib/definitions";

interface FormErrorsProps {
    errors: FormErrorsType;
    id: string;
}

const FormErrors = ({ errors, id }: FormErrorsProps) => (
    <div id={`${id}-error`} aria-live="polite" aria-atomic="true">
        {Array.isArray(errors) && errors.length > 0 && (
            errors.map((error: string) => (
                <p
                    key={error}
                    className="mt-1 text-sm text-red-500"
                >
                    {error}
                </p>
            ))
        )}
    </div>
);

export default FormErrors;