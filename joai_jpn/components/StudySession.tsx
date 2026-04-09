
import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { KnowledgePoint } from '../types';
import { KnowledgeCard } from './KnowledgeCard';

interface StudySessionProps {
  items: KnowledgePoint[];
  onComplete: (results: { familiar: KnowledgePoint[], memorable: KnowledgePoint[], unfamiliar: KnowledgePoint[] }) => void;
}

type RatingOption = 'unfamiliar' | 'memorable' | 'familiar';

export const StudySession: React.FC<StudySessionProps> = ({ items, onComplete }) => {
  // Queue state: The active deck
  const [queue, setQueue] = useState<KnowledgePoint[]>([]);
  // Current card being viewed (always the head of queue)
  const [currentCard, setCurrentCard] = useState<KnowledgePoint | null>(null);
  
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Tracking unique items for final reporting
  const [familiarSet, setFamiliarSet] = useState<Set<number>>(new Set());
  const [memorableSet, setMemorableSet] = useState<Set<number>>(new Set());
  const [unfamiliarSet, setUnfamiliarSet] = useState<Set<number>>(new Set());
  
  // State for button interaction animation
  const [selectedOption, setSelectedOption] = useState<RatingOption | null>(null);
  
  // Initialize queue on mount
  useEffect(() => {
    setQueue([...items]);
    if (items.length > 0) {
      setCurrentCard(items[0]);
    }
  }, [items]);

  const handleRate = (rating: RatingOption) => {
    if (!currentCard || selectedOption) return; // Prevent double clicks
    
    // Set visual state immediately
    setSelectedOption(rating);

    // Update Sets (Idempotent add)
    if (rating === 'familiar') {
      setFamiliarSet(prev => new Set(prev).add(currentCard.id));
    } else if (rating === 'memorable') {
      setMemorableSet(prev => new Set(prev).add(currentCard.id));
    } else {
      setUnfamiliarSet(prev => new Set(prev).add(currentCard.id));
    }

    // Delay to show the "Prominent" state before moving next
    setTimeout(() => {
      processNextCard(rating);
    }, 600);
  };

  const processNextCard = (rating: RatingOption) => {
    if (!currentCard) return;

    // Queue Manipulation Logic
    const remainingQueue = queue.slice(1);
    let newQueue: KnowledgePoint[] = [];

    if (rating === 'unfamiliar') {
      // Unfamiliar -> Move to "Bottom of familiar cards" (Interpreted as: Insert soon, e.g., +3 spots)
      const insertIndex = Math.min(remainingQueue.length, 3);
      newQueue = [
        ...remainingQueue.slice(0, insertIndex),
        currentCard,
        ...remainingQueue.slice(insertIndex)
      ];
    } else {
      // Memorable & Familiar -> Move to VERY BOTTOM (End of queue) - effectively done for this pass
      newQueue = [...remainingQueue, currentCard];
    }

    if (rating !== 'unfamiliar') {
       // Don't re-add to newQueue if we want to finish the batch.
       newQueue = remainingQueue;
    }

    // Reset UI state
    setIsFlipped(false);
    setSelectedOption(null);
    
    // Update queue
    setQueue(newQueue);
    
    if (newQueue.length > 0) {
      setCurrentCard(newQueue[0]);
    } else {
      // Batch Complete!
      setCurrentCard(null);
      
      const fList = items.filter(item => familiarSet.has(item.id) || (rating === 'familiar' && item.id === currentCard.id));
      const mList = items.filter(item => memorableSet.has(item.id) || (rating === 'memorable' && item.id === currentCard.id));
      const uList = items.filter(item => unfamiliarSet.has(item.id) || (rating === 'unfamiliar' && item.id === currentCard.id));
      
      onComplete({ familiar: fList, memorable: mList, unfamiliar: uList });
    }
  };

  // Progress Calculation for Tri-Color Bar
  const total = items.length;
  
  // Mutually exclusive counts for visualization logic
  // Red (Priority): Any card ever marked unfamiliar.
  const countRed = unfamiliarSet.size;
  
  // Yellow: Marked memorable, NEVER marked unfamiliar.
  const countYellow = Array.from(memorableSet).filter(id => !unfamiliarSet.has(id)).length;
  
  // Green: Marked familiar, NEVER marked unfamiliar OR memorable.
  const countGreen = Array.from(familiarSet).filter(id => !unfamiliarSet.has(id) && !memorableSet.has(id)).length;
  
  const widthRed = total > 0 ? (countRed / total) * 100 : 0;
  const widthYellow = total > 0 ? (countYellow / total) * 100 : 0;
  const widthGreen = total > 0 ? (countGreen / total) * 100 : 0;

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
           <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
           <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto h-full flex flex-col py-2 relative">
      <div className="flex flex-col mb-4 px-2 shrink-0 space-y-2">
        
        {/* Progress Labels */}
        <div className="flex justify-end items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center space-x-1">
               <Layers size={12} />
               <span>剩余: {queue.length}</span>
            </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
           <div 
             className="h-full bg-red-500 transition-all duration-500 ease-out"
             style={{ width: `${widthRed}%` }}
           ></div>
           <div 
             className="h-full bg-amber-400 transition-all duration-500 ease-out"
             style={{ width: `${widthYellow}%` }}
           ></div>
           <div 
             className="h-full bg-green-500 transition-all duration-500 ease-out"
             style={{ width: `${widthGreen}%` }}
           ></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 perspective-1000">
        <KnowledgeCard 
          key={currentCard.id} 
          data={currentCard} 
          isFlipped={isFlipped} 
          onFlip={() => setIsFlipped(!isFlipped)} 
          interactive={true}
          onRate={handleRate}
          selectedRating={selectedOption}
          onFinishSession={undefined}
        />
      </div>
    </div>
  );
};
