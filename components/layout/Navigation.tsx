"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/discover", label: "Discover" },
    { href: "/builder", label: "Builder" },
    { href: "/ingredients", label: "Ingredients" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-perfume-dark/75 backdrop-blur-md border-b border-slate-700/30 shadow-lg shadow-perfume-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="text-3xl"
            >
              🧴
            </motion.div>
            <motion.span
              whileHover={{ letterSpacing: "0.05em" }}
              transition={{ duration: 0.3 }}
              className="font-playfair font-bold text-xl bg-gradient-to-r from-perfume-accent via-pale-blue to-pale-green bg-clip-text text-transparent tracking-wide"
            >
              Scent Lab
            </motion.span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-2 items-center">
            {links.map((link) => (
              <motion.div key={link.href} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
                <Link
                  href={link.href}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 font-inter cursor-pointer hover:shadow-lg hover:shadow-perfume-accent/30 ${
                    pathname === link.href
                      ? "bg-gradient-to-r from-perfume-accent to-pale-blue text-white shadow-luxury"
                      : "text-pale-purple/80 hover:text-pale-blue hover:bg-perfume-surface/50"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 font-inter cursor-pointer border border-slate-600/70 text-pale-purple/80 hover:text-white hover:border-perfume-accent/80 hover:bg-gradient-to-r hover:from-perfume-accent/30 hover:to-pale-blue/20"
            >
              Log out
            </motion.button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-perfume-surface/50"
            >
              <SparklesIcon className="w-6 h-6 text-pale-green" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
