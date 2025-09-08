import Input from "@/ui/shared/input";

interface RegisterFormProps {
    formAction: (payload: FormData) => void;
    isLoading: boolean;
    isPending: boolean;
    handleClearInfo: () => void;
}

const RegisterForm = ({ formAction, isLoading, isPending, handleClearInfo }: RegisterFormProps) => {
    return (
        <form action={formAction} className="space-y-4">
            {/* Username */}
            <Input
                id="username"
                name="username"
                type="text"
                inputType="input"
                placeholder="Enter a username"
                label="Username (optional)"
                disabled={isLoading || isPending}
                onClick={handleClearInfo}
            />

            {/* Email */}
            <Input
                id="email"
                name="email"
                type="email"
                required
                inputType="input"
                placeholder="your@email.com"
                label="Email Address *"
                disabled={isLoading || isPending}
                onClick={handleClearInfo}
            />

            {/* Password */}
            <Input
                id="password"
                name="password"
                type="password"
                required
                inputType="input"
                placeholder="Create a strong password"
                label="Password *"
                disabled={isLoading || isPending}
                onClick={handleClearInfo}
            />
            
            <div className="-mt-3 text-xs text-gray-500">
                <div>Password requirements:</div>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>At least 8 characters long</li>
                    <li>Contains uppercase and lowercase letters</li>
                    <li>Contains at least one number</li>
                    <li>Contains at least one special character (@$!%*?&)</li>
                </ul>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || isPending}
                className="btn btn-login-logout h-10 w-full"
            >
                {(isLoading || isPending) ? (
                    <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Please wait...
                    </div>
                ) : (
                    "Create Account"
                )}
            </button>
        </form>        
    );
}
 
export default RegisterForm;