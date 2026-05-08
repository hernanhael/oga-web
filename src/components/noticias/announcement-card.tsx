"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Pin, MoreVertical, Edit2, Trash2, PinOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypeBadge } from "./type-badge";
import { TiptapViewer } from "./tiptap-viewer";
import { cn } from "@/lib/utils";
import type { AnnouncementType } from "./type-badge";

export interface AnnouncementRow {
  id: string;
  title: string;
  content: Record<string, unknown> | null;
  type: AnnouncementType;
  authorId: string | null;
  authorName: string | null;
  publishedAt: string | Date | null;
  expiresAt: string | Date | null;
  pinned: boolean;
  createdAt: string | Date;
}

// OKLCH left-border accent per announcement type
const typeAccentColor: Record<AnnouncementType, string> = {
  news:      "oklch(0.546 0.133 252)",
  authority: "oklch(0.65  0.12  65)",
  event:     "oklch(0.55  0.13  155)",
  birthday:  "oklch(0.62  0.15  350)",
};

interface AnnouncementCardProps {
  announcement: AnnouncementRow;
  userRole: string;
  onEdit?: (announcement: AnnouncementRow) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string, pinned: boolean) => void;
}

export function AnnouncementCard({
  announcement,
  userRole,
  onEdit,
  onDelete,
  onTogglePin,
}: AnnouncementCardProps) {
  const canEdit = ["admin", "supervisor"].includes(userRole);
  const canDelete = userRole === "admin";

  const createdDate = announcement.createdAt
    ? new Date(announcement.createdAt)
    : null;

  return (
    <Card
      className={cn(
        "relative border-l-[3px] transition-all duration-200",
        "hover:shadow-md hover:-translate-y-px",
        announcement.pinned && "shadow-sm"
      )}
      style={{ borderLeftColor: typeAccentColor[announcement.type] }}
    >
      {/* Pinned ribbon */}
      {announcement.pinned && (
        <div
          className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg"
          style={{
            background: "oklch(0.546 0.133 252 / 0.1)",
            color: "oklch(0.546 0.133 252)",
          }}
        >
          <Pin className="w-2.5 h-2.5 fill-current" />
          Fijado
        </div>
      )}

      <CardContent className="pt-0 pb-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <TypeBadge type={announcement.type} />

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none ml-auto"
                aria-label="Opciones"
              >
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(announcement)}>
                  <Edit2 />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onTogglePin?.(announcement.id, !announcement.pinned)
                  }
                >
                  {announcement.pinned ? (
                    <><PinOff />Desfijar</>
                  ) : (
                    <><Pin />Fijar</>
                  )}
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete?.(announcement.id)}
                    >
                      <Trash2 />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-2.5 pr-16">
          {announcement.title}
        </h3>

        {/* Rich content */}
        {announcement.content && (
          <div className="text-sm text-foreground/80 mb-3">
            <TiptapViewer content={announcement.content} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-border/40">
          {announcement.authorName && (
            <span className="text-xs font-medium text-muted-foreground">
              {announcement.authorName}
            </span>
          )}
          {announcement.authorName && createdDate && (
            <span className="text-muted-foreground/40 text-xs">·</span>
          )}
          {createdDate && (
            <span className="text-xs text-muted-foreground/70">
              {formatDistanceToNow(createdDate, { addSuffix: true, locale: es })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
