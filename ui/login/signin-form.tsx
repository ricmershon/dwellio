import Input from "../shared/input";

interface SigninFormProps {
    handleSignIn: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isLoading: boolean;
    handleClearInfo: () => void;
}

const SignInForm = ({ handleSignIn, isLoading, handleClearInfo }: SigninFormProps) => {
    return (
        <form onSubmit={handleSignIn} className="space-y-4">

            {/* Email */}
            <Input
                id="signin-email"
                name="email"
                type="email"
                required
                inputType="input"
                placeholder="your@email.com"
                label="Email Address *"
                disabled={isLoading}
                onClick={handleClearInfo}
            />

            {/* Password */}
            <Input
                id="signin-password"
                name="password"
                type="password"
                required
                inputType="input"
                placeholder="Enter your password"
                label="Password *"
                disabled={isLoading}
                onClick={handleClearInfo}
            />

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-login-logout mt-2"
            >
                {isLoading ? (
                    <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Please wait...
                    </div>
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}
 
export default SignInForm;