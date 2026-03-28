interface EmptyStateProps {
  icon: string;
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
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-pale-blue mb-2">{title}</h3>
      <p className="text-pale-purple/70 max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-perfume-accent hover:bg-perfume-accent/80 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
