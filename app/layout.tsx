import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "Gizmo Junction - Electronics Marketplace",
    description: "Your one-stop shop for electronics, gadgets, and smart devices",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
