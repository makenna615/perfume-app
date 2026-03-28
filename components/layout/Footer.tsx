"use client";

import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  const footerLinks = [
    { href: "#", label: "About" },
    { href: "#", label: "Documentation" },
    { href: "#", label: "Privacy" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-perfume-darker border-t border-slate-700/30 mt-24 overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-perfume-accent/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <SparklesIcon className="w-6 h-6 text-pale-green" />
              <h3 className="font-playfair text-2xl font-bold bg-gradient-to-r from-perfume-accent to-pale-blue bg-clip-text text-transparent">
                Scent Lab
              </h3>
            </div>
            <p className="text-pale-purple/70 leading-relaxed font-inter">
              AI-powered perfume discovery and formula creation. Explore, blend, and craft fragrances with precision.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-playfair font-bold text-pale-blue mb-4 text-sm uppercase tracking-wide">Features</h4>
            <ul className="space-y-3 text-pale-purple/70 font-inter">
              <li><a href="/discover" className="hover:text-pale-green transition-colors">Perfume Discovery</a></li>
              <li><a href="/builder" className="hover:text-pale-green transition-colors">Formula Builder</a></li>
              <li><a href="/ingredients" className="hover:text-pale-green transition-colors">Ingredient Library</a></li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-playfair font-bold text-pale-blue mb-4 text-sm uppercase tracking-wide">Resources</h4>
            <ul className="space-y-3 text-pale-purple/70 font-inter">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-pale-green transition-colors duration-200 cursor-pointer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-8" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-pale-purple/60 font-inter"
        >
          <p>© {currentYear} Scent Lab. Powered by AI fragrance science.</p>
          <div className="flex items-center gap-2 text-pale-purple/50 text-xs">
            <span>Crafted with</span>
            <span className="text-pale-green">✨</span>
            <span>for perfume enthusiasts</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
