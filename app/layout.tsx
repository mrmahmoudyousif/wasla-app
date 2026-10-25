import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // استيراد موزع الإشعارات

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "وصلة | Wasla",
  description: "نشتري لك من العالم ونوصلها لبابك",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`}>
        {/* هذا هو المكون الذي سيظهر الإشعارات الأنيقة */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
              fontFamily: 'inherit'
            },
          }} 
        />
        {children}
      </body>
    </html>
  );
}