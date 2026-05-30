"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, LayoutDashboard, FileText, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  initialUser: User | null;
}

export default function Navbar({ initialUser }: NavbarProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setUser(initialUser);
    if (initialUser) {
      supabase
        .from("profiles")
        .select("role")
        .eq("id", initialUser.id)
        .single()
        .then(({ data }) => {
          setIsAdmin(data?.role === "admin");
        });
    } else {
      setIsAdmin(false);
    }
  }, [initialUser, supabase]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", activeUser.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.role === "admin");
          });
      } else {
        setIsAdmin(false);
      }
      if (event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-gradient">
                THÚ CƯNG
              </span>
              <span className="text-xs uppercase tracking-widest font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20 hidden sm:inline-block">
                Blog
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
            >
              Trang chủ
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1.5 text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Quản trị</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Quản lý</span>
                </Link>
                <div className="h-4 w-px bg-border/60" />
                <span className="text-xs text-muted-foreground font-medium">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-destructive hover:text-destructive/80 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all text-sm font-medium shadow-md shadow-primary/20"
                >
                  Đăng ký
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-card/95 backdrop-blur-lg animate-fade-in">
          <div className="space-y-1 px-4 pt-2 pb-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted"
            >
              Trang chủ
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Quản trị</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Quản lý</span>
                </Link>
                <div className="border-t border-border/40 my-2" />
                <div className="px-3 py-2 text-sm text-muted-foreground truncate">
                  Đăng nhập bằng: {user.email}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 mt-2 rounded-xl text-center text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
