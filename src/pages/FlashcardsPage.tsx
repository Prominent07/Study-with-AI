/**
 * pages/FlashcardsPage.tsx
 * Spaced repetition flashcard system — future Anki-style study tool.
 */

import React, { useState } from 'react';
import { Zap, Plus, Search, Brain, Check, X as CloseIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import { useRevisionStore } from '@/store/useRevisionStore';
import type { Flashcard } from '@/types';

const ReviewSession: React.FC<{ cards: Flashcard[]; onFinish: () => void }> = ({ cards, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { submitReview } = useFlashcardStore();
  const { logSession } = useRevisionStore();

  const currentCard = cards[currentIndex];

  const handleScore = (score: 1 | 2 | 3 | 4 | 5) => {
    submitReview(currentCard.id, score);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      logSession(cards.length, cards.length * 5000); // mock 5s per card
      onFinish();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-4">
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-sm text-ink-muted">Card {currentIndex + 1} of {cards.length}</span>
        <Button variant="ghost" size="sm" onClick={onFinish} leftIcon={<CloseIcon size={14} />}>End Session</Button>
      </div>

      <div className="w-full min-h-[300px] bg-workspace-surface border border-workspace-border rounded-2xl shadow-card flex flex-col p-8 mb-8 relative">
        <div className="absolute top-4 right-4 flex gap-1">
          {currentCard.tags.map(t => (
            <span key={t} className="px-2 py-0.5 rounded bg-workspace-raised text-[10px] text-ink-faint">{t}</span>
          ))}
        </div>
        
        <div className="flex-1 flex items-center justify-center text-center mb-8">
          <p className="text-lg text-ink-primary font-medium leading-relaxed">{currentCard.front}</p>
        </div>

        {showAnswer && (
          <div className="flex-1 flex items-center justify-center text-center border-t border-workspace-border pt-8 fade-in">
            <p className="text-lg text-ink-secondary leading-relaxed">{currentCard.back}</p>
          </div>
        )}
      </div>

      {!showAnswer ? (
        <Button variant="primary" className="w-48" onClick={() => setShowAnswer(true)}>
          Show Answer
        </Button>
      ) : (
        <div className="flex gap-2 w-full justify-center fade-in">
          <Button variant="outline" className="w-24 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => handleScore(5)}>Hard</Button>
          <Button variant="outline" className="w-24 border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={() => handleScore(3)}>Good</Button>
          <Button variant="outline" className="w-24 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => handleScore(1)}>Easy</Button>
        </div>
      )}
    </div>
  );
};

const FlashcardsPage: React.FC = () => {
  const { cards, getCardsDueForReview } = useFlashcardStore();
  const dueCards = getCardsDueForReview();
  const [isReviewing, setIsReviewing] = useState(false);

  if (isReviewing && dueCards.length > 0) {
    return (
      <div className="h-full bg-workspace-bg">
        <ReviewSession cards={dueCards} onFinish={() => setIsReviewing(false)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-workspace-bg">
      <div className="h-[52px] flex items-center justify-between px-6 border-b border-workspace-border bg-workspace-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-accent-light" />
          <span className="text-sm font-semibold text-ink-primary">Flashcards</span>
        </div>
        <div className="flex gap-2">
          {dueCards.length > 0 && (
            <Button variant="primary" size="sm" onClick={() => setIsReviewing(true)} leftIcon={<Brain size={14} />}>
              Review {dueCards.length} Due
            </Button>
          )}
          <Button variant="outline" size="sm" leftIcon={<Plus size={14} />}>
            New Card
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {cards.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full gap-5">
            <div className="w-16 h-16 rounded-2xl bg-workspace-raised border border-workspace-border flex items-center justify-center">
              <Zap size={32} className="text-ink-faint" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-ink-primary mb-2">No Flashcards Yet</h1>
              <p className="text-sm text-ink-muted max-w-xs">
                Create cards manually or generate them from your notes using AI.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-semibold text-ink-primary mb-4">All Cards ({cards.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map(c => (
                <div key={c.id} className="bg-workspace-surface border border-workspace-border rounded-xl p-4 flex flex-col hover:border-accent/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-ink-muted uppercase">Front</span>
                    <span className="text-[10px] text-ink-faint">Diff: {c.difficulty}/5</span>
                  </div>
                  <p className="text-sm text-ink-primary mb-4 line-clamp-2">{c.front}</p>
                  
                  <span className="text-xs font-semibold text-ink-muted uppercase mb-1">Back</span>
                  <p className="text-sm text-ink-secondary line-clamp-2 mb-4">{c.back}</p>

                  <div className="mt-auto pt-3 border-t border-workspace-border flex justify-between items-center">
                    <div className="flex gap-1">
                      {c.tags.slice(0,2).map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-workspace-raised text-[9px] text-ink-faint">{t}</span>
                      ))}
                    </div>
                    {c.nextReview && new Date(c.nextReview) <= new Date() ? (
                       <span className="text-[10px] font-medium text-amber-400 flex items-center gap-1"><Zap size={10} /> Due</span>
                    ) : (
                       <span className="text-[10px] font-medium text-green-400 flex items-center gap-1"><Check size={10} /> Mastered</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
