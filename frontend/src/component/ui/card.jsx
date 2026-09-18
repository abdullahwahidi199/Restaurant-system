export function Card({ children, className = "" }) {
  return (
    <div className={`theme-card ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
