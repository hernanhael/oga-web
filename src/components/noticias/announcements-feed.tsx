"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  { value: "all",       label: "Todos" },
  { value: "news",      label: "Novedades" },
  { value: "authority", label: "Comunicados" },
  { value: "event",     label: "Eventos" },
  { value: "birthday",  label: "Cumpleaños" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

async function fetchAnnouncements(type: string): Promise<AnnouncementRow[]> {
  const res = await fetch(`/api/announcements?type=${type}`);
  if (!res.ok) throw new Error("Error al cargar anuncios");
  return res.json();
}

// Framer Motion variants
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

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

  // Supabase Realtime (optional)
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("announcements-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, invalidate)
      .subscribe();
    return () => { supabase!.removeChannel(channel); };
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
    <div className="space-y-6">
      {/* Birthday banner */}
      {(birthdayToday.length > 0 || birthdayTomorrow.length > 0) && (
        <BirthdayBanner today={birthdayToday} tomorrow={birthdayTomorrow} />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Novedades y Comunicados
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Información y anuncios del Poder Judicial de Tucumán
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate} size="sm" className="shrink-0 mt-0.5">
            <Plus className="w-4 h-4" />
            Nuevo anuncio
          </Button>
        )}
      </div>

      {/* Filter tabs — segmented control */}
      <div className="inline-flex items-center gap-0.5 bg-muted rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 outline-none
              ${activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 flex flex-col items-center gap-3 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Sin anuncios en esta categoría
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {canCreate ? "Sé el primero en publicar algo." : "Volvé más tarde."}
              </p>
            </div>
            {canCreate && (
              <button
                onClick={handleCreate}
                className="text-sm text-primary hover:underline mt-1"
              >
                Publicar anuncio
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        // key = activeTab forces remount → re-triggers stagger on tab change
        <motion.div
          key={activeTab}
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {data.map((announcement) => (
            <motion.div key={announcement.id} variants={itemVariants}>
              <AnnouncementCard
                announcement={announcement}
                userRole={userRole}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnnouncementDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={invalidate}
        announcement={editingAnnouncement}
      />
    </div>
  );
}
