"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <div className="relative">
        <div className={`${sizes[size]} border-slate-700/40 border-t-perfume-accent rounded-full animate-spin`} />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-perfume-accent/10 to-pale-cyan/10 blur-lg" />
      </div>
      {text && <p className="text-pale-blue font-inter text-base font-medium tracking-wide">{text}</p>}
    </div>
  );
}

export function ShimmerLoader() {
  return (
    <div className="space-y-4">
      <div className="animate-shimmer h-20 bg-gradient-to-r from-perfume-surface via-perfume-accent/10 to-perfume-surface rounded-2xl" />
      <div className="space-y-3">
        <div className="animate-shimmer h-4 bg-gradient-to-r from-perfume-surface via-perfume-accent/10 to-perfume-surface rounded-lg w-3/4" />
        <div className="animate-shimmer h-4 bg-gradient-to-r from-perfume-surface via-perfume-accent/10 to-perfume-surface rounded-lg w-1/2" />
      </div>
    </div>
  );
}
