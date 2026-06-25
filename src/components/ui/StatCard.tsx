import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent";
  subtitle?: string;
}

const colorMap = {
  primary: "bg-btx-primary/10 text-btx-primary",
  secondary: "bg-btx-secondary/20 text-btx-primary",
  accent: "bg-btx-accent/10 text-btx-accent",
};

export function StatCard({ title, value, icon: Icon, color = "primary", subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 card-shadow border border-border/50 hover:card-shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-btx-primary mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
