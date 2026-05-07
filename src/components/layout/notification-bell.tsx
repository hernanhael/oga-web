"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notification } from "@/lib/db/schema";

interface NotificationBellProps {
  userId: string;
}

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) return [];
  return res.json();
}

async function markAsRead(id: string) {
  await fetch(`/api/notifications/${id}`, { method: "PATCH" });
}

export function NotificationBell({ userId }: NotificationBellProps) {
  void userId; // reserved for per-user Realtime subscription
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60_000,
  });

  const unreadCount = items.filter((n) => !n.read).length;

  const handleMark = async (id: string) => {
    await markAsRead(id);
    queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
      prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? []
    );
  };

  const handleMarkAll = async () => {
    const unread = items.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
    queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
      prev?.map((n) => ({ ...n, read: true })) ?? []
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-md text-sm transition-colors hover:bg-accent focus:outline-none"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-1.5 py-1">
          <DropdownMenuLabel className="py-0">Notificaciones</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Sin notificaciones
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                onClick={() => !notif.read && handleMark(notif.id)}
                className="flex items-start gap-2.5 py-2.5 cursor-pointer"
              >
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    notif.read ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                {notif.read && (
                  <Check className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
