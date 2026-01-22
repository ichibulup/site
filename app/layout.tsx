// @ts-ignore
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { StripeProvider } from "@stripe/react-stripe-js"
import { ThemeProvider } from "@/components/provider/theme";
import { StoreProvider }  from "@/components/provider/store";
import { ToasterProvider } from "@/components/provider/toaster";
import { AuthProvider } from "@/components/provider/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Gorthenburg", // Restaurant Chain Management System
  description: "Hệ thống quản lý chuỗi nhà hàng đa nền tảng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: theme class (dark/light) may be added on the client
    // by next-themes which can cause a mismatch with the server-rendered HTML.
    // We suppress the hydration warning here and recommend using a cookie-based
    // theme strategy or an inline theme script for a full fix.
    // <html lang="vi" suppressHydrationWarning>
    <html
      lang="vi"
      // className="dark"
      // style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <StoreProvider>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <ToasterProvider />
          </ThemeProvider>
        </AuthProvider>
      </StoreProvider>
      </body>
    </html>
  );
}
