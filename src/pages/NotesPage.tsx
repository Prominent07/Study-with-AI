/**
 * pages/NotesPage.tsx
 * Primary notes workspace page.
 * Renders the MainEditor as the content area.
 * Future: will include note list / panel on the left within the editor area.
 */

import React from 'react';
import { MainEditor } from '@/features/editor/MainEditor';

const NotesPage: React.FC = () => {
  return <MainEditor />;
};

export default NotesPage;
