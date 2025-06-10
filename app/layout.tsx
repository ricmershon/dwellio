import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
    title: "Dwellio",
    description: "Find an awesome vacation property",
    keywords: 'rental, property, real estate'
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}

export default RootLayout;