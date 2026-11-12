import { Magnetic } from "./Magnetic";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  magnetic?: boolean;
  wrapClassName?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

/** One button family: solid red primary, cream outline secondary. Press scales to .97. */
export function Button({ href, children, variant = "primary", className = "", magnetic = true, wrapClassName = "", ...rest }: Props) {
  const base =
    "group relative inline-flex min-h-14 items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full px-7 text-[1.0625rem] font-medium tracking-[-0.01em] select-none " +
    "transition-[transform,background-color,color,border-color] duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]";
  const look =
    variant === "primary"
      ? "bg-accent text-white [@media(hover:hover)]:hover:bg-accent-hot"
      : "border border-ink/30 text-ink [@media(hover:hover)]:hover:border-ink [@media(hover:hover)]:hover:bg-ink/5";
  const a = (
    <a href={href} className={`${base} ${look} ${className}`} {...rest}>
      <span className="relative">{children}</span>
      <svg aria-hidden viewBox="0 0 16 16" className="relative size-4 transition-transform duration-200 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:translate-x-1">
        <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
  return magnetic ? <Magnetic className={wrapClassName}>{a}</Magnetic> : a;
}
