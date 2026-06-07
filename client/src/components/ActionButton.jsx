const variants = {
  brass: "bg-brass text-ink hover:bg-chartreuse",
  danger: "bg-cinnabar text-paper hover:bg-ink",
  dark: "bg-ink text-paper hover:bg-mineral",
  ghost: "border-2 border-ink bg-transparent text-ink hover:bg-chartreuse",
  light: "bg-paper text-ink hover:bg-chartreuse"
};

const ActionButton = ({ children, className = "", variant = "dark", ...props }) => (
  <button
    className={[
      "inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition duration-200 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
      variants[variant] || variants.dark,
      className
    ].join(" ")}
    type="button"
    {...props}
  >
    {children}
  </button>
);

export default ActionButton;
