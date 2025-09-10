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

// TODO: Get property pictures from somewhere else
// TODO: See if ` as ` can be removed for more strictly typed
// TODO: Add images in separate modal box where description can be added to the image.
// FIXME: Delete messages associated with a property when the property is deleted.
// FIXME: dark mode
// FIXME: remove field highlights when corrected.
const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const initialStaticInputs = await fetchStaticInputs();

    return (
        <AuthProvider>
            <GlobalContextProvider initialStaticInputs={initialStaticInputs}>
                <html lang="en">
                    <body>
                        <div className="bg-white text-gray-800 placeholder:text-gray-400">
                            <ViewportCookieWriter />
                            <NavBar />
                            <div className="flex flex-col min-h-screen md:overflow-y-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
                            <Footer />
                            <ToastContainer
                                position="top-right"
                                transition={Slide}
                                hideProgressBar={true}
                                theme="colored"
                            />
                        </div>
                    </body>
                </html>
            </GlobalContextProvider>
        </AuthProvider>
    );
}

export default RootLayout;