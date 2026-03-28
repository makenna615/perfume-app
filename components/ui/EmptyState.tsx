interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="flex justify-center mb-6">
        <div className="text-6xl md:text-7xl opacity-80 hover:opacity-100 transition-opacity duration-300">
          {typeof icon === 'string' ? icon : icon}
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl font-playfair font-bold text-pale-blue mb-3">{title}</h3>
      <p className="text-pale-purple/70 max-w-md mx-auto mb-8 font-inter text-lg leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-gradient-to-r from-perfume-accent via-pale-purple to-pale-blue border border-transparent hover:shadow-luxury shadow-premium text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
