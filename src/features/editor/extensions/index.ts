/**
 * features/editor/extensions/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Tiptap extension configuration.
 *
 * All extensions live here so adding/removing/configuring them is a
 * one-file change. Components never import extensions directly.
 *
 * Extension groups:
 *   Core     — StarterKit (Heading, Bold, Italic, Lists, Code, etc.)
 *   Text     — Underline, Typography, TextAlign
 *   Visual   — Highlight
 *   UX       — Placeholder
 *
 * Future extensions to add here (not yet):
 *   - @tiptap/extension-mathematics (LaTeX equations)
 *   - @tiptap/extension-collaboration (Y.js)
 *   - @tiptap/extension-image
 *   - @tiptap/extension-link
 *   - Custom BacklinkExtension
 *   - Custom FlashcardExtension (slash command block)
 */

import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import TextAlign from '@tiptap/extension-text-align';
import type { Extensions } from '@tiptap/react';

export function buildExtensions(): Extensions {
  return [
    // ── Core ──────────────────────────────────────────────────────────────
    StarterKit.configure({
      // Disable StarterKit's codeBlock so our configured version takes over
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4],
      },
      // Bullet list + ordered list enabled by default in StarterKit
    }),

    // ── Text formatting ────────────────────────────────────────────────────
    Underline,

    Typography,   // Smart quotes, em-dashes, ellipsis, etc.

    // ── Highlight ─────────────────────────────────────────────────────────
    Highlight.configure({
      multicolor: true,   // Enables colored highlights (future: AI highlight)
    }),

    // ── Code blocks ───────────────────────────────────────────────────────
    CodeBlock.configure({
      // Future: swap HTMLAttributes for lowlight syntax highlighting
      HTMLAttributes: {
        class: 'editor-code-block',
      },
    }),

    // ── Text alignment ────────────────────────────────────────────────────
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'left',
    }),

    // ── Placeholder ───────────────────────────────────────────────────────
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading' && node.attrs.level === 1) {
          return 'Heading…';
        }
        return 'Write something, or press / for commands…';
      },
      showOnlyCurrent: true,
    }),
  ];
}
