"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Network,
  Calendar,
  LayoutGrid,
  BookOpen,
  ClipboardList,
  Scale,
} from "lucide-react";

const navItems = [
  { label: "Novedades", href: "/noticias", icon: Newspaper },
  { label: "Organigrama", href: "/organigrama", icon: Network },
  { label: "Calendario", href: "/agenda/calendario", icon: Calendar },
  { label: "Tablero", href: "/agenda/tablero", icon: LayoutGrid },
  { label: "Docencia", href: "/educacion", icon: BookOpen },
  { label: "Procedimientos", href: "/procedimientos", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0">
          <Scale className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            OGA Civil N°3
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Poder Judicial
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
