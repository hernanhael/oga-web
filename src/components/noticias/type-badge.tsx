import { cn } from "@/lib/utils";
import { Newspaper, Volume2, CalendarDays, Gift } from "lucide-react";

export type AnnouncementType = "news" | "authority" | "event" | "birthday";

const typeConfig: Record<
  AnnouncementType,
  { label: string; icon: React.ElementType; style: React.CSSProperties; darkStyle?: React.CSSProperties }
> = {
  news: {
    label: "Novedad",
    icon: Newspaper,
    style: {
      background: "oklch(0.93 0.04 252)",
      color: "oklch(0.38 0.13 252)",
      borderColor: "oklch(0.80 0.07 252)",
    },
  },
  authority: {
    label: "Comunicado",
    icon: Volume2,
    style: {
      background: "oklch(0.95 0.05 70)",
      color: "oklch(0.38 0.10 65)",
      borderColor: "oklch(0.82 0.09 65)",
    },
  },
  event: {
    label: "Evento",
    icon: CalendarDays,
    style: {
      background: "oklch(0.93 0.04 155)",
      color: "oklch(0.36 0.10 155)",
      borderColor: "oklch(0.78 0.08 155)",
    },
  },
  birthday: {
    label: "Cumpleaños",
    icon: Gift,
    style: {
      background: "oklch(0.94 0.04 350)",
      color: "oklch(0.42 0.13 350)",
      borderColor: "oklch(0.80 0.09 350)",
    },
  },
};

interface TypeBadgeProps {
  type: AnnouncementType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const config = typeConfig[type] ?? typeConfig.news;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        className
      )}
      style={config.style}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {config.label}
    </span>
  );
}

export { typeConfig };
