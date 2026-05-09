/**
 * features/editor/components/EditorToolbar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full rich-text toolbar connected to the Tiptap editor instance.
 *
 * Groups (with visual separators):
 *   1. History     — Undo / Redo
 *   2. Text style  — Bold / Italic / Underline / Strikethrough
 *   3. Headings    — H1 / H2 / H3
 *   4. Lists       — Bullet / Ordered
 *   5. Blocks      — Code block / Highlight / Blockquote
 *   6. Alignment   — Left / Center / Right
 *
 * The toolbar scrolls horizontally on small tablets — no wrapping.
 * Touch targets are 32×32px minimum (WCAG 2.5.5).
 */

import React from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  Code2, Highlighter, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

// ── Toolbar group separator ───────────────────────────────────────────────────
const Divider: React.FC = () => (
  <div className="w-px h-5 bg-workspace-border mx-1 flex-shrink-0" aria-hidden="true" />
);

// ── Props ─────────────────────────────────────────────────────────────────────
interface EditorToolbarProps {
  editor: Editor | null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const disabled = !editor;

  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto scrollbar-none px-2 flex-shrink-0"
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* ── 1. History ── */}
      <ToolbarButton
        tooltip="Undo (⌘Z)"
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={disabled || !editor?.can().undo()}
      >
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Redo (⌘⇧Z)"
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={disabled || !editor?.can().redo()}
      >
        <Redo2 size={15} />
      </ToolbarButton>

      <Divider />

      {/* ── 2. Text style ── */}
      <ToolbarButton
        tooltip="Bold (⌘B)"
        isActive={editor?.isActive('bold') ?? false}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        disabled={disabled}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Italic (⌘I)"
        isActive={editor?.isActive('italic') ?? false}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        disabled={disabled}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Underline (⌘U)"
        isActive={editor?.isActive('underline') ?? false}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        disabled={disabled}
      >
        <Underline size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Strikethrough"
        isActive={editor?.isActive('strike') ?? false}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        disabled={disabled}
      >
        <Strikethrough size={15} />
      </ToolbarButton>

      <Divider />

      {/* ── 3. Headings ── */}
      <ToolbarButton
        tooltip="Heading 1"
        isActive={editor?.isActive('heading', { level: 1 }) ?? false}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={disabled}
      >
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Heading 2"
        isActive={editor?.isActive('heading', { level: 2 }) ?? false}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={disabled}
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Heading 3"
        isActive={editor?.isActive('heading', { level: 3 }) ?? false}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={disabled}
      >
        <Heading3 size={15} />
      </ToolbarButton>

      <Divider />

      {/* ── 4. Lists ── */}
      <ToolbarButton
        tooltip="Bullet list"
        isActive={editor?.isActive('bulletList') ?? false}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        disabled={disabled}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Numbered list"
        isActive={editor?.isActive('orderedList') ?? false}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
      >
        <ListOrdered size={15} />
      </ToolbarButton>

      <Divider />

      {/* ── 5. Blocks ── */}
      <ToolbarButton
        tooltip="Code block"
        isActive={editor?.isActive('codeBlock') ?? false}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        disabled={disabled}
      >
        <Code2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Highlight"
        isActive={editor?.isActive('highlight') ?? false}
        onClick={() => editor?.chain().focus().toggleHighlight().run()}
        disabled={disabled}
      >
        <Highlighter size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Blockquote"
        isActive={editor?.isActive('blockquote') ?? false}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        disabled={disabled}
      >
        <Quote size={15} />
      </ToolbarButton>

      <Divider />

      {/* ── 6. Alignment ── */}
      <ToolbarButton
        tooltip="Align left"
        isActive={editor?.isActive({ textAlign: 'left' }) ?? false}
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        disabled={disabled}
      >
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Align center"
        isActive={editor?.isActive({ textAlign: 'center' }) ?? false}
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        disabled={disabled}
      >
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Align right"
        isActive={editor?.isActive({ textAlign: 'right' }) ?? false}
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        disabled={disabled}
      >
        <AlignRight size={15} />
      </ToolbarButton>
    </div>
  );
};
