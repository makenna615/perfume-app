"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import PerfumeLogoIcon from "@/components/ui/PerfumeLogoIcon";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Home",
      activeGradient: "from-[#5f7de5] to-pale-blue",
      hoverStyles: "hover:text-pale-blue hover:border-pale-blue/40 hover:bg-pale-blue/10",
    },
    {
      href: "/discover",
      label: "Discover",
      activeGradient: "from-[#4f9dd8] to-cyan-400",
      hoverStyles: "hover:text-cyan-200 hover:border-cyan-300/40 hover:bg-cyan-400/10",
    },
    {
      href: "/builder",
      label: "Builder",
      activeGradient: "from-[#b148ff] via-[#9650ff] to-[#7a64ff]",
      hoverStyles: "hover:text-purple-100 hover:border-purple-300/50 hover:bg-gradient-to-r hover:from-perfume-accent/30 hover:to-purple-400/25",
    },
    {
      href: "/ingredients",
      label: "Ingredients",
      activeGradient: "from-[#46a1a3] to-emerald-400",
      hoverStyles: "hover:text-emerald-200 hover:border-emerald-300/40 hover:bg-emerald-400/10",
    },
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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="transition-transform duration-200 group-hover:scale-105">
              <PerfumeLogoIcon className="w-9 h-9" />
            </div>
            <div className="font-playfair font-bold text-xl tracking-wide text-white transition-colors duration-200 group-hover:text-pale-blue">
              MIP
            </div>
          </Link>

          <div className="hidden md:flex gap-2 items-center">
            {links.map((link) => (
              <motion.div key={link.href} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
                <Link
                  href={link.href}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 font-inter cursor-pointer ${
                    pathname === link.href
                      ? `bg-gradient-to-r ${link.activeGradient} text-white shadow-luxury`
                      : `border border-slate-700/40 text-pale-purple/80 ${link.hoverStyles}`
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
