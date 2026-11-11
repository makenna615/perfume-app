interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

/** A sheet of slightly brighter paper with a hairline border. */
export default function Card({ children, className = "", as: Tag = "div" }: CardProps) {
  return <Tag className={`rounded-sm border border-line bg-card ${className}`}>{children}</Tag>;
}
