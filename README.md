# StudyAI — AI-Powered Academic Workspace

StudyAI is a premium, offline-first academic workspace designed for students and researchers. It combines a robust Tiptap-based note-taking engine with a deep AI context system, an infinite whiteboard canvas, and research tools.

## 🚀 Features

- **Multi-Note Management**: Hierarchical folders, tabs, and backlinks.
- **AI Assistant**: Context-aware sidebar with multi-provider support (OpenAI, Anthropic, Gemini).
- **Infinite Canvas**: Brainstorm and visualize ideas using the integrated `tldraw` engine.
- **PWA & Offline-First**: Fully installable and functional without an internet connection.
- **Research Hub**: Integrated PDF viewer and source management.
- **Knowledge Graph**: Track backlinks and interconnected concepts.
- **Study Engine**: Automated flashcard generation and revision tracking.

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file based on `.env.example` and add your AI provider API keys.

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Deployment**:
   ```bash
   npm run deploy
   ```

## 🏗️ Architecture

- **Core**: Decoupled infrastructure for events, sync, and plugins in `src/core/`.
- **State**: Modular Zustand stores for every major feature area.
- **UI**: Modern, neutral dark-mode design system built with Tailwind CSS.

---
Built with ❤️ for the future of learning.
