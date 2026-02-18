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
        {/* Mobile Restriction Overlay */}
        <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center lg:hidden">
          <div className="text-center p-8 max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10">
                <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Desktop Experience Only</h1>
            <p className="text-gray-400 leading-relaxed">
              This application is optimized for larger screens to provide the best possible experience.
              Please access it via a laptop or desktop computer.
            </p>
          </div>
        </div>

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
