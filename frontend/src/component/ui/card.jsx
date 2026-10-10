export function Card({ children, className = "" }) {
  return (
    <div className={`theme-card ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  const hasCustomPadding = /(^|\s)p[trblxy]?-[^\s]+/.test(className);
  return <div className={`${hasCustomPadding ? "" : "p-3.5"} ${className}`}>{children}</div>;
}
