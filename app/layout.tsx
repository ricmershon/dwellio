import type { Metadata } from "next";

import NavBar from "@/components/NavBar";

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
        <html lang="en">
            <body>
                <NavBar />
                {children}
            </body>
        </html>
    );
}

export default RootLayout;