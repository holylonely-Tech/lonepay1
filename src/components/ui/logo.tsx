import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
}

export function Logo({ className, size = "md", markOnly = false }: LogoProps) {
  const heights = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
  };

  return (
    <span
      className={cn("inline-flex items-center gap-3 select-none", className)}
    >
      {/* Official LonePay Mark with LoneDot */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", heights[size], "aspect-square")}
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="16" fill="#16A34A" />
        <path
          d="M20 17V45H31"
          stroke="#0B2E1A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="43" cy="45" r="5.5" fill="#0B2E1A" />
      </svg>

      {!markOnly && (
        <span className="font-extrabold tracking-tight text-foreground flex items-center text-xl sm:text-2xl">
          <span>Lone</span>
          <span className="text-accent">Pay</span>
        </span>
      )}
    </span>
  );
}
