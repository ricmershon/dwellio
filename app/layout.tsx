import type { Metadata } from "next";
import { Slide, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

import AuthProvider from "@/app/ui/root/auth-provider";
import NavBar from "@/app/ui/root/layout/nav-bar";
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
const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <AuthProvider>
            <GlobalContextProvider>
                <html lang="en">
                    <body>
                        <NavBar />
                            {children}
                        <Footer />
                        <ToastContainer
                            position='top-right'
                            transition={Slide}
                        />
                    </body>
                </html>
            </GlobalContextProvider>
        </AuthProvider>
    );
}

export default RootLayout;