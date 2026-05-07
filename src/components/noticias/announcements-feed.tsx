"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementCard } from "./announcement-card";
import { AnnouncementDialog } from "./announcement-dialog";
import { BirthdayBanner } from "./birthday-banner";
import { supabase } from "@/lib/supabase";
import { deleteAnnouncement, togglePin } from "@/app/(protected)/noticias/actions";
import type { AnnouncementRow } from "./announcement-card";

const TABS = [
  { value: "all", label: "Todos" },
  { value: "news", label: "Novedades" },
  { value: "authority", label: "Comunicados" },
  { value: "event", label: "Eventos" },
  { value: "birthday", label: "Cumpleaños" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

async function fetchAnnouncements(type: string): Promise<AnnouncementRow[]> {
  const res = await fetch(`/api/announcements?type=${type}`);
  if (!res.ok) throw new Error("Error al cargar anuncios");
  return res.json();
}

interface AnnouncementsFeedProps {
  initialData: AnnouncementRow[];
  userRole: string;
  birthdayToday: Array<{ id: string; name: string }>;
  birthdayTomorrow: Array<{ id: string; name: string }>;
}

export function AnnouncementsFeed({
  initialData,
  userRole,
  birthdayToday,
  birthdayTomorrow,
}: AnnouncementsFeedProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementRow | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["announcements", activeTab],
    queryFn: () => fetchAnnouncements(activeTab),
    initialData: activeTab === "all" ? initialData : undefined,
    staleTime: 30_000,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["announcements"] });
  }, [queryClient]);

  // Supabase Realtime (optional — skipped if NEXT_PUBLIC_SUPABASE_URL not set)
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("announcements-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        invalidate
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [invalidate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este anuncio?")) return;
    try {
      await deleteAnnouncement(id);
      invalidate();
      toast.success("Anuncio eliminado");
    } catch {
      toast.error("No se pudo eliminar el anuncio");
    }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    try {
      await togglePin(id, pinned);
      invalidate();
      toast.success(pinned ? "Anuncio fijado" : "Anuncio desfijado");
    } catch {
      toast.error("No se pudo actualizar el anuncio");
    }
  };

  const handleEdit = (announcement: AnnouncementRow) => {
    setEditingAnnouncement(announcement);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const canCreate = ["admin", "supervisor"].includes(userRole);

  return (
    <div className="space-y-5">
      {/* Birthday banner */}
      {(birthdayToday.length > 0 || birthdayTomorrow.length > 0) && (
        <BirthdayBanner today={birthdayToday} tomorrow={birthdayTomorrow} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          Novedades y Comunicados
        </h1>
        {canCreate && (
          <Button onClick={handleCreate} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo anuncio
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">
            No hay anuncios en esta categoría.
          </p>
          {canCreate && (
            <button
              onClick={handleCreate}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Publicar el primero
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              userRole={userRole}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <AnnouncementDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={invalidate}
        announcement={editingAnnouncement}
      />
    </div>
  );
}
