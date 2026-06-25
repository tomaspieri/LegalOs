import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-sm",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover flex-shrink-0",
          sizeStyles[size],
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "rounded-full flex-shrink-0 inline-flex items-center justify-center font-semibold",
        "bg-[var(--color-accent)] text-white",
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
