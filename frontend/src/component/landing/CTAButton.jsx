import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary:
    "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/20 hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline-emerald-300",
  secondary:
    "border border-white/20 bg-white/10 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-white",
  light:
    "border border-slate-200 bg-white text-slate-950 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-emerald-500",
  ghost:
    "text-slate-700 hover:bg-slate-100 focus-visible:outline-emerald-500",
};

function CTAButton({
  to = "#contact",
  children,
  variant = "primary",
  className = "",
  showArrow = true,
  onClick,
  ...props
}) {
  const classes = `${baseClasses} ${variants[variant] || variants.primary} ${className}`;
  const content = (
    <>
      <span>{children}</span>
      {showArrow ? <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> : null}
    </>
  );

  if (to?.startsWith("/")) {
    return (
      <Link className={classes} to={to} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <a className={classes} href={to} onClick={onClick} {...props}>
      {content}
    </a>
  );
}

export default CTAButton;
