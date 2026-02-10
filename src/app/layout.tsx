import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import { LanguageProvider } from "@/lib/i18n";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocationProvider } from "@/contexts/LocationContext";
import LocationPermissionModal from "@/components/features/LocationPermissionModal";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vita - AI-Powered Emergency Resource Map',
  description: 'Find crowdsourced blood, oxygen, and ambulance resources instantly.',
};

import { Toaster } from 'sonner';
import AlertBanner from "@/components/features/AlertBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-blue-500/30`}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <LocationProvider>
              <LanguageProvider>
                <Navbar />
                <AlertBanner />
                <LocationPermissionModal />
                <Toaster position="top-center" />
                <main className="min-h-[calc(100vh-64px)]">
                  {children}
                </main>
              </LanguageProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
