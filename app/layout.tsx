import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Dwellio - Property Rentals",
    description: "Find your perfect property rental",
};

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}