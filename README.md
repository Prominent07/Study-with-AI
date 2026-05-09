# StudyAI — AI-Powered Academic Workspace

> A modular, dark-mode-first academic workspace built with React + Vite + TypeScript + TailwindCSS.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript (strict) |
| Styling | TailwindCSS v3 |
| State | Zustand |
| Routing | React Router v6 |
| Icons | lucide-react |

## Project Structure

```
src/
├── components/ui/      # Shared: Button, Input, Badge, Tooltip
├── features/
│   ├── sidebar/        # Left navigation panel
│   ├── editor/         # Main editor area
│   └── ai-panel/       # Right AI assistant panel
├── layouts/            # WorkspaceLayout (3-panel shell)
├── pages/              # Route-level page components
├── store/              # Zustand stores (layout, AI, workspace)
├── hooks/              # useMediaQuery, useKeyboard
├── services/ai/        # AI provider stubs (future: real SDK calls)
├── types/              # Shared TypeScript interfaces
├── router/             # React Router config
└── styles/             # globals.css (Tailwind + CSS tokens)
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + B` | Toggle sidebar |
| `Ctrl/⌘ + J` | Toggle AI panel |

## Planned Features (Future Phases)

- [ ] Rich text editor (TipTap / Lexical)
- [ ] AI chat integration (OpenAI, Anthropic, Google)
- [ ] PDF viewer + AI analysis
- [ ] Flashcard spaced repetition system
- [ ] Infinite canvas / mind maps
- [ ] Knowledge graph visualization
- [ ] Offline support (IndexedDB + Service Workers)
- [ ] Collaboration (WebSockets / CRDTs)
