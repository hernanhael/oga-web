"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "./tiptap-editor";
import { createAnnouncement, updateAnnouncement } from "@/app/(protected)/noticias/actions";
import type { AnnouncementRow } from "./announcement-card";

const formSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  type: z.enum(["news", "authority", "event", "birthday"]),
  content: z.any().optional().nullable(),
  expiresAt: z.string().nullable().optional(),
  pinned: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  announcement?: AnnouncementRow | null;
}

export function AnnouncementDialog({
  open,
  onClose,
  onSuccess,
  announcement,
}: AnnouncementDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!announcement;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "news",
      content: null,
      expiresAt: null,
      pinned: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (announcement) {
        form.reset({
          title: announcement.title,
          type: announcement.type,
          content: announcement.content ?? null,
          expiresAt: announcement.expiresAt
            ? new Date(announcement.expiresAt).toISOString().slice(0, 10)
            : null,
          pinned: announcement.pinned,
        });
      } else {
        form.reset({
          title: "",
          type: "news",
          content: null,
          expiresAt: null,
          pinned: false,
        });
      }
    }
  }, [open, announcement, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateAnnouncement(announcement!.id, values);
        toast.success("Anuncio actualizado");
      } else {
        await createAnnouncement(values);
        toast.success("Anuncio publicado");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:!max-w-xl overflow-y-auto flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>
            {isEdit ? "Editar anuncio" : "Nuevo anuncio"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modificá el contenido del anuncio."
              : "Completá los datos para publicar el anuncio en el feed."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form
              id="announcement-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título del anuncio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="news">Novedad</option>
                        <option value="authority">Comunicado</option>
                        <option value="event">Evento</option>
                        <option value="birthday">Cumpleaños</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vence el (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value || null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pinned"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5">
                    <FormControl>
                      <input
                        type="checkbox"
                        id="pinned-checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="w-4 h-4 rounded border-input accent-primary"
                      />
                    </FormControl>
                    <FormLabel htmlFor="pinned-checkbox" className="!mt-0 cursor-pointer">
                      Fijar en la parte superior
                    </FormLabel>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="announcement-form"
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : isEdit
              ? "Guardar cambios"
              : "Publicar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
