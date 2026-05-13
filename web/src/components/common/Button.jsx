export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const baseClasses =
    "font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-cyan-400 text-white hover:shadow-lg hover:shadow-primary/50 hover:from-cyan-400 hover:to-primary",
    secondary:
      "bg-secondary text-white border border-secondary hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/50",
    accent:
      "bg-accent text-white border border-accent hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/50",
    glass:
      "glass text-white border border-white/20 hover:bg-white/15 hover:border-primary/50 hover:shadow-lg",
    ghost:
      "text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20",
    outline:
      "border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
    xl: "px-10 py-4 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
