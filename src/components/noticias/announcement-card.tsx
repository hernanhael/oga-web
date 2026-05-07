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
        "relative transition-shadow hover:shadow-sm",
        announcement.pinned && "ring-2 ring-primary/20"
      )}
    >
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={announcement.type} />
            {announcement.pinned && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Pin className="w-3 h-3 fill-current" />
                Fijado
              </span>
            )}
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none"
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
                    <>
                      <PinOff />
                      Desfijar
                    </>
                  ) : (
                    <>
                      <Pin />
                      Fijar
                    </>
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

        <h3 className="text-base font-semibold text-foreground mb-2 leading-snug">
          {announcement.title}
        </h3>

        {announcement.content && (
          <div className="text-sm text-foreground/90 mb-3">
            <TiptapViewer content={announcement.content} />
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
          {announcement.authorName && (
            <>
              <span>{announcement.authorName}</span>
              <span>·</span>
            </>
          )}
          {createdDate && (
            <span>
              {formatDistanceToNow(createdDate, { addSuffix: true, locale: es })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
