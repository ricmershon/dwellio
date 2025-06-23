import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

import AuthProvider from "@/app/components/AuthProvider";
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";

import "@/app/globals.css";

export const metadata: Metadata = {
    title: {
        template: '%s | Dwellio',
        default: 'Dwellio'
    },
    description: "Find an awesome vacation property",
    keywords: 'rental, property, real estate'
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <AuthProvider>
            <html lang="en">
                <body>
                    <NavBar />
                        {children}
                    <Footer />
                    <ToastContainer
                        position='top-right'
                    />
                </body>
            </html>
        </AuthProvider>
    );
}

export default RootLayout;