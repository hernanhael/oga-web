"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

interface TiptapViewerProps {
  content: Record<string, unknown> | null | undefined;
  className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? undefined,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none",
      },
    },
  });

  if (!content) return null;

  return (
    <div className={cn(className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
