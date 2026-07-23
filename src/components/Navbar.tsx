"use client"
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo (Anti-Slop Geometric Design) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-5 h-5 bg-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300">
            <div className="w-2.5 h-2.5 bg-zinc-950" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Lexibase</span>
        </Link>

        {/* Auth State */}
        <div>
          {status === "loading" ? (
            <div className="w-20 h-8 animate-pulse bg-zinc-800" />
          ) : session ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="border-zinc-800 bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800">
                Sign Out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="bg-white text-black hover:bg-zinc-200 font-medium">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
