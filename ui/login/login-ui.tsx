"use client";

import { useAuthProviders } from "@/hooks/use-auth-providers";

const LoginUI = () => {
    const providers = useAuthProviders();
    console.log(providers);
    
    return (
        <div>This is the login ui</div>
    );
}
 
export default LoginUI;