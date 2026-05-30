"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, Lock, User, UserCheck, Loader2, AlertCircle } from "lucide-react";
import { registerAction } from "../../actions";

const initialState = {
  success: false,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-lg shadow-primary/25 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>Đang đăng ký...</span>
        </>
      ) : (
        <span>Đăng ký</span>
      )}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, initialState);

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-xl shadow-purple-500/5 relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />

        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gradient">
            Đăng ký Tài khoản
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bắt đầu bằng việc tạo hồ sơ tác giả viết bài
          </p>
        </div>

        {state?.error && !state?.success && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && state?.error && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium animate-fade-in">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" action={formAction}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5"
              >
                Tên đăng nhập (Username) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5"
              >
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5"
              >
                Địa chỉ Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5"
              >
                Mật khẩu <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                  placeholder="•••••••• (Tối thiểu 6 ký tự)"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Bạn đã có tài khoản rồi?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
