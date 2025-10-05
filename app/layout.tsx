import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "../components/Notifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloud Gallery - Image Management System",
  description: "Professional image gallery management system with MongoDB and Cloudinary integration. Upload, organize, and manage your images with advanced search, tagging, and synchronization features.",
  keywords: ["image gallery", "photo management", "cloudinary", "mongodb", "next.js", "file upload"],
  authors: [{ name: "Cloud Gallery Team" }],
  openGraph: {
    title: "Cloud Gallery - Professional Image Management",
    description: "Upload, organize, and manage your images with our powerful gallery system",
    type: "website",
    siteName: "Cloud Gallery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud Gallery - Image Management System",
    description: "Professional image gallery with MongoDB and Cloudinary integration",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#60a5fa" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 min-h-screen`}
      >
        <NotificationProvider>
          <div id="modal-root" />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}