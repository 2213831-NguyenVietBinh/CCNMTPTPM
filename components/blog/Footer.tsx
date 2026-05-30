import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/60 backdrop-blur-md py-8 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tight text-gradient">
            THÚ CƯNG
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()}. Bảo lưu mọi quyền.
          </span>
        </div>
        <div className="flex space-x-6 text-sm text-muted-foreground font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Quản lý
          </Link>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Supabase
          </a>
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Next.js
          </a>
        </div>
      </div>
    </footer>
  );
}
