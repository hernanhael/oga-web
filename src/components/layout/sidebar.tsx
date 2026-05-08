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
  { label: "Novedades",      href: "/noticias",          icon: Newspaper    },
  { label: "Organigrama",    href: "/organigrama",        icon: Network      },
  { label: "Calendario",     href: "/agenda/calendario",  icon: Calendar     },
  { label: "Tablero",        href: "/agenda/tablero",     icon: LayoutGrid   },
  { label: "Docencia",       href: "/educacion",          icon: BookOpen     },
  { label: "Procedimientos", href: "/procedimientos",     icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-white"
          style={{ background: "oklch(0.546 0.133 252)" }}
        >
          <Scale className="w-[15px] h-[15px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-sidebar-foreground truncate leading-tight">
            OGA Civil N°3
          </p>
          <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
            Poder Judicial · Tucumán
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 mb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-1">
            Áreas
          </p>
        </div>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 py-2 text-sm font-medium transition-all duration-150",
                "border-l-[3px] mr-3 rounded-r-md",
                active
                  ? "border-l-primary bg-primary/10 text-primary pl-[13px]"
                  : "border-l-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground pl-[13px]"
              )}
            >
              <item.icon
                className={cn(
                  "w-[15px] h-[15px] shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/40 text-center tracking-wide">
          v0.1 — 2026
        </p>
      </div>
    </aside>
  );
}
