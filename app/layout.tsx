import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

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
    // لاحظ السطر التالي: suppressHydrationWarning هو المفتاح السري لحل مشكلة الوضع الليلي
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}