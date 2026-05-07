"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BirthdayBannerProps {
  today: Array<{ id: string; name: string }>;
  tomorrow: Array<{ id: string; name: string }>;
}

export function BirthdayBanner({ today, tomorrow }: BirthdayBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if ((today.length === 0 && tomorrow.length === 0) || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="rounded-xl overflow-hidden border"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.97 0.04 70), oklch(0.96 0.06 55))",
          borderColor: "oklch(0.85 0.07 65)",
        }}
      >
        <div className="px-5 py-4 flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5" aria-hidden>
            🎂
          </span>
          <div className="flex-1 min-w-0">
            {today.length > 0 && (
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: "oklch(0.35 0.08 55)" }}
              >
                Hoy cumplen años:{" "}
                <span className="font-bold">
                  {today.map((u) => u.name).join(", ")}
                </span>
              </p>
            )}
            {tomorrow.length > 0 && (
              <p
                className="text-sm mt-0.5 leading-snug"
                style={{ color: "oklch(0.42 0.07 60)" }}
              >
                Mañana:{" "}
                <span className="font-medium">
                  {tomorrow.map((u) => u.name).join(", ")}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-md transition-colors hover:bg-black/10"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" style={{ color: "oklch(0.42 0.07 60)" }} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
