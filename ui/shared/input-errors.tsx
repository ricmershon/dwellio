const InputErrors = ({ numErrors }: { numErrors: number }) => (
    <>
        {numErrors > 0 ? (
            <p
                className="mt-2 text-red-500 text-right"
            >
                Please correct input errors.
            </p>
        ) : null}
    </>
);
 
export default InputErrors;