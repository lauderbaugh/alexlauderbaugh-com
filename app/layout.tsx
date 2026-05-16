import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alex Lauderbaugh",
  description:
    "Product leader and builder. CPO at BettrData, building Syscribe. Based in Auckland.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink dark:bg-d-bg dark:text-d-ink transition-colors duration-200 min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="max-w-[720px] mx-auto px-6 sm:px-8">
            <Header />
          </div>
          <main>{children}</main>
          <div className="max-w-[720px] mx-auto px-6 sm:px-8">
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
