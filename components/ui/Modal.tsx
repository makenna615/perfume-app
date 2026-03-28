"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/55 will-change-opacity"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4 sm:p-6 md:p-8 pointer-events-none will-change-opacity"
          >
            <div
              className={`relative modal-panel rounded-2xl ${sizeStyles[size]} w-full pointer-events-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden`}
              style={{
                borderRadius: "1rem",
                backgroundColor: "#121528",
                backgroundImage:
                  "linear-gradient(145deg, rgba(108, 126, 231, 0.12) 0%, rgba(79, 157, 216, 0.07) 32%, rgba(18, 21, 40, 1) 100%)",
                border: "1px solid rgba(72, 82, 122, 0.62)",
                boxShadow:
                  "0 22px 56px rgba(0, 0, 0, 0.62), inset 0 0 0 1px rgba(108, 126, 231, 0.14)",
              }}
            >
              <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-slate-700/30">
                <h2 className="text-2xl font-playfair font-bold text-gradient">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-600/60 bg-perfume-surface/70 text-pale-purple/80 shadow-premium hover:text-white hover:border-perfume-accent/80 hover:bg-gradient-to-r hover:from-perfume-accent/35 hover:to-pale-blue/30 hover:shadow-luxury focus:outline-none focus:ring-2 focus:ring-perfume-accent/40 transition-all duration-200 cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
