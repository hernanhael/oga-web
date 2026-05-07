"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Menu, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { signOut } from "@/lib/auth-client";

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  employee: "Empleado",
  readonly: "Solo lectura",
};

interface HeaderUser {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string | null;
}

export function Header({ user }: { user: HeaderUser }) {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b border-border bg-background shrink-0">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="w-5 h-5" />
      </Button>

      {/* Desktop: breadcrumbs placeholder */}
      <div className="hidden lg:block" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notification bell */}
        <NotificationBell userId={user.id} />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 ml-1 h-9 rounded-md hover:bg-accent transition-colors cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                {roleLabel[user.role] ?? user.role}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
