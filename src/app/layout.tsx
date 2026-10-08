import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "Stovest — African & Global Stock Investment Platform",
  description: "Live pricing, portfolio tracking, and market analytics for African and Global stock markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('stovest-theme')==='light'?'light':'dark';document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add('dark')}`,
          }}
        />
      </head>
      <body className="bg-[#05070c] text-gray-100 antialiased min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}