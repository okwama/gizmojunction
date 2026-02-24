import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthSync from "@/components/auth/AuthSync";
import NextTopLoader from "nextjs-toploader";

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
            <body className="antialiased font-sans">
                <NextTopLoader
                    color="#2563eb"
                    initialPosition={0.05}
                    crawlSpeed={100}
                    height={4}
                    crawl={true}
                    showSpinner={false}
                    easing="ease-in-out"
                    speed={200}
                    shadow="0 0 15px #2563eb,0 0 8px #2563eb"
                />
                <AuthProvider>
                    <AuthSync />
                    {children}
                    <Toaster position="top-center" richColors />
                </AuthProvider>
            </body>
        </html>
    );
}
