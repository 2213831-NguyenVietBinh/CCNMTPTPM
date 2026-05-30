import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/blog/Navbar";
import Footer from "@/components/blog/Footer";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Thú Cưng Blog - Hệ thống Blog/CMS Cá nhân Cao cấp",
    template: "%s | Thú Cưng Blog",
  },
  description:
    "Ứng dụng Blog và CMS cá nhân tuyệt đẹp, sẵn sàng hoạt động thực tế được xây dựng bằng Next.js 14, Tailwind CSS và Supabase.",
  keywords: ["Next.js", "Supabase", "Tailwind CSS", "Blog", "CMS", "TypeScript", "Thú cưng"],
  authors: [{ name: "Senior Fullstack Developer" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    const supabase = createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    user = supabaseUser;
  } catch (error) {
    // Supabase variables might not be configured yet during docker-build
    console.warn("Supabase auth is uninitialized. Defaulting to null user.");
  }

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20`}
      >
        {/* Glow ambient design effects */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-violet-600/20 blur-[130px]" />
          <div className="absolute -top-[45%] -right-[20%] w-[80%] h-[80%] rounded-full bg-indigo-600/20 blur-[130px]" />
        </div>

        <Navbar initialUser={user} />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
