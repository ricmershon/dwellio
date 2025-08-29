import LoginUI from "@/ui/login/login-ui";
import DwellioLogo from "@/ui/shared/logo";

const LoginPage = () => {
    return (
        <section className="mt-4 h-screen text-center flex flex-col jusitfy-center items-center">
            <DwellioLogo />
            <h1 className="my-4 text-xl text-gray-700">Sign in with Google or create an account</h1>
            <LoginUI />
        </section>
    );
}
 
export default LoginPage;