import type { Metadata } from "next";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
import "react-loading-skeleton/dist/skeleton.css";
import "photoswipe/dist/photoswipe.css"

import ViewportCookieWriter from "@/ui/root/viewport-cookie-writer";
import { fetchStaticInputs } from "@/lib/data/static-inputs-data";
import AuthProvider from "@/ui/root/auth-provider";
import NavBar from "@/ui/root/layout/nav-bar/nav-bar";
import Footer from "@/ui/root/layout/footer";
import { GlobalContextProvider } from "@/context/global-context";
import "@/app/globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: {
        template: "%s | Dwellio",
        default: "Dwellio"
    },
    description: "Find an awesome vacation property",
    keywords: "rental, property, real estate"
};

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const initialStaticInputs = await fetchStaticInputs();

    return (
        <AuthProvider>
            <GlobalContextProvider initialStaticInputs={initialStaticInputs}>
                <html lang="en">
                    <body>
                        <ViewportCookieWriter />
                        <NavBar />
                        <div className="flex-grow md:overflow-y-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
                        <Footer />
                        <ToastContainer
                            position="top-right"
                            transition={Slide}
                            hideProgressBar={true}
                            theme="colored"
                        />
                    </body>
                </html>
            </GlobalContextProvider>
        </AuthProvider>
    );
}

export default RootLayout;