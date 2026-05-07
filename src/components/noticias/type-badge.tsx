import { cn } from "@/lib/utils";

export type AnnouncementType = "news" | "authority" | "event" | "birthday";

const typeConfig: Record<AnnouncementType, { label: string; className: string }> = {
  news: {
    label: "Novedad",
    className: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  },
  authority: {
    label: "Comunicado",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  },
  event: {
    label: "Evento",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  birthday: {
    label: "Cumpleaños",
    className: "bg-pink-100 text-pink-900 dark:bg-pink-900/30 dark:text-pink-200",
  },
};

export function TypeBadge({ type }: { type: AnnouncementType }) {
  const config = typeConfig[type] ?? typeConfig.news;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export { typeConfig };
