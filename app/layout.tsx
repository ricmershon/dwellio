import type { Metadata } from "next";
import { Slide, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import 'photoswipe/dist/photoswipe.css'

import AuthProvider from "@/app/ui/root/auth-provider";
import NavBar from "@/app/ui/root/layout/nav-bar/nav-bar";
import Footer from "@/app/ui/root/layout/footer";
import { GlobalContextProvider } from "@/app/context/global-context";

import "@/app/globals.css";

export const metadata: Metadata = {
    title: {
        template: '%s | Dwellio',
        default: 'Dwellio'
    },
    description: "Find an awesome vacation property",
    keywords: 'rental, property, real estate'
};

// TODO: Change sytlings
// TODO: Get property pictures from somewhere else
// TODO: Metadata for all files
// TODO: See if ` as ` can be removed for more strictly typed
// FIXME: Cursor changes on button hovers
// TODO: Add metadata for all pages
// TODO: Standardize buttons and button states.
// TODO: Add images in separate modal box where description can be added to the image.
// TODO: Set max properties per page dynamically based on screen width.
const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <AuthProvider>
            <GlobalContextProvider>
                <html lang="en">
                    <body>
                        <NavBar />
                        <div className="flex-grow p-4 md:overflow-y-auto md:p-6">{children}</div>
                        <Footer />
                        <ToastContainer
                            position='top-right'
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