import Link from "next/link";

interface LogoProps {
  locale: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export function Logo({ locale, variant = "dark", size = "md" }: LogoProps) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };
  const textColor = variant === "light" ? "text-white" : "text-btx-primary";

  return (
    <Link href={`/${locale}`} className="flex items-center gap-3 group">
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-btx-secondary flex items-center justify-center font-bold text-btx-primary text-sm shadow-md group-hover:scale-105 transition-transform">
          BTX
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-btx-accent border-2 border-white" />
      </div>
      <div className="hidden sm:block">
        <div className={`font-bold leading-tight ${sizes[size]} ${textColor}`}>
          BTX
        </div>
        <div className={`text-xs ${variant === "light" ? "text-white/70" : "text-gray-500"}`}>
          Bin Tuwaym Excellence
        </div>
      </div>
    </Link>
  );
}
