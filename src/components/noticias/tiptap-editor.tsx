"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Heading2, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  value?: Record<string, unknown> | null;
  onChange?: (value: Record<string, unknown>) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Escribí el contenido aquí...",
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? undefined,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[160px] px-3 py-2.5 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor || value === undefined) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value ?? null);
    if (current !== next) {
      editor.commands.setContent(value ?? "");
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "border border-input rounded-md overflow-hidden bg-background",
        className
      )}
    >
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-input bg-muted/30">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Negrita"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Cursiva"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Título"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Lista"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Cita"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent",
        active && "bg-accent text-foreground"
      )}
    >
      {children}
    </button>
  );
}
