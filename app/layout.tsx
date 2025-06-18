import type { Metadata } from "next";

import AuthProvider from "@/components/AuthProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

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
                </body>
            </html>
        </AuthProvider>
    );
}

export default RootLayout;